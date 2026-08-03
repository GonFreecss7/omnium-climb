import { useState } from "react";
import { useAppState } from "../state/AppState";
import type { Drill } from "../data/types";

// A warm-up should be brief — not every drill category makes sense as a
// physical warm-up (e.g. "Reading & mental drills" and "Partner games" need
// a partner or a cool head, not a warm body), so the default subset is the
// three movement-quality categories rather than all six.
const DEFAULT_CATEGORY_IDS = ["footwork-drills", "body-position-drills", "movement-drills"];

function pickRandomDrill(pool: Drill[], excludeId?: string): Drill {
  const candidates = excludeId && pool.length > 1 ? pool.filter((d) => d.id !== excludeId) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

export default function WarmupGenerator({ onClose }: { onClose: () => void }) {
  const { t, guide } = useAppState();

  const availableCategoryIds = guide.drillCategories.map((c) => c.id);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(DEFAULT_CATEGORY_IDS.filter((id) => availableCategoryIds.includes(id))),
  );
  const [picks, setPicks] = useState<Record<string, Drill> | null>(null);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function generate() {
    if (selectedCategories.size === 0) return;
    const next: Record<string, Drill> = {};
    for (const catId of selectedCategories) {
      const cat = guide.drillCategories.find((c) => c.id === catId);
      if (!cat) continue;
      const pool = cat.drillIds.map((id) => guide.drills.find((d) => d.id === id)!);
      next[catId] = pickRandomDrill(pool);
    }
    setPicks(next);
  }

  function rerollOne(catId: string) {
    setPicks((prev) => {
      if (!prev) return prev;
      const cat = guide.drillCategories.find((c) => c.id === catId);
      if (!cat) return prev;
      const pool = cat.drillIds.map((id) => guide.drills.find((d) => d.id === id)!);
      return { ...prev, [catId]: pickRandomDrill(pool, prev[catId]?.id) };
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t.warmup.heading}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{t.warmup.heading}</h2>
          <button type="button" className="modal__close" aria-label={t.warmup.closeAriaLabel} onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="modal__body">
          <div className="filters__group">
            <span className="mono-label filters__label">{t.warmup.categoriesLabel}</span>
          </div>
          <div className="filters__group">
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

          <button type="button" className="button-primary warmup__generate" onClick={generate} disabled={selectedCategories.size === 0}>
            {picks ? t.warmup.regenerateButton : t.warmup.generateButton}
          </button>

          {selectedCategories.size === 0 && <p className="search-bar__no-results">{t.warmup.emptyHint}</p>}

          {picks && (
            <ul className="warmup-list">
              {[...selectedCategories].map((catId) => {
                const cat = guide.drillCategories.find((c) => c.id === catId);
                const drill = picks[catId];
                if (!cat || !drill) return null;
                return (
                  <li key={catId} className="warmup-list__item">
                    <div className="warmup-list__text">
                      <span className="mono-label">{cat.title}</span>
                      <p className="warmup-list__name">{drill.name}</p>
                      <p className="warmup-list__description">{drill.description}</p>
                    </div>
                    <button
                      type="button"
                      className="star-toggle"
                      aria-label={t.warmup.rerollOneAriaLabel}
                      onClick={() => rerollOne(catId)}
                    >
                      <span aria-hidden="true">↻</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
