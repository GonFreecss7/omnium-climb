import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../state/AppState";
import Modal from "./Modal";
import Icon from "./Icon";
import type { WorkoutTimer } from "../data/types";

type PhaseKind = "prep" | "hang" | "rest" | "setRest" | "done";

interface Phase {
  kind: PhaseKind;
  duration: number;
  set: number;
  rep: number;
}

/** Expands a protocol into its sequence of timed phases. Zero-length rests are skipped. */
export function buildPhases(cfg: WorkoutTimer): Phase[] {
  const out: Phase[] = [];
  if (cfg.prep > 0) out.push({ kind: "prep", duration: cfg.prep, set: 1, rep: 1 });
  for (let s = 1; s <= cfg.sets; s++) {
    for (let r = 1; r <= cfg.reps; r++) {
      out.push({ kind: "hang", duration: cfg.hang, set: s, rep: r });
      if (r < cfg.reps && cfg.rest > 0) out.push({ kind: "rest", duration: cfg.rest, set: s, rep: r });
    }
    if (s < cfg.sets && cfg.setRest > 0) out.push({ kind: "setRest", duration: cfg.setRest, set: s, rep: cfg.reps });
  }
  out.push({ kind: "done", duration: 0, set: cfg.sets, rep: cfg.reps });
  return out;
}

function fmt(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : String(s);
}

/**
 * Full-screen interval timer for hangboard protocols. Beeps on the last three
 * seconds and on every phase change, vibrates where supported, and keeps the
 * screen awake while running. Timing is wall-clock based, so a throttled tab
 * doesn't drift.
 */
export default function HangTimer({ config, title, onClose }: { config: WorkoutTimer; title: string; onClose: () => void }) {
  const { t } = useAppState();
  const tm = t.timer;
  const phases = useMemo(() => buildPhases(config), [config]);
  const totalSeconds = useMemo(() => phases.reduce((n, p) => n + p.duration, 0), [phases]);

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(phases[0]!.duration);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const endAt = useRef<number | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const lastBeep = useRef<number>(-1);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);

  const phase = phases[index]!;

  const beep = useCallback(
    (freq: number, ms: number) => {
      if (!sound || !audio.current) return;
      const ctx = audio.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + ms / 1000 + 0.02);
    },
    [sound],
  );

  const enterPhase = useCallback(
    (i: number) => {
      const p = phases[i]!;
      setIndex(i);
      setRemaining(p.duration);
      lastBeep.current = -1;
      endAt.current = p.kind === "done" ? null : performance.now() + p.duration * 1000;
      if (p.kind === "hang") beep(1046, 420);
      else if (p.kind === "done") beep(784, 700);
      else beep(523, 320);
      if ("vibrate" in navigator) navigator.vibrate?.(p.kind === "hang" ? [120, 60, 120] : 200);
      if (p.kind === "done") setRunning(false);
    },
    [phases, beep],
  );

  // Tick.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (endAt.current === null) return;
      const left = (endAt.current - performance.now()) / 1000;
      setRemaining(left);
      const whole = Math.ceil(left);
      if (whole <= 3 && whole >= 1 && whole !== lastBeep.current) {
        lastBeep.current = whole;
        beep(880, 110);
      }
      if (left <= 0) enterPhase(index + 1);
    }, 50);
    return () => window.clearInterval(id);
  }, [running, index, beep, enterPhase]);

  // Keep the screen on while running.
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    if (running && nav.wakeLock) {
      nav.wakeLock
        .request("screen")
        .then((l) => (wakeLock.current = l))
        .catch(() => undefined);
    }
    return () => {
      wakeLock.current?.release().catch(() => undefined);
      wakeLock.current = null;
    };
  }, [running]);

  useEffect(() => () => void audio.current?.close().catch(() => undefined), []);

  function start() {
    if (!audio.current) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) audio.current = new Ctx();
    }
    void audio.current?.resume();
    if (phase.kind === "done") {
      reset();
      return;
    }
    endAt.current = performance.now() + remaining * 1000;
    if (index === 0 && remaining === phase.duration) enterPhase(0);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
    endAt.current = null;
  }

  function reset() {
    setRunning(false);
    endAt.current = null;
    setIndex(0);
    setRemaining(phases[0]!.duration);
  }

  function skip() {
    if (phase.kind === "done") return;
    enterPhase(index + 1);
    if (!running) endAt.current = null;
  }

  const elapsedBefore = phases.slice(0, index).reduce((n, p) => n + p.duration, 0);
  const totalLeft = Math.max(0, totalSeconds - elapsedBefore - (phase.duration - Math.max(0, remaining)));
  const phaseProgress = phase.duration > 0 ? 1 - Math.max(0, remaining) / phase.duration : 1;

  return (
    <Modal ariaLabel={title}>
      <div className={`modal hang-timer hang-timer--${phase.kind}`}>
        <div className="modal__header">
          <h2 className="modal__title hang-timer__title">{title}</h2>
          <button type="button" className="modal__close" aria-label={tm.close} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="modal__body hang-timer__body">
          <p className="hang-timer__phase" aria-live="assertive">
            {tm.phases[phase.kind]}
          </p>
          <p className="hang-timer__count" aria-hidden={phase.kind === "done"}>
            {phase.kind === "done" ? "✓" : fmt(remaining)}
          </p>
          <div className="hang-timer__bar" aria-hidden="true">
            <span style={{ width: `${phaseProgress * 100}%` }} />
          </div>
          <dl className="hang-timer__meta">
            <div>
              <dt>{tm.set}</dt>
              <dd>
                {phase.set}/{config.sets}
              </dd>
            </div>
            <div>
              <dt>{tm.rep}</dt>
              <dd>
                {phase.rep}/{config.reps}
              </dd>
            </div>
            <div>
              <dt>{tm.left}</dt>
              <dd>{fmt(totalLeft)}</dd>
            </div>
          </dl>
          <div className="hang-timer__controls">
            <button type="button" className="secondary-button" onClick={reset}>
              {tm.reset}
            </button>
            <button type="button" className="button-primary hang-timer__main" onClick={running ? pause : start}>
              {running ? tm.pause : phase.kind === "done" ? tm.again : index === 0 && remaining === phase.duration ? tm.start : tm.resume}
            </button>
            <button type="button" className="secondary-button" onClick={skip} disabled={phase.kind === "done"}>
              {tm.skip}
            </button>
          </div>
          <button type="button" className="filters__clear hang-timer__sound" onClick={() => setSound((v) => !v)} aria-pressed={sound}>
            {sound ? tm.soundOn : tm.soundOff}
          </button>
        </div>
      </div>
    </Modal>
  );
}
