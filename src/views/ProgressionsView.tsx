import { useAppState } from "../state/AppState";
import { levelRank } from "../domain/levels";

export default function ProgressionsView() {
  const { t, guide, goToEntry, levelInfo } = useAppState();
  const currentStageId = levelInfo
    ? guide.progressionStages.find((s) => levelRank(s.level) >= levelRank(levelInfo.level))?.id ?? null
    : null;
  const currentOrder = guide.progressionStages.find((s) => s.id === currentStageId)?.order ?? Infinity;

  return (
    <div className="view">
      <h1 className="view__heading">{t.progressionsView.heading}</h1>
      <p className="view__subheading">{t.progressionsView.subheading}</p>

      <ol className="progression-list">
        {guide.progressionStages.map((stage) => {
          const techniques = stage.techniqueIds
            .map((id) => guide.techniques.find((t2) => t2.id === id))
            .filter((t2): t2 is NonNullable<typeof t2> => t2 !== undefined);
          const drills = stage.drillIds
            .map((id) => guide.drills.find((d) => d.id === id))
            .filter((d): d is NonNullable<typeof d> => d !== undefined);

          return (
            <li
              key={stage.id}
              className={`progression-stage${stage.id === currentStageId ? " progression-stage--current" : ""}${
                levelInfo && stage.order < currentOrder ? " progression-stage--past" : ""
              }`}
            >
              <span className="mono-label progression-stage__order">
                {stage.order}
                <span className={`chip chip--${stage.level} progression-stage__level`}>{t.levels[stage.level]}</span>
                {stage.id === currentStageId && <span className="progression-stage__you">{t.progressionsView.yourStage}</span>}
              </span>
              <h2 className="progression-stage__title">{stage.title}</h2>
              <p className="progression-stage__summary">{stage.summary}</p>

              {techniques.length > 0 && (
                <div className="related-entries">
                  <span className="mono-label">{t.progressionsView.techniquesLabel}</span>
                  <div className="chip-row">
                    {techniques.map((tech) => (
                      <button
                        key={tech.id}
                        type="button"
                        className={`chip chip--filterable chip--${tech.level}`}
                        onClick={() => goToEntry("technique", tech.id)}
                      >
                        {tech.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {drills.length > 0 && (
                <div className="related-entries">
                  <span className="mono-label">{t.progressionsView.drillsLabel}</span>
                  <div className="chip-row">
                    {drills.map((drill) => (
                      <button
                        key={drill.id}
                        type="button"
                        className="chip chip--filterable"
                        onClick={() => goToEntry("drill", drill.id)}
                      >
                        {drill.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
