import { useMemo, useState } from "react";
import { useAppState } from "../state/AppState";
import Modal from "./Modal";
import { BOULDER_SCALES, ROPE_SCALES, SCALE_LABELS, equivalents, gradeLabel, gradeOptions } from "../domain/grades";
import type { BoulderScale, Discipline, GradeScale, RopeScale } from "../domain/grades";
import { EXPERIENCES, LEVELS, computeLevel } from "../domain/levels";
import type { ClimberProfile, Level } from "../domain/levels";

type Step = "welcome" | "disciplines" | "scales" | "grades" | "experience" | "body" | "result";

function emptyProfile(): ClimberProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    disciplines: ["boulder"],
    boulderScale: "V",
    ropeScale: "French",
    boulderMax: null,
    ropeMax: null,
    experience: "lt1",
    sessionsPerWeek: 2,
    weightKg: null,
    heightCm: null,
    injured: false,
    levelOverride: null,
    createdAt: now,
    updatedAt: now,
  };
}

function parseOptionalNumber(text: string, min: number, max: number): number | null {
  const n = Number(text.replace(",", "."));
  if (text.trim() === "" || !Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n * 10) / 10;
}

export default function Onboarding() {
  const { t, profile, saveProfile, deleteProfile, closeOnboarding } = useAppState();
  const o = t.onboarding;

  const [draft, setDraft] = useState<ClimberProfile>(() => profile ?? emptyProfile());
  const [weightText, setWeightText] = useState(profile?.weightKg != null ? String(profile.weightKg) : "");
  const [heightText, setHeightText] = useState(profile?.heightCm != null ? String(profile.heightCm) : "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const steps: Step[] = useMemo(
    () => [...(profile ? [] : (["welcome"] as Step[])), "disciplines", "scales", "grades", "experience", "body", "result"],
    [profile],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex]!;
  const numberedSteps: Step[] = steps.filter((s) => s !== "welcome");
  const stepNumber = numberedSteps.indexOf(step) + 1;

  const update = (patch: Partial<ClimberProfile>) => setDraft((d) => ({ ...d, ...patch }));

  function toggleDiscipline(d: Discipline) {
    const has = draft.disciplines.includes(d);
    const next = has ? draft.disciplines.filter((x) => x !== d) : [...draft.disciplines, d];
    update({ disciplines: (["boulder", "rope"] as Discipline[]).filter((x) => next.includes(x)) });
  }

  const canAdvance = step !== "disciplines" || draft.disciplines.length > 0;

  function finalDraft(): ClimberProfile {
    return {
      ...draft,
      weightKg: parseOptionalNumber(weightText, 20, 250),
      heightCm: parseOptionalNumber(heightText, 100, 250),
    };
  }

  const result = computeLevel(finalDraft());
  const computedWithoutOverride = computeLevel({ ...finalDraft(), levelOverride: null });

  function renderScalePicker(discipline: Discipline) {
    const scales: GradeScale[] = discipline === "boulder" ? BOULDER_SCALES : ROPE_SCALES;
    const current = discipline === "boulder" ? draft.boulderScale : draft.ropeScale;
    return (
      <div className="onboarding__field" key={discipline}>
        <span className="mono-label">{discipline === "boulder" ? o.boulder : o.rope}</span>
        <div className="chip-row">
          {scales.map((scale) => (
            <button
              key={scale}
              type="button"
              className={`chip chip--filterable${current === scale ? " chip--active" : ""}`}
              aria-pressed={current === scale}
              onClick={() =>
                discipline === "boulder"
                  ? update({ boulderScale: scale as BoulderScale })
                  : update({ ropeScale: scale as RopeScale })
              }
            >
              {SCALE_LABELS[scale]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderGradePicker(discipline: Discipline) {
    const scale = discipline === "boulder" ? draft.boulderScale : draft.ropeScale;
    const value = discipline === "boulder" ? draft.boulderMax : draft.ropeMax;
    const set = (v: number | null) => (discipline === "boulder" ? update({ boulderMax: v }) : update({ ropeMax: v }));
    return (
      <label className="session-log__field" key={discipline}>
        <span className="mono-label">
          {discipline === "boulder" ? o.boulder : o.rope} · {SCALE_LABELS[scale]}
        </span>
        <select value={value ?? ""} onChange={(e) => set(e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">{o.gradeUnknown}</option>
          {gradeOptions(scale).map((opt) => (
            <option key={opt.index} value={opt.index}>
              {opt.label}
            </option>
          ))}
        </select>
        {value !== null && <span className="onboarding__equiv">≈ {equivalents(value, scale)}</span>}
      </label>
    );
  }

  return (
    <Modal ariaLabel={o.title}>
      <div className="modal onboarding">
        <div className="modal__header">
          <h2 className="modal__title">{o.title}</h2>
          <button type="button" className="modal__close" aria-label={o.closeAriaLabel} onClick={closeOnboarding}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="modal__body">
          {step !== "welcome" && (
            <div className="onboarding__progress" aria-hidden="true">
              {numberedSteps.map((s, i) => (
                <span key={s} className={`onboarding__dot${i < stepNumber ? " onboarding__dot--done" : ""}`} />
              ))}
            </div>
          )}
          {step !== "welcome" && (
            <p className="mono-label onboarding__step">
              {o.step} {stepNumber}/{numberedSteps.length}
            </p>
          )}

          {step === "welcome" && (
            <div className="onboarding__welcome">
              <p className="onboarding__lead">{o.intro}</p>
              <p className="onboarding__hint">{o.privacy}</p>
            </div>
          )}

          {step === "disciplines" && (
            <fieldset className="onboarding__fieldset">
              <legend className="onboarding__question">{o.disciplinesQuestion}</legend>
              <div className="chip-row">
                {(["boulder", "rope"] as Discipline[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`chip chip--filterable${draft.disciplines.includes(d) ? " chip--active" : ""}`}
                    aria-pressed={draft.disciplines.includes(d)}
                    onClick={() => toggleDiscipline(d)}
                  >
                    {d === "boulder" ? o.boulder : o.rope}
                  </button>
                ))}
              </div>
              {draft.disciplines.length === 0 && <p className="onboarding__error">{o.pickOne}</p>}
            </fieldset>
          )}

          {step === "scales" && (
            <fieldset className="onboarding__fieldset">
              <legend className="onboarding__question">{o.scaleQuestion}</legend>
              {draft.disciplines.map(renderScalePicker)}
            </fieldset>
          )}

          {step === "grades" && (
            <fieldset className="onboarding__fieldset">
              <legend className="onboarding__question">{o.gradeQuestion}</legend>
              <p className="onboarding__hint">{o.gradeHint}</p>
              {draft.disciplines.map(renderGradePicker)}
            </fieldset>
          )}

          {step === "experience" && (
            <fieldset className="onboarding__fieldset">
              <legend className="onboarding__question">{o.experienceQuestion}</legend>
              <div className="chip-row">
                {EXPERIENCES.map((x) => (
                  <button
                    key={x}
                    type="button"
                    className={`chip chip--filterable${draft.experience === x ? " chip--active" : ""}`}
                    aria-pressed={draft.experience === x}
                    onClick={() => update({ experience: x })}
                  >
                    {o.experience[x]}
                  </button>
                ))}
              </div>
              <span className="mono-label onboarding__subq">{o.sessionsQuestion}</span>
              <div className="chip-row">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`chip chip--filterable onboarding__num${draft.sessionsPerWeek === n ? " chip--active" : ""}`}
                    aria-pressed={draft.sessionsPerWeek === n}
                    onClick={() => update({ sessionsPerWeek: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === "body" && (
            <fieldset className="onboarding__fieldset">
              <legend className="onboarding__question">{o.bodyQuestion}</legend>
              <p className="onboarding__hint">{o.bodyHint}</p>
              <div className="onboarding__row">
                <label className="session-log__field">
                  <span className="mono-label">{o.weight}</span>
                  <input type="text" inputMode="decimal" value={weightText} onChange={(e) => setWeightText(e.target.value)} />
                </label>
                <label className="session-log__field">
                  <span className="mono-label">{o.height}</span>
                  <input type="text" inputMode="numeric" value={heightText} onChange={(e) => setHeightText(e.target.value)} />
                </label>
              </div>
              <span className="mono-label onboarding__subq">{o.injuryQuestion}</span>
              <div className="chip-row">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    className={`chip chip--filterable${draft.injured === v ? " chip--active" : ""}`}
                    aria-pressed={draft.injured === v}
                    onClick={() => update({ injured: v })}
                  >
                    {v ? o.yes : o.no}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === "result" && (
            <div className="onboarding__result">
              <span className="mono-label">{o.resultTitle}</span>
              <p className={`onboarding__level level-text--${result.level}`}>{t.levels[result.level]}</p>
              <p className="onboarding__hint">{o.source[result.source]}</p>
              {result.capped && <p className="onboarding__hint">{o.capped}</p>}
              {draft.disciplines.includes("boulder") && draft.boulderMax !== null && (
                <p className="onboarding__hint">
                  {o.boulder}: {gradeLabel(draft.boulderMax, draft.boulderScale)}
                </p>
              )}
              {draft.disciplines.includes("rope") && draft.ropeMax !== null && (
                <p className="onboarding__hint">
                  {o.rope}: {gradeLabel(draft.ropeMax, draft.ropeScale)}
                </p>
              )}

              <span className="mono-label onboarding__subq">{o.overrideLabel}</span>
              <div className="chip-row">
                <button
                  type="button"
                  className={`chip chip--filterable${draft.levelOverride === null ? " chip--active" : ""}`}
                  aria-pressed={draft.levelOverride === null}
                  onClick={() => update({ levelOverride: null })}
                >
                  {o.overrideAuto} ({t.levels[computedWithoutOverride.level]})
                </button>
                {LEVELS.map((l: Level) => (
                  <button
                    key={l}
                    type="button"
                    className={`chip chip--filterable${draft.levelOverride === l ? " chip--active" : ""}`}
                    aria-pressed={draft.levelOverride === l}
                    onClick={() => update({ levelOverride: l })}
                  >
                    {t.levels[l]}
                  </button>
                ))}
              </div>
              <p className="onboarding__bands">{o.bandsNote}</p>
            </div>
          )}

          <div className="onboarding__actions">
            {step === "welcome" ? (
              <>
                <button type="button" className="button-primary" onClick={() => setStepIndex(1)}>
                  {o.start}
                </button>
                <button type="button" className="filters__clear" onClick={closeOnboarding}>
                  {o.skip}
                </button>
              </>
            ) : (
              <>
                {step === "result" ? (
                  <button type="button" className="button-primary" onClick={() => saveProfile(finalDraft())}>
                    {o.save}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button-primary"
                    disabled={!canAdvance}
                    onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                  >
                    {o.next}
                  </button>
                )}
                {stepIndex > 0 && steps[stepIndex - 1] !== "welcome" && (
                  <button type="button" className="secondary-button" onClick={() => setStepIndex((i) => i - 1)}>
                    {o.back}
                  </button>
                )}
              </>
            )}
            {profile && step === "result" && (
              <button
                type="button"
                className="filters__clear onboarding__delete"
                onClick={() => {
                  if (!confirmDelete) {
                    setConfirmDelete(true);
                    return;
                  }
                  deleteProfile();
                  closeOnboarding();
                }}
              >
                {confirmDelete ? o.deleteConfirm : o.deleteProfile}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
