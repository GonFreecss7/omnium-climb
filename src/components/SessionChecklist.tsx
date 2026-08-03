import { useState } from "react";
import { useAppState } from "../state/AppState";
import { todayLocalISO, formatDisplayDate } from "../utils/sessionStats";

type Mode = "select" | "result";

export default function SessionChecklist({ onClose }: { onClose: () => void }) {
  const { t, lang, guide } = useAppState();

  const [mode, setMode] = useState<Mode>("select");
  const [selectedTechniques, setSelectedTechniques] = useState<Set<string>>(new Set());
  const [selectedDrills, setSelectedDrills] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const hasSelection = selectedTechniques.size > 0 || selectedDrills.size > 0;

  function toggle(set: Set<string>, setState: (s: Set<string>) => void, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setState(next);
  }

  function buildShareText(): string {
    const lines = [`${t.checklist.resultHeading} — ${formatDisplayDate(todayLocalISO(), lang)}`, ""];
    if (selectedTechniques.size > 0) {
      lines.push(`${t.checklist.techniquesHeading}:`);
      for (const id of selectedTechniques) {
        const tech = guide.techniques.find((x) => x.id === id);
        if (tech) lines.push(`- ${tech.name}`);
      }
      lines.push("");
    }
    if (selectedDrills.size > 0) {
      lines.push(`${t.checklist.drillsHeading}:`);
      for (const id of selectedDrills) {
        const drill = guide.drills.find((x) => x.id === id);
        if (drill) lines.push(`- ${drill.name}`);
      }
    }
    return lines.join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: t.checklist.resultHeading, text });
      } catch {
        // user cancelled the native share sheet — not an error
      }
      return;
    }
    await handleCopy();
  }

  async function handleCopy() {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing further we can do client-side
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t.checklist.selectHeading}>
      <div className="modal modal--checklist">
        <div className="modal__header no-print">
          <h2 className="modal__title">{mode === "select" ? t.checklist.selectHeading : t.checklist.resultHeading}</h2>
          <button type="button" className="modal__close" aria-label={t.checklist.closeAriaLabel} onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {mode === "select" ? (
          <div className="modal__body">
            <h3 className="prose-subheading">{t.checklist.techniquesHeading}</h3>
            {guide.techniqueCategories.map((cat) => (
              <fieldset key={cat.id} className="checklist-fieldset">
                <legend className="mono-label">{cat.title}</legend>
                {cat.techniqueIds.map((id) => {
                  const tech = guide.techniques.find((x) => x.id === id)!;
                  return (
                    <label key={id} className="checklist-option">
                      <input
                        type="checkbox"
                        checked={selectedTechniques.has(id)}
                        onChange={() => toggle(selectedTechniques, setSelectedTechniques, id)}
                      />
                      {tech.name}
                    </label>
                  );
                })}
              </fieldset>
            ))}

            <h3 className="prose-subheading">{t.checklist.drillsHeading}</h3>
            {guide.drillCategories.map((cat) => (
              <fieldset key={cat.id} className="checklist-fieldset">
                <legend className="mono-label">{cat.title}</legend>
                {cat.drillIds.map((id) => {
                  const drill = guide.drills.find((x) => x.id === id)!;
                  return (
                    <label key={id} className="checklist-option">
                      <input
                        type="checkbox"
                        checked={selectedDrills.has(id)}
                        onChange={() => toggle(selectedDrills, setSelectedDrills, id)}
                      />
                      {drill.name}
                    </label>
                  );
                })}
              </fieldset>
            ))}

            {!hasSelection && <p className="search-bar__no-results">{t.checklist.emptyHint}</p>}

            <button
              type="button"
              className="button-primary"
              disabled={!hasSelection}
              onClick={() => setMode("result")}
            >
              {t.checklist.generateButton}
            </button>
          </div>
        ) : (
          <div className="modal__body checklist-result">
            <p className="checklist-result__date mono-label">{formatDisplayDate(todayLocalISO(), lang)}</p>

            {selectedTechniques.size > 0 && (
              <>
                <h3 className="prose-subheading">{t.checklist.techniquesHeading}</h3>
                <ul className="checklist-result__list">
                  {[...selectedTechniques].map((id) => {
                    const tech = guide.techniques.find((x) => x.id === id)!;
                    return (
                      <li key={id}>
                        <span aria-hidden="true">☐</span> {tech.name}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {selectedDrills.size > 0 && (
              <>
                <h3 className="prose-subheading">{t.checklist.drillsHeading}</h3>
                <ul className="checklist-result__list">
                  {[...selectedDrills].map((id) => {
                    const drill = guide.drills.find((x) => x.id === id)!;
                    return (
                      <li key={id}>
                        <span aria-hidden="true">☐</span> {drill.name}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <p className="checklist-result__footer mono-label">{t.checklist.printOnly}</p>

            <div className="modal__actions no-print">
              <button type="button" className="filters__clear" onClick={() => setMode("select")}>
                {t.checklist.backButton}
              </button>
              <button type="button" className="button-primary" onClick={handleShare}>
                {typeof navigator.share === "function" ? t.checklist.shareButton : t.checklist.copyButton}
              </button>
              {copied && <span className="mono-label checklist-result__copied">{t.checklist.copiedConfirmation}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
