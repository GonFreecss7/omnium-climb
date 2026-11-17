import { useAppState } from "../state/AppState";
import type { Theme } from "../state/AppState";
import type { Lang } from "../i18n/ui";
import Modal from "./Modal";
import Icon from "./Icon";

export default function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { t, lang, setLang, theme, setTheme, levelInfo, openOnboarding } = useAppState();

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
        </div>
      </div>
    </Modal>
  );
}
