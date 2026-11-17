import { useState } from "react";
import { useAppState } from "../state/AppState";
import Prose from "../components/Prose";
import HangTimer from "../components/HangTimer";
import { levelRank, relevance } from "../domain/levels";
import { usePersistentState } from "../hooks/usePersistentState";
import type { Workout, WorkoutTimer } from "../data/types";

const CUSTOM_DEFAULT: WorkoutTimer = { prep: 10, hang: 10, rest: 5, reps: 6, sets: 3, setRest: 180 };
const FIELDS: Array<{ key: keyof WorkoutTimer; min: number; max: number; step: number }> = [
  { key: "hang", min: 1, max: 120, step: 1 },
  { key: "rest", min: 0, max: 300, step: 1 },
  { key: "reps", min: 1, max: 30, step: 1 },
  { key: "sets", min: 1, max: 20, step: 1 },
  { key: "setRest", min: 0, max: 900, step: 15 },
  { key: "prep", min: 0, max: 60, step: 5 },
];

function isTimer(v: unknown): v is WorkoutTimer {
  return !!v && typeof v === "object" && FIELDS.every((f) => typeof (v as Record<string, unknown>)[f.key] === "number");
}

export default function StrengthView() {
  const { guide, t, levelInfo, profile } = useAppState();
  const s = t.strength;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState<{ title: string; config: WorkoutTimer } | null>(null);
  const [custom, setCustom] = usePersistentState<WorkoutTimer>("cg.timerCustom", () => CUSTOM_DEFAULT, isTimer);

  const section = guide.workoutSection;
  if (!section) return null;

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function card(w: Workout) {
    const rel = levelInfo ? relevance(w.level, levelInfo.level) : null;
    const above = levelInfo !== null && levelRank(w.level) > levelRank(levelInfo.level);
    const expanded = open.has(w.id);
    return (
      <li key={w.id} id={w.id} className={`tcard${rel ? ` tcard--${rel}` : ""}`}>
        <button type="button" className="tcard__header" aria-expanded={expanded} onClick={() => toggle(w.id)}>
          <span className="tcard__identity">
            <span className="tcard__name">{w.name}</span>
            {rel && <span className={`tcard__relevance tcard__relevance--${rel}`}>{t.relevance[rel]}</span>}
          </span>
          <span className="tcard__chips">
            {w.caution && (
              <span className="tape tape--caution" title={t.caution.label}>
                <span className="visually-hidden">{t.caution.label}</span>
              </span>
            )}
            <span className={`tape tape--${w.level}`}>{t.levels[w.level]}</span>
          </span>
        </button>
        <p className="workout__protocol">{s.protocol(w.timer)}</p>
        <p className="tcard__what">{w.what}</p>
        {w.caution && (above || profile?.injured) && (
          <p className="tcard__warning" role="note">
            {profile?.injured ? t.caution.injured : t.caution.aboveLevel}
          </p>
        )}
        {expanded && (
          <div className="tcard__details">
            <p>
              <span className="mono-label">{s.how}</span> {w.how}
            </p>
            <p>
              <span className="mono-label">{s.load}</span> {w.load}
            </p>
            <div>
              <span className="mono-label">{s.sources}</span>
              <ul className="workout__sources">
                {w.sources.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {new URL(url).hostname.replace(/^www\./, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <button
          type="button"
          className="secondary-button workout__start"
          onClick={() => setRunning({ title: w.name, config: w.timer })}
        >
          {s.startTimer}
        </button>
      </li>
    );
  }

  return (
    <>
      <section id={`section-${section.number}`} className="guide-section strength">
        <h2 className="guide-section__title">
          <span className="guide-section__num">§{section.number}</span>
          {section.title}
        </h2>
        <Prose body={section.intro} />
      </section>

      <ul className="tcard-list workout-list">{guide.workouts.map(card)}</ul>

      <section className="custom-timer">
        <h3 className="custom-timer__title">{s.customTitle}</h3>
        <p className="custom-timer__hint">{s.customHint}</p>
        <div className="custom-timer__grid">
          {FIELDS.map((f) => (
            <div key={f.key} className="custom-timer__field">
              <span className="mono-label">{s.fields[f.key]}</span>
              <div className="stepper">
                <button
                  type="button"
                  aria-label={`− ${s.fields[f.key]}`}
                  onClick={() => setCustom((c) => ({ ...c, [f.key]: Math.max(f.min, c[f.key] - f.step) }))}
                >
                  −
                </button>
                <span>{custom[f.key]}</span>
                <button
                  type="button"
                  aria-label={`+ ${s.fields[f.key]}`}
                  onClick={() => setCustom((c) => ({ ...c, [f.key]: Math.min(f.max, c[f.key] + f.step) }))}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="workout__protocol">{s.protocol(custom)}</p>
        <button type="button" className="button-primary" onClick={() => setRunning({ title: s.customTitle, config: custom })}>
          {s.startTimer}
        </button>
      </section>

      {running && <HangTimer title={running.title} config={running.config} onClose={() => setRunning(null)} />}
    </>
  );
}
