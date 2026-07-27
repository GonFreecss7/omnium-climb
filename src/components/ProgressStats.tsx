import { useAppState } from "../state/AppState";
import { computeSessionStats, elbowLabels, formatGrade } from "../utils/sessionStats";

export default function ProgressStats() {
  const { t, log } = useAppState();

  if (log.length === 0) return null;

  const stats = computeSessionStats(log);
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
            {stats.highestGrade !== null ? formatGrade(stats.highestGrade) : t.stats.noData}
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
