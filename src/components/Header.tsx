import { useAppState } from "../state/AppState";

export default function Header() {
  const { lang, setLang, theme, setTheme, t } = useAppState();

  return (
    <header className="header">
      <div className="header__group" role="group" aria-label={t.header.langToggleAriaLabel}>
        <button
          type="button"
          className={`header__pill${lang === "en" ? " header__pill--active" : ""}`}
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          type="button"
          className={`header__pill${lang === "es" ? " header__pill--active" : ""}`}
          aria-pressed={lang === "es"}
          onClick={() => setLang("es")}
        >
          ES
        </button>
      </div>
      <div className="header__group" role="group" aria-label={t.header.themeToggleAriaLabel}>
        <button
          type="button"
          className={`header__pill${theme === "dark" ? " header__pill--active" : ""}`}
          aria-pressed={theme === "dark"}
          onClick={() => setTheme("dark")}
        >
          {t.header.themeDark}
        </button>
        <button
          type="button"
          className={`header__pill${theme === "light" ? " header__pill--active" : ""}`}
          aria-pressed={theme === "light"}
          onClick={() => setTheme("light")}
        >
          {t.header.themeLight}
        </button>
      </div>
    </header>
  );
}
