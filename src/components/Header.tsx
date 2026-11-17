import { useState } from "react";
import { useAppState } from "../state/AppState";
import Icon from "./Icon";
import SettingsSheet from "./SettingsSheet";
import CircuitEditor from "./CircuitEditor";
import LevelColorsEditor from "./LevelColorsEditor";

type Sheet = "settings" | "circuits" | "levelColors" | null;

export default function Header() {
  const { t, levelInfo, openOnboarding } = useAppState();
  const [sheet, setSheet] = useState<Sheet>(null);

  return (
    <header className="header">
      <span className="header__brand">Omnium Climb</span>
      <div className="header__actions">
        <button
          type="button"
          className="header__profile"
          aria-label={t.profile.buttonAriaLabel}
          onClick={openOnboarding}
        >
          <span className={`level-dot${levelInfo ? ` level-dot--${levelInfo.level}` : ""}`} aria-hidden="true" />
          {levelInfo ? t.levels[levelInfo.level] : t.profile.setUp}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={t.settings.open}
          onClick={() => setSheet("settings")}
        >
          <Icon name="settings" />
        </button>
      </div>
      {sheet === "settings" && (
        <SettingsSheet
          onClose={() => setSheet(null)}
          onOpenCircuits={() => setSheet("circuits")}
          onOpenLevelColors={() => setSheet("levelColors")}
        />
      )}
      {sheet === "circuits" && <CircuitEditor onClose={() => setSheet("settings")} />}
      {sheet === "levelColors" && <LevelColorsEditor onClose={() => setSheet("settings")} />}
    </header>
  );
}
