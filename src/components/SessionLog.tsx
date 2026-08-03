import { useState } from "react";
import { useAppState } from "../state/AppState";
import type { ElbowChange, SessionLogEntry } from "../state/AppState";
import { elbowLabels as getElbowLabels, formatDisplayDate, todayLocalISO } from "../utils/sessionStats";
import ProgressStats from "./ProgressStats";
import SessionChecklist from "./SessionChecklist";

type ExportFormat = "json" | "csv";

const CSV_COLUMNS: Array<keyof SessionLogEntry> = ["date", "drill", "hardest", "elbow", "note"];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(entries: SessionLogEntry[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = entries.map((entry) => CSV_COLUMNS.map((col) => csvEscape(String(entry[col]))).join(","));
  return [header, ...rows].join("\r\n");
}

// So spreadsheet apps (Excel in particular) render the ES accented text
// correctly instead of guessing the wrong codepage. JSON isn't read as
// delimited text, so it doesn't need one.
const UTF8_BOM = String.fromCharCode(0xfeff);

export default function SessionLog() {
  const { t, lang, guide, log, addLogEntry } = useAppState();

  const [date, setDate] = useState(todayLocalISO);
  const [drill, setDrill] = useState("");
  const [hardest, setHardest] = useState("");
  const [elbow, setElbow] = useState<ElbowChange>("same");
  const [note, setNote] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [showChecklist, setShowChecklist] = useState(false);

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
    if (log.length === 0) return;
    const isJson = exportFormat === "json";
    const content = isJson ? JSON.stringify(log, null, 2) : UTF8_BOM + toCsv(log);
    const mime = isJson ? "application/json;charset=utf-8;" : "text/csv;charset=utf-8;";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `climb-guide-session-log-${todayLocalISO()}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const elbowLabels = getElbowLabels(t);

  return (
    <section className="session-log">
      <h2 className="guide-section__title">{t.sessionLog.heading}</h2>

      <ProgressStats />

      <button type="button" className="secondary-button" onClick={() => setShowChecklist(true)}>
        {t.checklist.openButton}
      </button>
      {showChecklist && <SessionChecklist onClose={() => setShowChecklist(false)} />}

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

        <button type="submit" className="button-primary" disabled={!canSubmit}>
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
                  <span className="session-log__entry-date">{formatDisplayDate(entry.date, lang)}</span>
                  <span className={`chip chip--filterable`}>{elbowLabels[entry.elbow]}</span>
                </div>
                <p className="session-log__entry-drill">{entry.drill}</p>
                <p className="session-log__entry-hardest">{entry.hardest}</p>
                {entry.note && <p className="session-log__entry-note">{entry.note}</p>}
              </li>
            ))}
          </ul>
          <div className="export-row">
            <div className="header__group" role="group" aria-label={t.sessionLog.exportFormatAriaLabel}>
              <button
                type="button"
                className={`header__pill${exportFormat === "json" ? " header__pill--active" : ""}`}
                aria-pressed={exportFormat === "json"}
                onClick={() => setExportFormat("json")}
              >
                JSON
              </button>
              <button
                type="button"
                className={`header__pill${exportFormat === "csv" ? " header__pill--active" : ""}`}
                aria-pressed={exportFormat === "csv"}
                onClick={() => setExportFormat("csv")}
              >
                CSV
              </button>
            </div>
            <button type="button" className="filters__clear" onClick={handleExport}>
              {t.sessionLog.exportButton}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
