import { useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import { normalize } from "../utils/text";
import TechniqueCard from "../components/TechniqueCard";
import type { Tag, Technique } from "../data/types";

export default function TechniquesView() {
  const { guide, t, scrollTarget, clearScrollTarget, favorites } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<Tag>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const hasActiveFilters =
    selectedTags.size > 0 || selectedCategories.size > 0 || favoritesOnly || query.trim() !== "";

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
    setSelectedTags(new Set());
    setSelectedCategories(new Set());
    setFavoritesOnly(false);
  }

  const normalizedQuery = normalize(query.trim());

  const matches = useMemo(() => {
    return (technique: Technique): boolean => {
      if (favoritesOnly && !favorites.has(technique.id)) return false;
      if (selectedTags.size > 0 && !selectedTags.has(technique.tag)) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(technique.categoryId)) return false;
      if (normalizedQuery === "") return true;
      const haystack = normalize(
        [technique.name, technique.gloss ?? "", technique.what, technique.how, technique.best].join(" "),
      );
      return haystack.includes(normalizedQuery);
    };
  }, [selectedTags, selectedCategories, favoritesOnly, favorites, normalizedQuery]);

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
          <span className="mono-label filters__label">{t.filters.tagHeading}</span>
          {(Object.keys(t.filters.tagLabels) as Tag[]).map((tag) => (
            <button
              key={tag}
              type="button"
              className={`chip chip--filterable chip--${tag}${selectedTags.has(tag) ? " chip--active" : ""}`}
              aria-pressed={selectedTags.has(tag)}
              onClick={() => toggleInSet(selectedTags, tag, setSelectedTags)}
            >
              {t.filters.tagLabels[tag]}
            </button>
          ))}
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
