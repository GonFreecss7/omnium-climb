import { useAppState } from "../state/AppState";
import type { Drill } from "../data/types";
import Icon from "./Icon";

interface Props {
  drill: Drill;
  expanded: boolean;
  onToggle: () => void;
}

export default function DrillCard({ drill, expanded, onToggle }: Props) {
  const { t, guide, favorites, toggleFavorite, goToEntry } = useAppState();
  const isFavorite = favorites.has(drill.id);
  const relatedTechniques = drill.relatedTechniques
    .map((id) => guide.techniques.find((tech) => tech.id === id))
    .filter((tech): tech is NonNullable<typeof tech> => tech !== undefined);
  const hasRelated = relatedTechniques.length > 0;

  return (
    <li id={drill.id} className="drill-list__item">
      <div className="drill-list__row">
        {hasRelated ? (
          <button
            type="button"
            className="drill-list__header"
            aria-expanded={expanded}
            aria-label={`${drill.name}, ${expanded ? t.technique.collapse : t.technique.expand}`}
            onClick={onToggle}
          >
            <span className="drill-list__text">
              <span className="drill-list__name">{drill.name}</span>
              <span className="drill-list__description">{drill.description}</span>
            </span>
          </button>
        ) : (
          <span className="drill-list__text">
            <span className="drill-list__name">{drill.name}</span>
            <span className="drill-list__description">{drill.description}</span>
          </span>
        )}
        <button
          type="button"
          className={`star-toggle${isFavorite ? " star-toggle--active" : ""}`}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t.favorites.remove : t.favorites.add}
          onClick={() => toggleFavorite(drill.id)}
        >
          <Icon name="star" filled={isFavorite} size={20} />
        </button>
      </div>
      {expanded && hasRelated && (
        <div className="related-entries related-entries--drill">
          <span className="mono-label">{t.relations.relatedTechniques}</span>
          <div className="chip-row">
            {relatedTechniques.map((tech) => (
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
    </li>
  );
}
