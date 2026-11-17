import { useState } from "react";
import { useAppState } from "../state/AppState";
import { gradeLabel } from "../domain/grades";
import { suggestLevelUp } from "../domain/levels";

const DISMISSED_KEY = "cg.levelUpDismissed";

function readDismissed(): string | null {
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

/**
 * Shown when recent log entries contain a harder grade than the profile
 * records. Dismissal is remembered per discipline + grade, so it comes back
 * only when an even harder grade is logged.
 */
export default function LevelUpBanner() {
  const { t, profile, log, saveProfile } = useAppState();
  const [dismissed, setDismissed] = useState<string | null>(readDismissed);

  if (!profile) return null;
  const suggestion = suggestLevelUp(profile, log);
  if (!suggestion) return null;

  const key = `${suggestion.discipline}:${suggestion.loggedBest}`;
  if (dismissed === key) return null;

  const scale = suggestion.discipline === "boulder" ? profile.boulderScale : profile.ropeScale;
  const grade = gradeLabel(suggestion.loggedBest, scale);
  const previous = suggestion.profileMax === null ? "—" : gradeLabel(suggestion.profileMax, scale);

  function dismiss() {
    setDismissed(key);
    try {
      localStorage.setItem(DISMISSED_KEY, key);
    } catch {
      // ignore write failures
    }
  }

  function accept() {
    if (!profile || !suggestion) return;
    saveProfile(
      suggestion.discipline === "boulder"
        ? { ...profile, boulderMax: suggestion.loggedBest }
        : { ...profile, ropeMax: suggestion.loggedBest },
    );
  }

  return (
    <div className="levelup" role="status">
      <p className="levelup__title">{t.levelUp.title}</p>
      <p className="levelup__body">{t.levelUp.body(grade, previous)}</p>
      <div className="levelup__actions">
        <button type="button" className="button-primary" onClick={accept}>
          {t.levelUp.update}
        </button>
        <button type="button" className="filters__clear" onClick={dismiss}>
          {t.levelUp.dismiss}
        </button>
      </div>
    </div>
  );
}
