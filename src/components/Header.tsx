import { useState } from "react";
import { useAppState } from "../state/AppState";
import Icon from "./Icon";
import SettingsSheet from "./SettingsSheet";

export default function Header() {
  const { t, levelInfo, openOnboarding } = useAppState();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          onClick={() => setSettingsOpen(true)}
        >
          <Icon name="settings" />
        </button>
      </div>
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </header>
  );
}
