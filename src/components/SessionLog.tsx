import { useState } from "react";
import { useAppState } from "../state/AppState";
import type { ElbowChange, SessionLogEntry } from "../state/AppState";
import { elbowLabels as getElbowLabels, formatDisplayDate, todayLocalISO } from "../utils/sessionStats";
import { BOULDER_SCALES, ROPE_SCALES, SCALE_LABELS, gradeLabel, gradeOptions } from "../domain/grades";
import type { Discipline, GradeScale } from "../domain/grades";
import { orderedGyms, rangeLabel } from "../domain/circuits";
import { BOARDS, boardAngles, defaultAngle } from "../domain/boards";
import { DIRECTORY, findByName } from "../domain/gymDirectory";
import { CLIMB_RESULTS, bestSent, entryClimbs, isSent } from "../domain/sessions";
import type { ClimbEntry, ClimbResult } from "../domain/sessions";
import { newId } from "../domain/circuits";
import { usePersistentState } from "../hooks/usePersistentState";
import LevelUpBanner from "./LevelUpBanner";
import ProgressStats from "./ProgressStats";
import SessionChecklist from "./SessionChecklist";

type ExportFormat = "json" | "csv";

const CSV_COLUMNS: Array<[string, (e: SessionLogEntry, c: ClimbEntry | null) => unknown]> = [
  ["date", (e) => e.date],
  ["gym", (e) => e.gym?.name ?? ""],
  ["home_gym", (e) => (e.gym ? (e.gym.home ? "yes" : "no") : "")],
  ["discipline", (_, c) => c?.discipline ?? e_discipline(_)],
  ["circuit", (_, c) => c?.circuit?.name ?? ""],
  ["grade", (e, c) => (c ? (c.exact || !c.circuit ? gradeLabel(c.gradeIndex, c.gradeScale) : rangeLabel(c.circuit, c.gradeScale as "V" | "Font")) : e.hardest)],
  ["scale", (e, c) => c?.gradeScale ?? e.gradeScale ?? ""],
  ["result", (_, c) => c?.result ?? ""],
  ["attempts", (_, c) => c?.attempts ?? ""],
  ["board", (_, c) => c?.board?.name ?? ""],
  ["angle", (_, c) => c?.board?.angle ?? ""],
  ["drill", (e) => e.drill],
  ["niggles", (e) => e.elbow],
  ["note", (e) => e.note],
];

