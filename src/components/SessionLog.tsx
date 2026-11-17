import { useState } from "react";
import { useAppState } from "../state/AppState";
import type { ElbowChange, SessionLogEntry } from "../state/AppState";
import {
  elbowLabels as getElbowLabels,
  entryGradeLabel,
  formatDisplayDate,
  todayLocalISO,
} from "../utils/sessionStats";
import { gradeLabel, gradeOptions } from "../domain/grades";
import type { Discipline } from "../domain/grades";
import LevelUpBanner from "./LevelUpBanner";
import ProgressStats from "./ProgressStats";
import SessionChecklist from "./SessionChecklist";

type ExportFormat = "json" | "csv";

const CSV_COLUMNS: Array<keyof SessionLogEntry> = ["date", "discipline", "hardest", "gradeScale", "drill", "elbow", "note"];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(entries: SessionLogEntry[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = entries.map((entry) => CSV_COLUMNS.map((col) => csvEscape(String(entry[col] ?? ""))).join(","));
  return [header, ...rows].join("\r\n");
}

// So spreadsheet apps (Excel in particular) render the ES accented text
// correctly instead of guessing the wrong codepage. JSON isn't read as
// delimited text, so it doesn't need one.
const UTF8_BOM = String.fromCharCode(0xfeff);

export default function SessionLog() {
  const { t, lang, guide, log, addLogEntry, profile } = useAppState();
  const disciplines: Discipline[] = profile?.disciplines.length ? profile.disciplines : ["boulder", "rope"];
  const scales = { boulder: profile?.boulderScale ?? "V", rope: profile?.ropeScale ?? "French" } as const;
  const [discipline, setDiscipline] = useState<Discipline>(disciplines[0]!);
  const activeDiscipline = disciplines.includes(discipline) ? discipline : disciplines[0]!;
  const activeScale = activeDiscipline === "boulder" ? scales.boulder : scales.rope;

  const [date, setDate] = useState(todayLocalISO);
  const [drill, setDrill] = useState("");
  const [gradeIndex, setGradeIndex] = useState<number | null>(null);
  const [elbow, setElbow] = useState<ElbowChange>("same");
  const [note, setNote] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [showChecklist, setShowChecklist] = useState(false);

  const canSubmit = date !== "" && drill !== "" && gradeIndex !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (gradeIndex === null) return;
    addLogEntry({
      date,
      drill,
      hardest: gradeLabel(gradeIndex, activeScale),
      discipline: activeDiscipline,
      gradeIndex,
      gradeScale: activeScale,
      elbow,
      note: note.trim(),
    });
    setDrill("");
    setGradeIndex(null);
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

      <LevelUpBanner />
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

        {disciplines.length > 1 && (
          <div className="session-log__field">
            <span className="mono-label">{t.sessionLog.disciplineLabel}</span>
            <div className="session-log__elbow-group">
              {disciplines.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip chip--filterable${activeDiscipline === d ? " chip--active" : ""}`}
                  aria-pressed={activeDiscipline === d}
                  onClick={() => {
                    setDiscipline(d);
                    setGradeIndex(null);
                  }}
                >
                  {d === "boulder" ? t.onboarding.boulder : t.onboarding.rope}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="session-log__field">
          <span className="mono-label">
            {t.sessionLog.hardestLabel} · {activeScale}
          </span>
          <select
            value={gradeIndex ?? ""}
            onChange={(e) => setGradeIndex(e.target.value === "" ? null : Number(e.target.value))}
            required
          >
            <option value="" disabled>
              {t.sessionLog.hardestPlaceholder}
            </option>
            {gradeOptions(activeScale).map((opt) => (
              <option key={opt.index} value={opt.index}>
                {opt.label}
              </option>
            ))}
          </select>
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
                <p className="session-log__entry-hardest">
                  {entryGradeLabel(entry, scales)}
                  {entry.discipline === "rope" && <span className="session-log__entry-tag"> · {t.onboarding.rope}</span>}
                </p>
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
