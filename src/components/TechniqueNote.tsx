import { useEffect, useRef, useState } from "react";
import { useAppState } from "../state/AppState";

const MAX_LENGTH = 2000;
const SAVE_DELAY_MS = 600;

export default function TechniqueNote({ techniqueId }: { techniqueId: string }) {
  const { t, notes, setNote } = useAppState();
  const stored = notes[techniqueId] ?? "";

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(stored);
  const [dirty, setDirty] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handleChange(next: string) {
    setDraft(next);
    setDirty(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setNote(techniqueId, next);
      setDirty(false);
    }, SAVE_DELAY_MS);
  }

  function handleBlur() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setNote(techniqueId, draft);
    setDirty(false);
  }

  const preview = stored.length > 60 ? `${stored.slice(0, 60)}…` : stored;

  return (
    <div className="tcard-note">
      <button
        type="button"
        className="tcard-note__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mono-label">{t.notes.label}</span>
        {!open && stored && <span className="tcard-note__preview">{preview}</span>}
      </button>
      {open && (
        <div className="tcard-note__body">
          <textarea
            className="tcard-note__textarea"
            value={draft}
            maxLength={MAX_LENGTH}
            placeholder={t.notes.placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            rows={3}
          />
          <div className="tcard-note__meta">
            <span className={`mono-label${draft.length > MAX_LENGTH - 200 ? " tcard-note__counter--warn" : ""}`}>
              {draft.length}/{MAX_LENGTH}
            </span>
            <span className="mono-label">{dirty ? t.notes.unsaved : t.notes.saved}</span>
          </div>
        </div>
      )}
    </div>
  );
}
