import { useAppState } from "../state/AppState";
import type { Technique } from "../data/types";
import TechniqueNote from "./TechniqueNote";

interface Props {
  technique: Technique;
  expanded: boolean;
  onToggle: () => void;
}

export default function TechniqueCard({ technique, expanded, onToggle }: Props) {
  const { t, lang, guide, favorites, toggleFavorite, goToEntry } = useAppState();
  const isFavorite = favorites.has(technique.id);
  const relatedDrills = technique.relatedDrills
    .map((id) => guide.drills.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);

  return (
    <li id={technique.id} className="tcard">
      <div className="tcard__row">
        <button
          type="button"
          className="tcard__header"
          aria-expanded={expanded}
          aria-label={`${technique.name}, ${expanded ? t.technique.collapse : t.technique.expand}`}
          onClick={onToggle}
        >
          <span className="tcard__identity">
            <span className="tcard__name">
              {technique.name}
              {technique.nonstandard && (
                <>
                  <span aria-hidden="true">*</span>
                  <span className="visually-hidden">, {t.technique.nonstandardLabel}</span>
                </>
              )}
            </span>
            {lang === "es" && technique.gloss && <span className="tcard__gloss">{technique.gloss}</span>}
          </span>
          <span className={`chip chip--${technique.tag}`}>{t.filters.tagLabels[technique.tag]}</span>
        </button>
        <button
          type="button"
          className={`star-toggle${isFavorite ? " star-toggle--active" : ""}`}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t.favorites.remove : t.favorites.add}
          onClick={() => toggleFavorite(technique.id)}
        >
          <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
        </button>
      </div>

      <p className="tcard__what">{technique.what}</p>

      {expanded && (
        <div className="tcard__details">
          {technique.nonstandard && (
            <p className="tcard__nonstandard-note">
              <span className="mono-label">{t.technique.nonstandardLabel}</span> {guide.nonstandardNote}
            </p>
          )}
          <p>
            <span className="mono-label">{t.technique.howLabel}</span> {technique.how}
          </p>
          <p>
            <span className="mono-label">{t.technique.bestLabel}</span> {technique.best}
          </p>
          {relatedDrills.length > 0 && (
            <div className="related-entries">
              <span className="mono-label">{t.relations.relatedDrills}</span>
              <div className="chip-row">
                {relatedDrills.map((drill) => (
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
          <TechniqueNote techniqueId={technique.id} />
        </div>
      )}
    </li>
  );
}
