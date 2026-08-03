import { useAppState } from "../state/AppState";

export default function ProgressionsView() {
  const { t, guide, goToEntry } = useAppState();

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
            <li key={stage.id} className="progression-stage">
              <span className="mono-label progression-stage__order">{stage.order}</span>
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
                        className={`chip chip--filterable chip--${tech.tag}`}
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
