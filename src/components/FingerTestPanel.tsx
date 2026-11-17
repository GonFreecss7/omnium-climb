import { useState } from "react";
import { useAppState } from "../state/AppState";
import { usePersistentState } from "../hooks/usePersistentState";
import { todayLocalISO } from "../utils/sessionStats";
import {
  LATTICE_PRESCRIPTIONS,
  comparableHistory,
  harnessLoadAt,
  isFingerTestList,
  percentBW,
  sortTests,
  totalLoad,
} from "../domain/fingerTests";
import type { FingerTest, TestGrip } from "../domain/fingerTests";

function shortDate(iso: string, lang: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString(lang === "es" ? "es-CL" : "en-GB", { day: "numeric", month: "short" });
}

const kg = (n: number) => `${Math.round(n * 10) / 10} kg`;
const pct = (n: number) => `${Math.round(n * 10) / 10}%`;

/** Logged finger-strength tests: latest score, trend, derived training loads, history. */
export default function FingerTestPanel() {
  const { t, lang, profile, saveProfile } = useAppState();
  const s = t.fingerTest;
  const [tests, setTests] = usePersistentState<FingerTest[]>("cg.fingerTests", () => [], isFingerTestList);
  const sorted = sortTests(tests);
  const latest = sorted[0] ?? null;
  const history = comparableHistory(tests);
  const previous = history.length >= 2 ? history[history.length - 2]! : null;

  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocalISO());
  const [bw, setBw] = useState(String(profile?.weightKg ?? latest?.bodyweightKg ?? ""));
  const [mode, setMode] = useState<"add" | "remove">(latest && latest.addedKg < 0 ? "remove" : "add");
  const [amount, setAmount] = useState(latest ? String(Math.abs(latest.addedKg)) : "0");
  const [edge, setEdge] = useState(String(latest?.edgeMm ?? 20));
  const [grip, setGrip] = useState<TestGrip>(latest?.grip ?? "half");

  const bwNum = Number(bw.replace(",", "."));
  const amountNum = Number(amount.replace(",", "."));
  const edgeNum = Number(edge);
  const valid = bwNum >= 25 && bwNum <= 250 && amountNum >= 0 && amountNum < bwNum * 2 && edgeNum >= 4 && edgeNum <= 60 && date !== "";
  const draftTotal = valid ? bwNum + (mode === "add" ? amountNum : -amountNum) : null;

  function save() {
    if (!valid) return;
    const entry: FingerTest = {
      id: `${Date.now()}`,
      date,
      bodyweightKg: bwNum,
      addedKg: mode === "add" ? amountNum : -amountNum,
      edgeMm: edgeNum,
      grip,
    };
    setTests((prev) => [entry, ...prev]);
    // The newest test carries the climber's current bodyweight — keep the profile in step.
    if (profile && (!latest || date >= latest.date) && profile.weightKg !== bwNum) {
      saveProfile({ ...profile, weightKg: bwNum });
    }
    setFormOpen(false);
  }

  function remove(id: string) {
    setTests((prev) => prev.filter((x) => x.id !== id));
    setConfirmDelete(null);
  }

  const currentBw = profile?.weightKg ?? latest?.bodyweightKg ?? null;

  // Chart geometry: one series (% bodyweight), one axis.
  const W = 320;
  const H = 110;
  const PAD = { l: 40, r: 10, t: 10, b: 18 };
  const vals = history.map(percentBW);
  const lo = Math.floor(Math.min(...vals) - 2);
  const hi = Math.ceil(Math.max(...vals) + 2);
  const px = (i: number) => PAD.l + (history.length <= 1 ? 0 : (i * (W - PAD.l - PAD.r)) / (history.length - 1));
  const py = (v: number) => PAD.t + ((hi - v) * (H - PAD.t - PAD.b)) / Math.max(1, hi - lo);

  return (
    <section className="ftest" aria-labelledby="ftest-title">
      <div className="ftest__head">
        <h3 id="ftest-title" className="custom-timer__title">
          {s.title}
        </h3>
        {!formOpen && (
          <button type="button" className="secondary-button ftest__add" onClick={() => setFormOpen(true)}>
            {s.log}
          </button>
        )}
      </div>

      {!latest && !formOpen && <p className="custom-timer__hint">{s.empty}</p>}

      {latest && (
        <>
          <div className="ftest__score">
            <span className="ftest__pct">{pct(percentBW(latest))}</span>
            <span className="ftest__unit">{s.ofBodyweight}</span>
          </div>
          <p className="ftest__meta">
            {s.summary(kg(totalLoad(latest)), latest.edgeMm, s.grips[latest.grip], shortDate(latest.date, lang))}
            {previous && (
              <>
                {" · "}
                <strong>{s.delta(Math.round((percentBW(latest) - percentBW(previous)) * 10) / 10)}</strong>
              </>
            )}
          </p>

          {history.length >= 2 && (
            <svg className="timeline ftest__chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={s.chartLabel}>
              {[hi, lo].map((v) => (
                <g key={v}>
                  <line className="timeline__grid" x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} />
                  <text className="timeline__axis" x={PAD.l - 6} y={py(v) + 4} textAnchor="end">
                    {v}%
                  </text>
                </g>
              ))}
              <polyline className="timeline__line" points={history.map((h, i) => `${px(i)},${py(percentBW(h))}`).join(" ")} />
              {history.map((h, i) => (
                <g key={h.id} className="timeline__pt">
                  <circle className="timeline__hit" cx={px(i)} cy={py(percentBW(h))} r={10}>
                    <title>{`${shortDate(h.date, lang)} · ${pct(percentBW(h))} · ${kg(totalLoad(h))}`}</title>
                  </circle>
                  <circle className="timeline__dot" cx={px(i)} cy={py(percentBW(h))} r={i === history.length - 1 ? 4.5 : 3} />
                </g>
              ))}
              <text className="timeline__axis" x={PAD.l} y={H - 3}>
                {shortDate(history[0]!.date, lang)}
              </text>
              <text className="timeline__axis" x={W - PAD.r} y={H - 3} textAnchor="end">
                {shortDate(history[history.length - 1]!.date, lang)}
              </text>
            </svg>
          )}

          <div className="ftest__loads">
            <span className="mono-label">{s.loadsTitle(currentBw !== null ? kg(currentBw) : "—")}</span>
            <ul>
              {LATTICE_PRESCRIPTIONS.map((p) => {
                const load = harnessLoadAt(latest, p.fraction, currentBw ?? latest.bodyweightKg);
                return (
                  <li key={p.id}>
                    <span>
                      <strong>{s.prescriptions[p.id].name}</strong>
                      <span className="ftest__dose">
                        {s.prescriptions[p.id].dose} · {Math.round(p.fraction * 100)}%
                      </span>
                    </span>
                    <span className="ftest__load">{load === 0 ? s.bodyweightOnly : load > 0 ? `+${kg(load)}` : s.pulley(kg(-load))}</span>
                  </li>
                );
              })}
            </ul>
            <p className="ftest__source">
              {s.loadsSource}{" "}
              <a
                href="https://latticetraining.com/app/uploads/2018/06/1528799872597_180503_Lattice-Testing-Training-Rung-Instructions.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                latticetraining.com
              </a>
            </p>
          </div>
        </>
      )}

      {formOpen && (
        <div className="ftest__form">
          <label className="ftest__field">
            <span className="mono-label">{s.date}</span>
            <input type="date" className="text-input" value={date} max={todayLocalISO()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="ftest__field">
            <span className="mono-label">{s.bodyweight}</span>
            <input type="number" inputMode="decimal" step="0.1" className="text-input" value={bw} onChange={(e) => setBw(e.target.value)} />
          </label>
          <div className="ftest__field ftest__field--wide">
            <span className="mono-label">{s.harness}</span>
            <div className="ftest__harness">
              <div className="segmented" role="group">
                {(["add", "remove"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    className={`segmented__option${mode === m ? " segmented__option--active" : ""}`}
                    onClick={() => setMode(m)}
                  >
                    {s.modes[m]}
                  </button>
                ))}
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                className="text-input"
                aria-label={s.harness}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <label className="ftest__field">
            <span className="mono-label">{s.edge}</span>
            <input type="number" inputMode="numeric" className="text-input" value={edge} onChange={(e) => setEdge(e.target.value)} />
          </label>
          <div className="ftest__field ftest__field--wide">
            <span className="mono-label">{s.grip}</span>
            <div className="segmented" role="group">
              {(["half", "open"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={grip === g}
                  className={`segmented__option${grip === g ? " segmented__option--active" : ""}`}
                  onClick={() => setGrip(g)}
                >
                  {s.grips[g]}
                </button>
              ))}
            </div>
          </div>
          <p className="ftest__preview ftest__field--wide">
            {draftTotal !== null ? s.preview(kg(draftTotal), pct((draftTotal / bwNum) * 100)) : s.invalid}
          </p>
          <div className="ftest__actions ftest__field--wide">
            <button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>
              {s.cancel}
            </button>
            <button type="button" className="button-primary" disabled={!valid} onClick={save}>
              {s.save}
            </button>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <details className="ftest__history">
          <summary>{s.history(sorted.length)}</summary>
          <ul>
            {sorted.map((x) => (
              <li key={x.id}>
                <span className="ftest__hdate">{shortDate(x.date, lang)}</span>
                <span className="ftest__hval">{pct(percentBW(x))}</span>
                <span className="ftest__hmeta">
                  {kg(totalLoad(x))} · {x.edgeMm} mm · {s.grips[x.grip]}
                </span>
                {confirmDelete === x.id ? (
                  <button type="button" className="filters__clear ftest__del ftest__del--confirm" onClick={() => remove(x.id)}>
                    {s.confirmDelete}
                  </button>
                ) : (
                  <button type="button" className="filters__clear ftest__del" onClick={() => setConfirmDelete(x.id)}>
                    {s.delete}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
