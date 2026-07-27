import { useState } from "react";
import { useAppState } from "../state/AppState";
import type { ElbowChange } from "../state/AppState";
import { elbowLabels as getElbowLabels } from "../utils/sessionStats";
import ProgressStats from "./ProgressStats";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SessionLog() {
  const { t, guide, log, addLogEntry } = useAppState();

  const [date, setDate] = useState(today);
  const [drill, setDrill] = useState("");
  const [hardest, setHardest] = useState("");
  const [elbow, setElbow] = useState<ElbowChange>("same");
  const [note, setNote] = useState("");

  const canSubmit = date !== "" && drill !== "" && hardest.trim() !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    addLogEntry({ date, drill, hardest: hardest.trim(), elbow, note: note.trim() });
    setDrill("");
    setHardest("");
    setElbow("same");
    setNote("");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `climb-guide-session-log-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const elbowLabels = getElbowLabels(t);

  return (
    <section className="session-log">
      <h2 className="guide-section__title">{t.sessionLog.heading}</h2>

      <ProgressStats />

      <form className="session-log__form" onSubmit={handleSubmit}>
        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.dateLabel}</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.drillLabel}</span>
          <select value={drill} onChange={(e) => setDrill(e.target.value)} required>
            <option value="" disabled>
              {t.sessionLog.drillPlaceholder}
            </option>
            {guide.drillCategories.map((cat) => (
              <optgroup key={cat.id} label={cat.title}>
                {cat.drillIds.map((id) => {
                  const d = guide.drills.find((x) => x.id === id)!;
                  return (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.hardestLabel}</span>
          <input
            type="text"
            value={hardest}
            onChange={(e) => setHardest(e.target.value)}
            placeholder={t.sessionLog.hardestPlaceholder}
            required
          />
        </label>

        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.elbowLabel}</span>
          <div className="session-log__elbow-group">
            {(["better", "same", "worse"] as ElbowChange[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`chip chip--filterable${elbow === value ? " chip--active" : ""}`}
                aria-pressed={elbow === value}
                onClick={() => setElbow(value)}
              >
                {elbowLabels[value]}
              </button>
            ))}
          </div>
        </label>

        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.noteLabel}</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.sessionLog.notePlaceholder}
          />
        </label>

        <button type="submit" className="random-drill__button" disabled={!canSubmit}>
          {t.sessionLog.addButton}
        </button>
      </form>

      {log.length === 0 ? (
        <p className="search-bar__no-results">{t.sessionLog.emptyMessage}</p>
      ) : (
        <>
          <ul className="session-log__list">
            {log.map((entry) => (
              <li key={entry.id} className="session-log__entry">
                <div className="session-log__entry-header">
                  <span className="session-log__entry-date">{entry.date}</span>
                  <span className={`chip chip--filterable`}>{elbowLabels[entry.elbow]}</span>
                </div>
                <p className="session-log__entry-drill">{entry.drill}</p>
                <p className="session-log__entry-hardest">{entry.hardest}</p>
                {entry.note && <p className="session-log__entry-note">{entry.note}</p>}
              </li>
            ))}
          </ul>
          <button type="button" className="filters__clear" onClick={handleExport}>
            {t.sessionLog.exportButton}
          </button>
        </>
      )}
    </section>
  );
}
