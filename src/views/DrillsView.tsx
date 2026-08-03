import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import { normalize } from "../utils/text";
import { InlineMarkdown } from "../components/Prose";
import DrillCard from "../components/DrillCard";
import WarmupGenerator from "../components/WarmupGenerator";
import type { Drill } from "../data/types";

export default function DrillsView() {
  const { guide, t, scrollTarget, clearScrollTarget, favorites, expandRequest, clearExpandRequest } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const [randomDrill, setRandomDrill] = useState<Drill | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showWarmup, setShowWarmup] = useState(false);

  useEffect(() => {
    if (expandRequest?.kind === "drill") {
      setExpandedIds((prev) => new Set(prev).add(expandRequest.id));
      clearExpandRequest();
    }
  }, [expandRequest, clearExpandRequest]);

  function pickRandom() {
    const pool = guide.drills;
    const next = pool[Math.floor(Math.random() * pool.length)]!;
    setRandomDrill(next);
  }

  function toggleExpanded(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  }

  function toggleCategory(id: string) {
    const next = new Set(selectedCategories);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCategories(next);
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategories(new Set());
    setFavoritesOnly(false);
  }

  const hasActiveFilters = selectedCategories.size > 0 || favoritesOnly || query.trim() !== "";
  const normalizedQuery = normalize(query.trim());

  const matches = useMemo(() => {
    return (drill: Drill): boolean => {
      if (favoritesOnly && !favorites.has(drill.id)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(drill.categoryId)) return false;
      if (normalizedQuery === "") return true;
      const haystack = normalize([drill.name, drill.description].join(" "));
      return haystack.includes(normalizedQuery);
    };
  }, [selectedCategories, favoritesOnly, favorites, normalizedQuery]);

  const section = guide.drillSection;

  const visibleCategories = guide.drillCategories
    .map((cat) => ({
      cat,
      drills: cat.drillIds.map((id) => guide.drills.find((d) => d.id === id)!).filter(matches),
    }))
    .filter((group) => group.drills.length > 0);

  const totalVisible = visibleCategories.reduce((n, g) => n + g.drills.length, 0);

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

      <button type="button" className="secondary-button" onClick={() => setShowWarmup(true)}>
        {t.warmup.openButton}
      </button>
      {showWarmup && <WarmupGenerator onClose={() => setShowWarmup(false)} />}

      <div className="search-bar">
        <input
          type="search"
          className="search-bar__input"
          placeholder={t.drills.searchPlaceholder}
          aria-label={t.drills.searchAriaLabel}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
        <div className="filters__group">
          <span className="mono-label filters__label">{t.filters.categoryHeading}</span>
          {guide.drillCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip chip--filterable${selectedCategories.has(cat.id) ? " chip--active" : ""}`}
              aria-pressed={selectedCategories.has(cat.id)}
              onClick={() => toggleCategory(cat.id)}
            >
              {cat.title}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button type="button" className="filters__clear" onClick={clearFilters}>
            {t.filters.clear}
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="mono-label filters__label">{t.filters.activeHeading}</span>
          <div className="chip-row">
            {query.trim() !== "" && (
              <button type="button" className="chip chip--removable" onClick={() => setQuery("")}>
                “{query.trim()}” <span aria-hidden="true">×</span>
                <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
              </button>
            )}
            {favoritesOnly && (
              <button type="button" className="chip chip--removable" onClick={() => setFavoritesOnly(false)}>
                {t.favorites.filterLabel} <span aria-hidden="true">×</span>
                <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
              </button>
            )}
            {[...selectedCategories].map((id) => {
              const cat = guide.drillCategories.find((c) => c.id === id);
              if (!cat) return null;
              return (
                <button key={id} type="button" className="chip chip--removable" onClick={() => toggleCategory(id)}>
                  {cat.title} <span aria-hidden="true">×</span>
                  <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {totalVisible === 0 ? (
        <p className="search-bar__no-results">{t.drills.noResults}</p>
      ) : (
        visibleCategories.map(({ cat, drills }) => (
          <section key={cat.id} className="drill-category">
            <h2 className="drill-category__title">{cat.title}</h2>
            <ul className="drill-list">
              {drills.map((drill) => (
                <DrillCard
                  key={drill.id}
                  drill={drill}
                  expanded={expandedIds.has(drill.id)}
                  onToggle={() => toggleExpanded(drill.id)}
                />
              ))}
            </ul>
            {!hasActiveFilters &&
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
