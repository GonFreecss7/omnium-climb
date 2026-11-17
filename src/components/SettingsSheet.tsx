import { useAppState } from "../state/AppState";
import type { Theme } from "../state/AppState";
import type { Lang } from "../i18n/ui";
import Modal from "./Modal";
import Icon from "./Icon";
import { homeGym } from "../domain/circuits";
import { LEVELS } from "../domain/levels";
import BackupSection from "./BackupSection";

interface Props {
  onClose: () => void;
  onOpenCircuits: () => void;
  onOpenLevelColors: () => void;
}

export default function SettingsSheet({ onClose, onOpenCircuits, onOpenLevelColors }: Props) {
  const { t, lang, setLang, theme, setTheme, levelInfo, openOnboarding, circuits } = useAppState();
  const home = homeGym(circuits);

  const langs: Array<{ id: Lang; label: string }> = [
    { id: "es", label: "Español" },
    { id: "en", label: "English" },
  ];
  const themes: Array<{ id: Theme; label: string }> = [
    { id: "dark", label: t.header.themeDark },
    { id: "light", label: t.header.themeLight },
  ];

  return (
    <Modal ariaLabel={t.settings.title}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{t.settings.title}</h2>
          <button type="button" className="modal__close" aria-label={t.settings.close} onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="modal__body settings">
          <div className="settings__row">
            <span className="settings__label">{t.settings.language}</span>
            <div className="segmented" role="group" aria-label={t.header.langToggleAriaLabel}>
              {langs.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`segmented__option${lang === l.id ? " segmented__option--active" : ""}`}
                  aria-pressed={lang === l.id}
                  onClick={() => setLang(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings__row">
            <span className="settings__label">{t.settings.theme}</span>
            <div className="segmented" role="group" aria-label={t.header.themeToggleAriaLabel}>
              {themes.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  className={`segmented__option${theme === th.id ? " segmented__option--active" : ""}`}
                  aria-pressed={theme === th.id}
                  onClick={() => setTheme(th.id)}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings__row">
            <span className="settings__label">{t.settings.profile}</span>
            <button
              type="button"
              className="settings__profile"
              onClick={() => {
                onClose();
                openOnboarding();
              }}
            >
              <span className={`level-dot${levelInfo ? ` level-dot--${levelInfo.level}` : ""}`} aria-hidden="true" />
              <span className="settings__profile-text">
                {levelInfo ? t.levels[levelInfo.level] : t.settings.createProfile}
              </span>
              <span className="settings__profile-action">{levelInfo ? t.settings.editProfile : ""}</span>
            </button>
          </div>

          <div className="settings__row">
            <span className="settings__label">{t.settings.circuits}</span>
            <button type="button" className="settings__profile" onClick={onOpenCircuits}>
              <span className="settings__swatches" aria-hidden="true">
                {(home?.colors ?? []).slice(0, 8).map((c) => (
                  <span key={c.id} className="settings__swatch" style={{ background: c.hex }} />
                ))}
              </span>
              <span className="settings__profile-text">{home ? home.name : t.settings.circuitsNone}</span>
              <span className="settings__profile-action">{t.settings.edit}</span>
            </button>
          </div>

          <div className="settings__row">
            <span className="settings__label">{t.settings.levelColors}</span>
            <button type="button" className="settings__profile" onClick={onOpenLevelColors}>
              <span className="settings__tapes" aria-hidden="true">
                {LEVELS.map((l) => (
                  <span key={l} className={`settings__tape tape tape--${l}`} />
                ))}
              </span>
              <span className="settings__profile-text settings__profile-text--small">{t.settings.levelColorsHint}</span>
              <span className="settings__profile-action">{t.settings.edit}</span>
            </button>
          </div>

          <BackupSection />
        </div>
      </div>
    </Modal>
  );
}