function e_discipline(e: SessionLogEntry): string {
  return e.discipline ?? "";
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** One CSV row per climb, so the file pivots cleanly in a spreadsheet. */
function toCsv(entries: SessionLogEntry[]): string {
  const header = CSV_COLUMNS.map(([name]) => name).join(",");
  const rows: string[] = [];
  for (const e of entries) {
    const climbs = entryClimbs(e);
    for (const c of climbs.length ? climbs : [null]) {
      rows.push(CSV_COLUMNS.map(([, get]) => csvEscape(String(get(e, c) ?? ""))).join(","));
    }
  }
  return [header, ...rows].join("\r\n");
}

// So spreadsheet apps (Excel in particular) render the ES accented text correctly.
const UTF8_BOM = String.fromCharCode(0xfeff);

const OTHER = "__other__";

interface Draft {
  date: string;
  gymChoice: string;
  otherName: string;
  otherScale: GradeScale | null;
  discipline: Discipline | null;
  setting: "wall" | "board";
  boardId: string;
  boardOtherName: string;
  angle: number;
  boardScale: GradeScale;
  climbs: ClimbEntry[];
  drill: string;
  elbow: ElbowChange;
  note: string;
}

function newDraft(homeId: string | null): Draft {
  return {
    date: todayLocalISO(),
    gymChoice: homeId ?? OTHER,
    otherName: "",
    otherScale: null,
    discipline: null,
    setting: "wall",
    boardId: BOARDS[0]!.id,
    boardOtherName: "",
    angle: defaultAngle(BOARDS[0]!),
    boardScale: BOARDS[0]!.defaultScale,
    climbs: [],
    drill: "",
    elbow: "same",
    note: "",
  };
}

function isDraft(v: unknown): v is Draft {
  return !!v && typeof v === "object" && Array.isArray((v as Draft).climbs) && typeof (v as Draft).date === "string";
}

function climbLabel(c: ClimbEntry): string {
  if (c.exact || !c.circuit) return gradeLabel(c.gradeIndex, c.gradeScale);
  return rangeLabel(c.circuit, c.gradeScale as "V" | "Font");
}

export default function SessionLog() {
  const { t, lang, guide, log, addLogEntry, profile, circuits } = useAppState();
  const c = t.circuits;
  const sl = t.sessionLog;
  const disciplines: Discipline[] = profile?.disciplines.length ? profile.disciplines : ["boulder", "rope"];
  const profileScales = { boulder: profile?.boulderScale ?? "V", rope: profile?.ropeScale ?? "French" } as const;
  const gyms = orderedGyms(circuits);

  const [draft, setDraft] = usePersistentState<Draft>("cg.sessionDraft", () => newDraft(circuits.homeId), isDraft);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const discipline: Discipline = draft.discipline && disciplines.includes(draft.discipline) ? draft.discipline : disciplines[0]!;
  const selectedGym = gyms.find((g) => g.id === draft.gymChoice) ?? null;
  const gymChoice = selectedGym ? selectedGym.id : OTHER;
  const onBoard = discipline === "boulder" && draft.setting === "board";
  const board = BOARDS.find((b) => b.id === draft.boardId) ?? BOARDS[0]!;
  const scaleChoices: GradeScale[] = discipline === "boulder" ? BOULDER_SCALES : ROPE_SCALES;
  const activeScale: GradeScale = onBoard
    ? draft.boardScale
    : selectedGym
      ? discipline === "boulder"
        ? selectedGym.scale
        : profileScales.rope
      : draft.otherScale && scaleChoices.includes(draft.otherScale)
        ? draft.otherScale
        : profileScales[discipline];
  const circuitOptions = discipline === "boulder" && selectedGym && !onBoard ? selectedGym.colors : [];

  // The climb being composed (not persisted — it's a few taps).
  const [circuitId, setCircuitId] = useState<string | null>(null);
  const circuit = circuitOptions.find((x) => x.id === circuitId) ?? null;
  const [gradeIndex, setGradeIndex] = useState<number | null>(null);
  const [result, setResult] = useState<ClimbResult>("send");
  const [attempts, setAttempts] = useState(1);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [showChecklist, setShowChecklist] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const gradeChoices = gradeOptions(activeScale).filter((o) => !circuit || (o.index >= circuit.min && o.index <= circuit.max));
  const canAddClimb = gradeIndex !== null || circuit !== null;
  const rope = discipline === "rope";

  function resetComposer() {
    setCircuitId(null);
    setGradeIndex(null);
    setResult("send");
    setAttempts(1);
  }

  function addClimb() {
    if (!canAddClimb) return;
    const climb: ClimbEntry = {
      id: newId(),
      discipline,
      gradeIndex: gradeIndex ?? circuit!.min,
      gradeScale: activeScale,
      exact: gradeIndex !== null,
      ...(circuit ? { circuit: { name: circuit.name, hex: circuit.hex, min: circuit.min, max: circuit.max } } : {}),
      ...(onBoard
        ? { board: { id: board.id, name: board.id === "other" ? draft.boardOtherName.trim() || sl.boardOther : board.name, angle: draft.angle } }
        : {}),
      result,
      attempts: result === "flash" ? 1 : attempts,
    };
    patch({ climbs: [...draft.climbs, climb] });
    resetComposer();
  }

  function saveSession() {
    if (draft.climbs.length === 0) return;
    const best = bestSent(draft.climbs);
    const gym = selectedGym
      ? {
          name: selectedGym.name,
          id: selectedGym.id,
          home: selectedGym.id === circuits.homeId,
          ...(selectedGym.directoryId ? { directoryId: selectedGym.directoryId } : {}),
        }
      : draft.otherName.trim()
        ? (() => {
            const dir = findByName(draft.otherName);
            return { name: dir?.name ?? draft.otherName.trim(), home: false, ...(dir ? { directoryId: dir.id } : {}) };
          })()
        : undefined;
    addLogEntry({
      date: draft.date,
      drill: draft.drill,
      hardest: best ? climbLabel(best) : "—",
      discipline: best?.discipline ?? discipline,
      gradeIndex: best?.gradeIndex ?? null,
      gradeScale: best?.gradeScale ?? activeScale,
      ...(best?.circuit ? { circuit: best.circuit } : {}),
      ...(gym ? { gym } : {}),
      climbs: draft.climbs,
      elbow: draft.elbow,
      note: draft.note.trim(),
    });
    setDraft(newDraft(circuits.homeId));
    resetComposer();
  }

  function discard() {
    if (!confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    setDraft(newDraft(circuits.homeId));
    resetComposer();
    setConfirmDiscard(false);
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
  const sentCount = draft.climbs.filter(isSent).length;

  return (
    <section className="session-log">
      <h2 className="guide-section__title">{sl.heading}</h2>

      <LevelUpBanner />
      <ProgressStats />

      <button type="button" className="secondary-button" onClick={() => setShowChecklist(true)}>
        {t.checklist.openButton}
      </button>
      {showChecklist && <SessionChecklist onClose={() => setShowChecklist(false)} />}

      <div className="session-log__form">
        <p className="session-log__draft-note">{sl.draftNote}</p>

        <label className="session-log__field">
          <span className="mono-label">{sl.dateLabel}</span>
          <input type="date" value={draft.date} onChange={(e) => patch({ date: e.target.value })} required />
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
                  patch({ gymChoice: g.id });
                  resetComposer();
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
                patch({ gymChoice: OTHER, otherScale: profileScales[discipline] });
                resetComposer();
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
                value={draft.otherName}
                placeholder={c.otherGymName}
                aria-label={c.otherGymName}
                onChange={(e) => patch({ otherName: e.target.value })}
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
            <span className="mono-label">{sl.disciplineLabel}</span>
            <div className="session-log__elbow-group">
              {disciplines.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`chip chip--filterable${discipline === d ? " chip--active" : ""}`}
                  aria-pressed={discipline === d}
                  onClick={() => {
                    patch({ discipline: d, otherScale: profileScales[d] });
                    resetComposer();
                  }}
                >
                  {d === "boulder" ? t.onboarding.boulder : t.onboarding.rope}
                </button>
              ))}
            </div>
          </div>
        )}

        {discipline === "boulder" && (
          <div className="session-log__field">
            <span className="mono-label">{sl.settingLabel}</span>
            <div className="segmented session-log__scales">
              {(["wall", "board"] as const).map((sv) => (
                <button
                  key={sv}
                  type="button"
                  className={`segmented__option${draft.setting === sv ? " segmented__option--active" : ""}`}
                  aria-pressed={draft.setting === sv}
                  onClick={() => {
                    patch({ setting: sv });
                    resetComposer();
                  }}
                >
                  {sv === "wall" ? sl.settingWall : sl.settingBoard}
                </button>
              ))}
            </div>
          </div>
        )}

        {onBoard && (
          <>
            <div className="session-log__field">
              <span className="mono-label">{sl.boardLabel}</span>
              <div className="session-log__elbow-group">
                {BOARDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`chip chip--filterable${draft.boardId === b.id ? " chip--active" : ""}`}
                    aria-pressed={draft.boardId === b.id}
                    onClick={() => {
                      patch({ boardId: b.id, angle: defaultAngle(b), boardScale: b.defaultScale });
                      setGradeIndex(null);
                    }}
                  >
                    {b.id === "other" ? sl.boardOther : b.name}
                  </button>
                ))}
              </div>
              {board.id === "other" && (
                <input
                  type="text"
                  value={draft.boardOtherName}
                  placeholder={sl.boardOtherName}
                  aria-label={sl.boardOtherName}
                  onChange={(e) => patch({ boardOtherName: e.target.value })}
                />
              )}
            </div>
            <div className="session-log__field">
              <span className="mono-label">
                {sl.angleLabel} · {draft.angle}°
              </span>
              <div className="angle-pick" role="group" aria-label={sl.angleLabel}>
                {boardAngles(board).map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`angle-pick__option${draft.angle === a ? " angle-pick__option--active" : ""}`}
                    aria-pressed={draft.angle === a}
                    onClick={() => patch({ angle: a })}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(onBoard || gymChoice === OTHER) && (
          <div className="session-log__field">
            <span className="mono-label">{c.scaleLabel}</span>
            <div className="segmented session-log__scales">
              {(onBoard ? BOULDER_SCALES : scaleChoices).map((sc) => (
                <button
                  key={sc}
                  type="button"
                  className={`segmented__option${activeScale === sc ? " segmented__option--active" : ""}`}
                  aria-pressed={activeScale === sc}
                  onClick={() => {
                    patch(onBoard ? { boardScale: sc } : { otherScale: sc });
                    setGradeIndex(null);
                  }}
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- climbs ---- */}
        <div className="climbs">
          <div className="climbs__head">
            <span className="climbs__title">{sl.climbsHeading(rope)}</span>
            {draft.climbs.length > 0 && <span className="climbs__summary">{sl.summary(draft.climbs.length, sentCount)}</span>}
          </div>

          {draft.climbs.length > 0 && (
            <ul className="climb-list">
              {draft.climbs.map((cl) => (
                <li key={cl.id} className="climb-row">
                  {cl.circuit ? (
                    <span className="circuit-dot circuit-dot--lg" style={{ background: cl.circuit.hex }} />
                  ) : (
                    <span className="climb-row__dot" />
                  )}
                  <span className="climb-row__grade">{climbLabel(cl)}</span>
                  <span className={`climb-row__result climb-row__result--${cl.result}`}>{sl.results[cl.result]}</span>
                  {cl.result !== "flash" && <span className="climb-row__attempts">×{cl.attempts}</span>}
                  {cl.board && (
                    <span className="climb-row__board">
                      {cl.board.name} {cl.board.angle}°
                    </span>
                  )}
                  <button
                    type="button"
                    className="climb-row__remove"
                    aria-label={sl.removeClimb}
                    onClick={() => patch({ climbs: draft.climbs.filter((x) => x.id !== cl.id) })}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="composer">
            {circuitOptions.length > 0 && (
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
            )}

            <label className="session-log__field">
              <span className="mono-label">
                {circuitOptions.length > 0 ? c.exactGrade : sl.gradeLabel} · {SCALE_LABELS[activeScale]}
              </span>
              <select value={gradeIndex ?? ""} onChange={(e) => setGradeIndex(e.target.value === "" ? null : Number(e.target.value))}>
                <option value="">{circuitOptions.length > 0 ? c.exactGradeAny : sl.hardestPlaceholder}</option>
                {gradeChoices.map((opt) => (
                  <option key={opt.index} value={opt.index}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="composer__row">
              <div className="segmented composer__results" role="group" aria-label={sl.resultLabel}>
                {CLIMB_RESULTS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`segmented__option${result === r ? " segmented__option--active" : ""}`}
                    aria-pressed={result === r}
                    onClick={() => setResult(r)}
                  >
                    {sl.results[r]}
                  </button>
                ))}
              </div>
              {result !== "flash" && (
                <div className="stepper" role="group" aria-label={sl.attemptsLabel}>
                  <button type="button" aria-label="−" onClick={() => setAttempts((a) => Math.max(1, a - 1))}>
                    −
                  </button>
                  <span aria-live="polite">
                    {attempts}
                    <span className="stepper__unit"> {sl.attemptsUnit(attempts)}</span>
                  </span>
                  <button type="button" aria-label="+" onClick={() => setAttempts((a) => Math.min(99, a + 1))}>
                    +
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="secondary-button composer__add" disabled={!canAddClimb} onClick={addClimb}>
              + {sl.addClimb(rope)}
            </button>
          </div>
        </div>

        {/* ---- wrap-up ---- */}
        <span className="climbs__title">{sl.wrapUpHeading}</span>

        <label className="session-log__field">
          <span className="mono-label">{sl.drillLabel}</span>
          <select value={draft.drill} onChange={(e) => patch({ drill: e.target.value })}>
            <option value="">{sl.drillNone}</option>
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
          <span className="mono-label">{sl.elbowLabel}</span>
          <div className="session-log__elbow-group">
            {(["better", "same", "worse"] as ElbowChange[]).map((value) => (
              <button
                key={value}
                type="button"
                className={`chip chip--filterable${draft.elbow === value ? " chip--active" : ""}`}
                aria-pressed={draft.elbow === value}
                onClick={() => patch({ elbow: value })}
              >
                {elbowLabels[value]}
              </button>
            ))}
          </div>
        </div>

        <label className="session-log__field">
          <span className="mono-label">{sl.noteLabel}</span>
          <input type="text" value={draft.note} onChange={(e) => patch({ note: e.target.value })} placeholder={sl.notePlaceholder} />
        </label>

        {draft.climbs.length === 0 && <p className="session-log__hint">{sl.noClimbs}</p>}
        <button type="button" className="button-primary" disabled={draft.climbs.length === 0} onClick={saveSession}>
          {sl.saveSession}
        </button>
        {(draft.climbs.length > 0 || draft.note || draft.drill) && (
          <button type="button" className="filters__clear session-log__discard" onClick={discard}>
            {confirmDiscard ? sl.discardConfirm : sl.discard}
          </button>
        )}
      </div>

      {log.length === 0 ? (
        <p className="search-bar__no-results">{sl.emptyMessage}</p>
      ) : (
        <>
          <ul className="session-log__list">
            {log.map((entry) => {
              const climbs = entryClimbs(entry);
              const sent = climbs.filter(isSent).length;
              const best = bestSent(climbs);
              const userScale = best ? profileScales[best.discipline] : null;
              const converted =
                best && best.exact && userScale && best.gradeScale !== userScale ? gradeLabel(best.gradeIndex, userScale) : null;
              return (
                <li key={entry.id} className="session-log__entry">
                  <div className="session-log__entry-header">
                    <span className="session-log__entry-date">{formatDisplayDate(entry.date, lang)}</span>
                    <span className="chip">{elbowLabels[entry.elbow]}</span>
                  </div>
                  <p className="session-log__entry-hardest">
                    {best?.circuit && <span className="circuit-dot circuit-dot--lg" style={{ background: best.circuit.hex }} />}
                    {best?.circuit && <span className="session-log__entry-circuit">{best.circuit.name}</span>}
                    {best ? climbLabel(best) : entry.hardest}
                    {converted && <span className="session-log__entry-tag"> ≈ {converted}</span>}
                    {best?.discipline === "rope" && <span className="session-log__entry-tag"> · {t.onboarding.rope}</span>}
                  </p>
                  {entry.climbs && entry.climbs.length > 0 && (
                    <>
                      <p className="session-log__entry-summary">{sl.summary(climbs.length, sent)}</p>
                      <div className="session-log__entry-climbs" aria-hidden="true">
                        {climbs.map((cl) => (
                          <span
                            key={cl.id}
                            className={`mini-climb mini-climb--${cl.result}`}
                            style={cl.circuit ? { borderColor: cl.circuit.hex } : undefined}
                            title={`${climbLabel(cl)} · ${sl.results[cl.result]}`}
                          >
                            {climbLabel(cl)}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {(entry.board || climbs.some((x) => x.board)) && (
                    <p className="session-log__entry-board">
                      {[...new Set(climbs.filter((x) => x.board).map((x) => `${x.board!.name} · ${x.board!.angle}°`))].join(", ") ||
                        (entry.board ? `${entry.board.name} · ${entry.board.angle}°` : "")}
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
            <div className="header__group" role="group" aria-label={sl.exportFormatAriaLabel}>
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
              {sl.exportButton}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
