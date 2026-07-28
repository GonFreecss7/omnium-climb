import { useState } from "react";
import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import { InlineMarkdown } from "../components/Prose";
import type { Drill } from "../data/types";

export default function DrillsView() {
  const { guide, t, scrollTarget, clearScrollTarget, favorites, toggleFavorite } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const [randomDrill, setRandomDrill] = useState<Drill | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  function pickRandom() {
    const pool = guide.drills;
    const next = pool[Math.floor(Math.random() * pool.length)]!;
    setRandomDrill(next);
  }

  const section = guide.drillSection;

  const visibleCategories = guide.drillCategories
    .map((cat) => ({
      cat,
      drills: cat.drillIds
        .map((id) => guide.drills.find((d) => d.id === id)!)
        .filter((d) => !favoritesOnly || favorites.has(d.id)),
    }))
    .filter((group) => group.drills.length > 0);

  return (
    <div className="view">
      {section && (
        <div id={`section-${section.number}`}>
          <h1 className="view__heading">{section.title}</h1>
          <p className="view__subheading">
            <InlineMarkdown text={section.intro} />
          </p>
        </div>
      )}

      <div className="random-drill">
        <button type="button" className="button-primary" onClick={pickRandom}>
          {t.drills.randomButton}
        </button>
        {randomDrill && (
          <div className="random-drill__result">
            <span className="mono-label">{t.drills.randomHeading}</span>
            <p className="random-drill__name">{randomDrill.name}</p>
            <p className="random-drill__description">{randomDrill.description}</p>
          </div>
        )}
      </div>

      <div className="filters">
        <div className="filters__group">
          <button
            type="button"
            className={`chip chip--filterable${favoritesOnly ? " chip--active" : ""}`}
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            <span aria-hidden="true">★ </span>
            {t.favorites.filterLabel}
          </button>
        </div>
      </div>

      {favoritesOnly && visibleCategories.length === 0 ? (
        <p className="search-bar__no-results">{t.search.noResults}</p>
      ) : (
        visibleCategories.map(({ cat, drills }) => (
          <section key={cat.id} className="drill-category">
            <h2 className="drill-category__title">{cat.title}</h2>
            <ul className="drill-list">
              {drills.map((drill) => {
                const isFavorite = favorites.has(drill.id);
                return (
                  <li key={drill.id} className="drill-list__item">
                    <div className="drill-list__row">
                      <p className="drill-list__text">
                        <span className="drill-list__name">{drill.name}</span>
                        {" — "}
                        {drill.description}
                      </p>
                      <button
                        type="button"
                        className={`star-toggle${isFavorite ? " star-toggle--active" : ""}`}
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? t.favorites.remove : t.favorites.add}
                        onClick={() => toggleFavorite(drill.id)}
                      >
                        <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {!favoritesOnly &&
              cat.callouts.map((callout, i) => (
                <p key={i} className="prose-callout">
                  <InlineMarkdown text={callout} />
                </p>
              ))}
          </section>
        ))
      )}
    </div>
  );
}
