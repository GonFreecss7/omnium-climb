import { useAppState } from "../state/AppState";
import type { Technique } from "../data/types";
import TechniqueNote from "./TechniqueNote";
import { levelRank, relevance } from "../domain/levels";

interface Props {
  technique: Technique;
  expanded: boolean;
  onToggle: () => void;
}

export default function TechniqueCard({ technique, expanded, onToggle }: Props) {
  const { t, lang, guide, favorites, toggleFavorite, goToEntry, levelInfo, profile } = useAppState();
  const rel = levelInfo ? relevance(technique.level, levelInfo.level) : null;
  const aboveLevel = levelInfo !== null && levelRank(technique.level) > levelRank(levelInfo.level);
  const isFavorite = favorites.has(technique.id);
  const relatedDrills = technique.relatedDrills
    .map((id) => guide.drills.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);

  return (
    <li id={technique.id} className={`tcard${rel ? ` tcard--${rel}` : ""}`}>
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
            {rel && <span className={`tcard__relevance tcard__relevance--${rel}`}>{t.relevance[rel]}</span>}
          </span>
          <span className="tcard__chips">
            <span className={`chip chip--${technique.level}`}>{t.levels[technique.level]}</span>
            {technique.caution && (
              <span className="chip chip--caution" title={t.caution.label}>
                <span aria-hidden="true">!</span>
                <span className="visually-hidden">{t.caution.label}</span>
              </span>
            )}
          </span>
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

      {technique.caution && (aboveLevel || profile?.injured) && (
        <p className="tcard__warning" role="note">
          {profile?.injured ? t.caution.injured : t.caution.aboveLevel}
        </p>
      )}

      {expanded && (
        <div className="tcard__details">
          {technique.caution && (
            <p className="tcard__caution-note">
              <span className="mono-label">{t.caution.label}</span> {guide.cautionNote}
            </p>
          )}
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
