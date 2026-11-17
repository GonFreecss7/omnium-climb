import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import { normalize } from "../utils/text";
import TechniqueCard from "../components/TechniqueCard";
import type { Level, Technique } from "../data/types";
import { LEVELS, levelRank } from "../domain/levels";

export default function TechniquesView() {
  const { guide, t, scrollTarget, clearScrollTarget, favorites, expandRequest, clearExpandRequest, levelInfo } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const [query, setQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<Set<Level>>(new Set());
  const [cautionOnly, setCautionOnly] = useState(false);
  const [forMyLevel, setForMyLevel] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [randomTechnique, setRandomTechnique] = useState<Technique | null>(null);

  useEffect(() => {
    if (expandRequest?.kind === "technique") {
      setExpandedIds((prev) => new Set(prev).add(expandRequest.id));
      clearExpandRequest();
    }
  }, [expandRequest, clearExpandRequest]);

  const hasActiveFilters =
    selectedLevels.size > 0 ||
    selectedCategories.size > 0 ||
    favoritesOnly ||
    cautionOnly ||
    (forMyLevel && levelInfo !== null) ||
    query.trim() !== "";

  function toggleInSet<T>(set: Set<T>, value: T, setState: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setState(next);
  }

  function toggleExpanded(id: string) {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  }

  function clearFilters() {
    setQuery("");
    setSelectedLevels(new Set());
    setCautionOnly(false);
    setForMyLevel(false);
    setSelectedCategories(new Set());
    setFavoritesOnly(false);
  }

  function pickRandomTechnique() {
    // With a profile, today's technique comes from the climber's band or the next one up.
    const pool = levelInfo
      ? guide.techniques.filter((tech) => {
          const d = levelRank(tech.level) - levelRank(levelInfo.level);
          return d === 0 || d === 1;
        })
      : guide.techniques;
    if (pool.length === 0) return;
    const next = pool[Math.floor(Math.random() * pool.length)]!;
    setRandomTechnique(next);
  }

  const normalizedQuery = normalize(query.trim());

  const matches = useMemo(() => {
    return (technique: Technique): boolean => {
      if (favoritesOnly && !favorites.has(technique.id)) return false;
      if (selectedLevels.size > 0 && !selectedLevels.has(technique.level)) return false;
      if (cautionOnly && !technique.caution) return false;
      if (forMyLevel && levelInfo) {
        const d = levelRank(technique.level) - levelRank(levelInfo.level);
        if (d !== 0 && d !== 1) return false;
      }
      if (selectedCategories.size > 0 && !selectedCategories.has(technique.categoryId)) return false;
      if (normalizedQuery === "") return true;
      const haystack = normalize(
        [technique.name, technique.gloss ?? "", technique.what, technique.how, technique.best].join(" "),
      );
      return haystack.includes(normalizedQuery);
    };
  }, [selectedLevels, cautionOnly, forMyLevel, levelInfo, selectedCategories, favoritesOnly, favorites, normalizedQuery]);

  const visibleCategories = guide.techniqueCategories
    .map((cat) => ({
      cat,
      techniques: cat.techniqueIds
        .map((id) => guide.techniques.find((tech) => tech.id === id)!)
        .filter(matches),
    }))
    .filter((group) => group.techniques.length > 0);

  const totalVisible = visibleCategories.reduce((n, g) => n + g.techniques.length, 0);

  return (
    <div className="view">
      <h1 className="view__heading">{guide.meta.parts["II"] ?? t.nav.techniques}</h1>
      <p className="view__subheading">{t.technique.subheading(guide.techniques.length)}</p>
      <div className="random-drill">
        <button type="button" className="button-primary" onClick={pickRandomTechnique}>
          {t.technique.randomButton}
        </button>
        {randomTechnique && (
          <div className="random-drill__result">
            <span className="mono-label">{t.technique.randomHeading}</span>
            <p className="random-drill__name">{randomTechnique.name}</p>
            <p className="random-drill__description">{randomTechnique.what}</p>
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
          {levelInfo && (
            <button
              type="button"
              className={`chip chip--filterable${forMyLevel ? " chip--active" : ""}`}
              aria-pressed={forMyLevel}
              onClick={() => setForMyLevel((v) => !v)}
            >
              {t.filters.forMyLevel}
            </button>
          )}
        </div>
        <div className="filters__group">
          <span className="mono-label filters__label">{t.filters.levelHeading}</span>
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`chip chip--filterable chip--${level}${selectedLevels.has(level) ? " chip--active" : ""}`}
              aria-pressed={selectedLevels.has(level)}
              onClick={() => toggleInSet(selectedLevels, level, setSelectedLevels)}
            >
              {t.levels[level]}
            </button>
          ))}
          <button
            type="button"
            className={`chip chip--filterable chip--caution${cautionOnly ? " chip--active" : ""}`}
            aria-pressed={cautionOnly}
            onClick={() => setCautionOnly((v) => !v)}
          >
            {t.filters.cautionOnly}
          </button>
        </div>
        <div className="filters__group">
          <span className="mono-label filters__label">{t.filters.categoryHeading}</span>
          {guide.techniqueCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip chip--filterable${selectedCategories.has(cat.id) ? " chip--active" : ""}`}
              aria-pressed={selectedCategories.has(cat.id)}
              onClick={() => toggleInSet(selectedCategories, cat.id, setSelectedCategories)}
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
            {forMyLevel && levelInfo && (
              <button type="button" className="chip chip--removable" onClick={() => setForMyLevel(false)}>
                {t.filters.forMyLevel} <span aria-hidden="true">×</span>
                <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
              </button>
            )}
            {cautionOnly && (
              <button type="button" className="chip chip--removable" onClick={() => setCautionOnly(false)}>
                {t.filters.cautionOnly} <span aria-hidden="true">×</span>
                <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
              </button>
            )}
            {[...selectedLevels].map((level) => (
              <button
                key={level}
                type="button"
                className="chip chip--removable"
                onClick={() => toggleInSet(selectedLevels, level, setSelectedLevels)}
              >
                {t.levels[level]} <span aria-hidden="true">×</span>
                <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
              </button>
            ))}
            {[...selectedCategories].map((id) => {
              const cat = guide.techniqueCategories.find((c) => c.id === id);
              if (!cat) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className="chip chip--removable"
                  onClick={() => toggleInSet(selectedCategories, id, setSelectedCategories)}
                >
                  {cat.title} <span aria-hidden="true">×</span>
                  <span className="visually-hidden">{t.filters.removeAriaLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="search-bar">
        <input
          type="search"
          className="search-bar__input"
          placeholder={t.search.placeholder}
          aria-label={t.search.ariaLabel}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {totalVisible === 0 ? (
        <p className="search-bar__no-results">{t.search.noResults}</p>
      ) : (
        visibleCategories.map(({ cat, techniques }) => (
          <section key={cat.id} id={`section-${cat.number}`} className="technique-category">
            <h2 className="technique-category__title">{cat.title}</h2>
            {!hasActiveFilters && cat.intro && <p className="technique-category__intro">{cat.intro}</p>}
            <ul className="tcard-list">
              {techniques.map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  expanded={expandedIds.has(technique.id)}
                  onToggle={() => toggleExpanded(technique.id)}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
