import { useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import { elbowLabels } from "../utils/sessionStats";
import { gradeLabel } from "../domain/grades";
import type { Discipline, GradeScale } from "../domain/grades";
import { computeAnalytics } from "../domain/analytics";
import type { Range } from "../domain/analytics";

const RANGES: Range[] = ["30", "90", "all"];

function shortDate(iso: string, lang: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(new Date(y!, m! - 1, d!));
}

/** Progress panel: headline tiles, send pyramid, hardest-send timeline, weekly volume. */
export default function ProgressStats() {
  const { t, lang, log, profile } = useAppState();
  const s = t.stats;
  const [range, setRange] = useState<Range>("90");
  const a = useMemo(() => computeAnalytics(log, range), [log, range]);
  const scales: Record<Discipline, GradeScale> = { boulder: profile?.boulderScale ?? "V", rope: profile?.ropeScale ?? "French" };
  const pyramidDisciplines = (["boulder", "rope"] as Discipline[]).filter((d) => a.pyramid[d].size > 0);
  const [pyrDisc, setPyrDisc] = useState<Discipline>("boulder");
  const disc = pyramidDisciplines.includes(pyrDisc) ? pyrDisc : (pyramidDisciplines[0] ?? "boulder");

  if (log.length === 0) return null;

  const labels = elbowLabels(t);
  const recentElbow = [...log].slice(0, 5).reverse().map((e) => labels[e.elbow]);

  // Pyramid rows: one per grade label in the climber's scale, hardest on top.
  const rows = new Map<string, { label: string; index: number; sends: number; flashes: number }>();
  for (const [index, v] of a.pyramid[disc]) {
    const label = gradeLabel(index, scales[disc]);
    const r = rows.get(label) ?? { label, index, sends: 0, flashes: 0 };
    r.sends += v.sends;
    r.flashes += v.flashes;
    r.index = Math.max(r.index, index);
    rows.set(label, r);
  }
  const pyramid = [...rows.values()].sort((x, y) => y.index - x.index);
  const maxSends = Math.max(1, ...pyramid.map((r) => r.sends));

  // Timeline geometry (single series, one axis).
  const tl = a.timeline;
  const W = 320;
  const H = 120;
  const PAD = { l: 34, r: 10, t: 10, b: 18 };
  const minI = tl.length ? Math.min(...tl.map((p) => p.index)) : 0;
  const maxI = tl.length ? Math.max(...tl.map((p) => p.index)) : 1;
  const span = Math.max(1, maxI - minI);
  const px = (i: number) => PAD.l + (tl.length <= 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (tl.length - 1));
  const py = (v: number) => PAD.t + ((maxI - v) * (H - PAD.t - PAD.b)) / span;
  const tlScale = tl[0] ? scales[tl[0].discipline] : "V";

  const maxWeek = Math.max(1, ...a.weeks.map((w) => w.climbs));

  return (
    <div className="stats-panel progress">
      <div className="progress__head">
        <span className="mono-label stats-panel__heading">{s.heading}</span>
        <div className="segmented progress__ranges" role="group">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={`segmented__option${range === r ? " segmented__option--active" : ""}`}
              aria-pressed={range === r}
              onClick={() => setRange(r)}
            >
              {s.ranges[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-panel__grid">
        <div className="stats-panel__tile">
          <span className="mono-label">{s.sessionsLogged}</span>
          <span className="stats-panel__value">{a.sessions}</span>
        </div>
        <div className="stats-panel__tile">
          <span className="mono-label">{s.sentOfTried}</span>
          <span className="stats-panel__value">
            {a.sends}
            <span className="stats-panel__of">/{a.climbs}</span>
          </span>
        </div>
        <div className="stats-panel__tile">
          <span className="mono-label">{s.highestGrade}</span>
          <span className="stats-panel__value">
            {a.best.boulder === null && a.best.rope === null && "—"}
            {a.best.boulder !== null && gradeLabel(a.best.boulder, scales.boulder)}
            {a.best.boulder !== null && a.best.rope !== null && " · "}
            {a.best.rope !== null && gradeLabel(a.best.rope, scales.rope)}
          </span>
        </div>
        <div className="stats-panel__tile">
          <span className="mono-label">{s.flashRate}</span>
          <span className="stats-panel__value">{a.flashRate === null ? "—" : `${Math.round(a.flashRate * 100)}%`}</span>
          {a.attemptsPerSend !== null && (
            <span className="stats-panel__sub">
              {a.attemptsPerSend.toFixed(1)} {s.attemptsPerSend.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      <section className="progress__section">
        <div className="progress__section-head">
          <h3 className="progress__title">{s.pyramid}</h3>
          {pyramidDisciplines.length > 1 && (
            <div className="segmented">
              {pyramidDisciplines.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`segmented__option${disc === d ? " segmented__option--active" : ""}`}
                  aria-pressed={disc === d}
                  onClick={() => setPyrDisc(d)}
                >
                  {d === "boulder" ? t.onboarding.boulder : t.onboarding.rope.split(" ")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
        {pyramid.length === 0 ? (
          <p className="progress__empty">{s.pyramidEmpty}</p>
        ) : (
          <ul className="pyramid">
            {pyramid.map((r) => (
              <li key={r.label} className="pyramid__row" title={`${r.label}: ${r.sends}${r.flashes ? ` (${s.flashes(r.flashes)})` : ""}`}>
                <span className="pyramid__grade">{r.label}</span>
                <span className="pyramid__track">
                  <span className="pyramid__bar" style={{ width: `${(r.sends / maxSends) * 100}%` }} />
                </span>
                <span className="pyramid__count">
                  {r.sends}
                  {r.flashes > 0 && <span className="pyramid__flash"> · {s.flashes(r.flashes)}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tl.length >= 2 && (
        <section className="progress__section">
          <h3 className="progress__title">{s.timeline}</h3>
          <svg className="timeline" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={s.timeline}>
            {[maxI, minI].map((v) => (
              <g key={v}>
                <line className="timeline__grid" x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} />
                <text className="timeline__axis" x={PAD.l - 6} y={py(v) + 4} textAnchor="end">
                  {gradeLabel(v, tlScale)}
                </text>
              </g>
            ))}
            <polyline className="timeline__line" points={tl.map((p, i) => `${px(i)},${py(p.index)}`).join(" ")} />
            {tl.map((p, i) => (
              <g key={`${p.date}-${i}`} className="timeline__pt">
                <circle className="timeline__hit" cx={px(i)} cy={py(p.index)} r={10}>
                  <title>{`${shortDate(p.date, lang)} · ${gradeLabel(p.index, scales[p.discipline])}`}</title>
                </circle>
                <circle className="timeline__dot" cx={px(i)} cy={py(p.index)} r={i === tl.length - 1 ? 4.5 : 3} />
              </g>
            ))}
            <text className="timeline__axis" x={PAD.l} y={H - 3}>
              {shortDate(tl[0]!.date, lang)}
            </text>
            <text className="timeline__axis" x={W - PAD.r} y={H - 3} textAnchor="end">
              {shortDate(tl[tl.length - 1]!.date, lang)}
            </text>
          </svg>
        </section>
      )}

      <section className="progress__section">
        <h3 className="progress__title">{s.weekly}</h3>
        <div className="weeks" role="img" aria-label={s.weekly}>
          {a.weeks.map((w, i) => (
            <div key={w.start} className="weeks__col" title={s.weekTooltip(shortDate(w.start, lang), w.climbs, w.sends)}>
              <span className="weeks__value">{w.climbs > 0 && (i === a.weeks.length - 1 || w.climbs === maxWeek) ? w.climbs : ""}</span>
              <span className="weeks__bar" style={{ height: `${(w.climbs / maxWeek) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="weeks__axis">
          <span>{shortDate(a.weeks[0]!.start, lang)}</span>
          <span>{shortDate(a.weeks[a.weeks.length - 1]!.start, lang)}</span>
        </div>
      </section>

      {(a.boardClimbs > 0 || a.gyms.length > 0) && (
        <section className="progress__section progress__breakdown">
          <p className="progress__line">{s.wallVsBoard(a.wallClimbs, a.boardClimbs)}</p>
          {a.boards.length > 0 && (
            <div className="progress__list">
              <span className="mono-label">{s.topBoards}</span>
              {a.boards.map((b) => (
                <span key={b.name} className="progress__item">
                  {b.name} <span className="progress__count">×{b.count}</span>
                </span>
              ))}
            </div>
          )}
          {a.gyms.length > 0 && (
            <div className="progress__list">
              <span className="mono-label">{s.topGyms}</span>
              {a.gyms.map((g) => (
                <span key={g.name} className="progress__item">
                  {g.name} <span className="progress__count">×{g.count}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="stats-panel__sequence">
        <span className="mono-label">{s.recentElbow}</span>
        <span className="stats-panel__sequence-values">{recentElbow.join(" → ")}</span>
      </div>
    </div>
  );
}
