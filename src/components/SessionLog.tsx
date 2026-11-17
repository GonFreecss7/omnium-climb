import { useState } from "react";
import { useAppState } from "../state/AppState";
import type { ElbowChange, SessionLogEntry } from "../state/AppState";
import {
  elbowLabels as getElbowLabels,
  entryGradeIndex,
  formatDisplayDate,
  todayLocalISO,
} from "../utils/sessionStats";
import { BOULDER_SCALES, ROPE_SCALES, SCALE_LABELS, gradeLabel, gradeOptions } from "../domain/grades";
import type { Discipline, GradeScale } from "../domain/grades";
import { orderedGyms, rangeLabel } from "../domain/circuits";
import { BOARDS, boardAngles, defaultAngle } from "../domain/boards";
import { DIRECTORY, findByName } from "../domain/gymDirectory";
import LevelUpBanner from "./LevelUpBanner";
import ProgressStats from "./ProgressStats";
import SessionChecklist from "./SessionChecklist";

type ExportFormat = "json" | "csv";

const CSV_COLUMNS: Array<[string, (e: SessionLogEntry) => unknown]> = [
  ["date", (e) => e.date],
  ["gym", (e) => e.gym?.name ?? ""],
  ["home_gym", (e) => (e.gym ? (e.gym.home ? "yes" : "no") : "")],
  ["discipline", (e) => e.discipline ?? ""],
  ["circuit", (e) => e.circuit?.name ?? ""],
  ["hardest", (e) => e.hardest],
  ["scale", (e) => e.gradeScale ?? ""],
  ["board", (e) => e.board?.name ?? ""],
  ["angle", (e) => e.board?.angle ?? ""],
  ["drill", (e) => e.drill],
  ["niggles", (e) => e.elbow],
  ["note", (e) => e.note],
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(entries: SessionLogEntry[]): string {
  const header = CSV_COLUMNS.map(([name]) => name).join(",");
  const rows = entries.map((entry) => CSV_COLUMNS.map(([, get]) => csvEscape(String(get(entry) ?? ""))).join(","));
  return [header, ...rows].join("\r\n");
}

// So spreadsheet apps (Excel in particular) render the ES accented text
// correctly instead of guessing the wrong codepage.
const UTF8_BOM = String.fromCharCode(0xfeff);

const OTHER = "__other__";

export default function SessionLog() {
  const { t, lang, guide, log, addLogEntry, profile, circuits } = useAppState();
  const c = t.circuits;
  const disciplines: Discipline[] = profile?.disciplines.length ? profile.disciplines : ["boulder", "rope"];
  const profileScales = { boulder: profile?.boulderScale ?? "V", rope: profile?.ropeScale ?? "French" } as const;
  const gyms = orderedGyms(circuits);

  const [discipline, setDiscipline] = useState<Discipline>(disciplines[0]!);
  const activeDiscipline = disciplines.includes(discipline) ? discipline : disciplines[0]!;

  const [gymChoice, setGymChoice] = useState<string>(circuits.homeId ?? OTHER);
  const selectedGym = gyms.find((g) => g.id === gymChoice) ?? null;
  const [otherName, setOtherName] = useState("");
  const [otherScale, setOtherScale] = useState<GradeScale>(profileScales[activeDiscipline]);

  const [setting, setSetting] = useState<"wall" | "board">("wall");
  const onBoard = activeDiscipline === "boulder" && setting === "board";
  const [boardId, setBoardId] = useState(BOARDS[0]!.id);
  const board = BOARDS.find((b) => b.id === boardId) ?? BOARDS[0]!;
  const [boardOtherName, setBoardOtherName] = useState("");
  const [angle, setAngle] = useState(defaultAngle(BOARDS[0]!));
  const [boardScale, setBoardScale] = useState<GradeScale>(BOARDS[0]!.defaultScale);

  const scaleChoices: GradeScale[] = activeDiscipline === "boulder" ? BOULDER_SCALES : ROPE_SCALES;
  const activeScale: GradeScale = onBoard
    ? boardScale
    : selectedGym
      ? activeDiscipline === "boulder"
        ? selectedGym.scale
        : profileScales.rope
      : scaleChoices.includes(otherScale)
        ? otherScale
        : profileScales[activeDiscipline];

  const circuitOptions = activeDiscipline === "boulder" && selectedGym && !onBoard ? selectedGym.colors : [];
  const [circuitId, setCircuitId] = useState<string | null>(null);
  const circuit = circuitOptions.find((x) => x.id === circuitId) ?? null;

  const [date, setDate] = useState(todayLocalISO);
  const [drill, setDrill] = useState("");
  const [gradeIndex, setGradeIndex] = useState<number | null>(null);
  const [elbow, setElbow] = useState<ElbowChange>("same");
  const [note, setNote] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [showChecklist, setShowChecklist] = useState(false);

  const gradeChoices = gradeOptions(activeScale).filter(
    (o) => !circuit || (o.index >= circuit.min && o.index <= circuit.max),
  );

  const canSubmit = date !== "" && (gradeIndex !== null || circuit !== null);

  function resetGrade() {
    setCircuitId(null);
    setGradeIndex(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const index = gradeIndex ?? circuit!.min;
    const hardest =
      gradeIndex !== null ? gradeLabel(gradeIndex, activeScale) : rangeLabel(circuit!, activeScale as "V" | "Font");
    addLogEntry({
      date,
      drill,
      hardest,
      discipline: activeDiscipline,
      gradeIndex: index,
      gradeScale: activeScale,
      ...(circuit ? { circuit: { name: circuit.name, hex: circuit.hex, min: circuit.min, max: circuit.max } } : {}),
      ...(selectedGym
        ? {
            gym: {
              name: selectedGym.name,
              id: selectedGym.id,
              home: selectedGym.id === circuits.homeId,
              ...(selectedGym.directoryId ? { directoryId: selectedGym.directoryId } : {}),
            },
          }
        : otherName.trim()
          ? (() => {
              const dir = findByName(otherName);
              return { gym: { name: dir?.name ?? otherName.trim(), home: false, ...(dir ? { directoryId: dir.id } : {}) } };
            })()
          : {}),
      ...(onBoard
        ? {
            board: {
              id: board.id,
              name: board.id === "other" ? boardOtherName.trim() || t.sessionLog.boardOther : board.name,
              angle,
            },
          }
        : {}),
      elbow,
      note: note.trim(),
    });
    setDrill("");
    resetGrade();
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
    a.download = `omnium-climb-sessions-${todayLocalISO()}.${exportFormat}`;
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

        <div className="session-log__field">
          <span className="mono-label">{c.gymLabel}</span>
          <div className="session-log__elbow-group">
            {gyms.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`chip chip--filterable${gymChoice === g.id ? " chip--active" : ""}`}
                aria-pressed={gymChoice === g.id}
                onClick={() => {
                  setGymChoice(g.id);
                  resetGrade();
                }}
              >
                {g.id === circuits.homeId && <span className="home-mark">{c.homeShort}</span>}
                {g.name}
              </button>
            ))}
            <button
              type="button"
              className={`chip chip--filterable${gymChoice === OTHER ? " chip--active" : ""}`}
              aria-pressed={gymChoice === OTHER}
              onClick={() => {
                setGymChoice(OTHER);
                setOtherScale(profileScales[activeDiscipline]);
                resetGrade();
              }}
            >
              {gyms.length > 0 ? c.otherGym : c.gymPlaceholder}
            </button>
          </div>
          {gymChoice === OTHER && (
            <>
              <input
                type="text"
                list="gym-directory"
                value={otherName}
                placeholder={c.otherGymName}
                aria-label={c.otherGymName}
                onChange={(e) => setOtherName(e.target.value)}
              />
              <datalist id="gym-directory">
                {DIRECTORY.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.commune}
                  </option>
                ))}
              </datalist>
            </>
          )}
        </div>

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
                    setOtherScale(profileScales[d]);
                    resetGrade();
                  }}
                >
                  {d === "boulder" ? t.onboarding.boulder : t.onboarding.rope}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeDiscipline === "boulder" && (
          <div className="session-log__field">
            <span className="mono-label">{t.sessionLog.settingLabel}</span>
            <div className="segmented session-log__scales">
              {(["wall", "board"] as const).map((sv) => (
                <button
                  key={sv}
                  type="button"
                  className={`segmented__option${setting === sv ? " segmented__option--active" : ""}`}
                  aria-pressed={setting === sv}
                  onClick={() => {
                    setSetting(sv);
                    resetGrade();
                  }}
                >
                  {sv === "wall" ? t.sessionLog.settingWall : t.sessionLog.settingBoard}
                </button>
              ))}
            </div>
          </div>
        )}

        {onBoard && (
          <>
            <div className="session-log__field">
              <span className="mono-label">{t.sessionLog.boardLabel}</span>
              <div className="session-log__elbow-group">
                {BOARDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`chip chip--filterable${boardId === b.id ? " chip--active" : ""}`}
                    aria-pressed={boardId === b.id}
                    onClick={() => {
                      setBoardId(b.id);
                      setAngle(defaultAngle(b));
                      setBoardScale(b.defaultScale);
                      setGradeIndex(null);
                    }}
                  >
                    {b.id === "other" ? t.sessionLog.boardOther : b.name}
                  </button>
                ))}
              </div>
              {board.id === "other" && (
                <input
                  type="text"
                  value={boardOtherName}
                  placeholder={t.sessionLog.boardOtherName}
                  aria-label={t.sessionLog.boardOtherName}
                  onChange={(e) => setBoardOtherName(e.target.value)}
                />
              )}
            </div>
            <div className="session-log__field">
              <span className="mono-label">
                {t.sessionLog.angleLabel} · {angle}°
              </span>
              <div className="angle-pick" role="group" aria-label={t.sessionLog.angleLabel}>
                {boardAngles(board).map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`angle-pick__option${angle === a ? " angle-pick__option--active" : ""}`}
                    aria-pressed={angle === a}
                    onClick={() => setAngle(a)}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>
            <div className="session-log__field">
              <span className="mono-label">{c.scaleLabel}</span>
              <div className="segmented session-log__scales">
                {BOULDER_SCALES.map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    className={`segmented__option${boardScale === sc ? " segmented__option--active" : ""}`}
                    aria-pressed={boardScale === sc}
                    onClick={() => {
                      setBoardScale(sc);
                      setGradeIndex(null);
                    }}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {gymChoice === OTHER && !onBoard && (
          <div className="session-log__field">
            <span className="mono-label">{c.scaleLabel}</span>
            <div className="segmented session-log__scales">
              {scaleChoices.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`segmented__option${activeScale === s ? " segmented__option--active" : ""}`}
                  aria-pressed={activeScale === s}
                  onClick={() => {
                    setOtherScale(s);
                    setGradeIndex(null);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {circuitOptions.length > 0 && (
          <div className="session-log__field">
            <span className="mono-label">{c.logLabel}</span>
            <div className="circuit-pick">
              {circuitOptions.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  className={`circuit-pick__option${circuitId === col.id ? " circuit-pick__option--active" : ""}`}
                  aria-pressed={circuitId === col.id}
                  onClick={() => {
                    setCircuitId(circuitId === col.id ? null : col.id);
                    setGradeIndex(null);
                  }}
                >
                  <span className="circuit-dot circuit-dot--lg" style={{ background: col.hex }} />
                  <span className="circuit-pick__name">{col.name}</span>
                  <span className="circuit-pick__range">{rangeLabel(col, selectedGym!.scale)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="session-log__field">
          <span className="mono-label">
            {circuitOptions.length > 0 ? c.exactGrade : t.sessionLog.hardestLabel} · {SCALE_LABELS[activeScale]}
          </span>
          <select
            value={gradeIndex ?? ""}
            onChange={(e) => setGradeIndex(e.target.value === "" ? null : Number(e.target.value))}
            required={circuitOptions.length === 0}
          >
            <option value="" disabled={circuitOptions.length === 0}>
              {circuitOptions.length > 0 ? c.exactGradeAny : t.sessionLog.hardestPlaceholder}
            </option>
            {gradeChoices.map((opt) => (
              <option key={opt.index} value={opt.index}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.drillLabel}</span>
          <select value={drill} onChange={(e) => setDrill(e.target.value)}>
            <option value="">{t.sessionLog.drillNone}</option>
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

        <div className="session-log__field">
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
        </div>

        <label className="session-log__field">
          <span className="mono-label">{t.sessionLog.noteLabel}</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.sessionLog.notePlaceholder} />
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
            {log.map((entry) => {
              const g = entryGradeIndex(entry);
              const userScale = g ? profileScales[g.discipline] : null;
              const converted =
                g && entry.gradeScale && userScale && entry.gradeScale !== userScale ? gradeLabel(g.index, userScale) : null;
              return (
                <li key={entry.id} className="session-log__entry">
                  <div className="session-log__entry-header">
                    <span className="session-log__entry-date">{formatDisplayDate(entry.date, lang)}</span>
                    <span className="chip">{elbowLabels[entry.elbow]}</span>
                  </div>
                  <p className="session-log__entry-hardest">
                    {entry.circuit && <span className="circuit-dot circuit-dot--lg" style={{ background: entry.circuit.hex }} />}
                    {entry.circuit && <span className="session-log__entry-circuit">{entry.circuit.name}</span>}
                    {entry.hardest}
                    {converted && <span className="session-log__entry-tag"> ≈ {converted}</span>}
                    {entry.discipline === "rope" && <span className="session-log__entry-tag"> · {t.onboarding.rope}</span>}
                  </p>
                  {entry.board && (
                    <p className="session-log__entry-board">
                      {entry.board.name} · {entry.board.angle}°
                    </p>
                  )}
                  {entry.drill && <p className="session-log__entry-drill">{entry.drill}</p>}
                  {entry.gym && (
                    <p className="session-log__entry-gym">
                      {entry.gym.home && <span className="home-mark">{c.homeShort}</span>}
                      {entry.gym.name}
                    </p>
                  )}
                  {entry.note && <p className="session-log__entry-note">{entry.note}</p>}
                </li>
              );
            })}
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
