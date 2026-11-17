import { useAppState } from "../state/AppState";
import { computeSessionStats, elbowLabels } from "../utils/sessionStats";
import { gradeLabel } from "../domain/grades";

export default function ProgressStats() {
  const { t, log, profile } = useAppState();

  if (log.length === 0) return null;

  const scales = { boulder: profile?.boulderScale ?? "V", rope: profile?.ropeScale ?? "French" } as const;
  const stats = computeSessionStats(log, scales);
  const labels = elbowLabels(t);

  return (
    <div className="stats-panel">
      <span className="mono-label stats-panel__heading">{t.stats.heading}</span>
      <div className="stats-panel__grid">
        <div className="stats-panel__tile">
          <span className="mono-label">{t.stats.sessionsLogged}</span>
          <span className="stats-panel__value">{stats.sessionsLogged}</span>
        </div>

        <div className="stats-panel__tile">
          <span className="mono-label">{t.stats.highestGrade}</span>
          <span className="stats-panel__value">
            {stats.highestBoulder === null && stats.highestRope === null && t.stats.noData}
            {stats.highestBoulder !== null && gradeLabel(stats.highestBoulder, scales.boulder)}
            {stats.highestBoulder !== null && stats.highestRope !== null && " · "}
            {stats.highestRope !== null && gradeLabel(stats.highestRope, scales.rope)}
          </span>
        </div>

        {stats.mostUsedDrill && (
          <div className="stats-panel__tile">
            <span className="mono-label">{t.stats.mostUsedDrill}</span>
            <span className="stats-panel__value stats-panel__value--text">
              {stats.mostUsedDrill.name} <span className="stats-panel__count">×{stats.mostUsedDrill.count}</span>
            </span>
          </div>
        )}
      </div>

      <div className="stats-panel__sequence">
        <span className="mono-label">{t.stats.recentGrades}</span>
        <span className="stats-panel__sequence-values">{stats.recentGradeLabels.join(" → ")}</span>
      </div>

      <div className="stats-panel__sequence">
        <span className="mono-label">{t.stats.recentElbow}</span>
        <span className="stats-panel__sequence-values">
          {stats.recentElbow.map((e) => labels[e]).join(" → ")}
        </span>
      </div>
    </div>
  );
}
