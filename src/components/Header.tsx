import { useAppState } from "../state/AppState";
import type { Lang } from "../i18n/ui";
import type { Theme } from "../state/AppState";

export default function Header() {
  const { lang, setLang, theme, setTheme, t } = useAppState();

  const otherLang: Lang = lang === "en" ? "es" : "en";
  const otherTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <header className="header">
      <div className="header__brand mono-label">Climb Guide</div>
      <div className="header__controls">
        <button
          type="button"
          className="header__toggle mono-label"
          aria-label={`${lang.toUpperCase()}, ${t.header.langToggleAriaLabel}`}
          onClick={() => setLang(otherLang)}
        >
          {lang.toUpperCase()}
        </button>
        <button
          type="button"
          className="header__toggle mono-label"
          aria-label={`${theme === "dark" ? t.header.themeDark : t.header.themeLight}, ${t.header.themeToggleAriaLabel}`}
          onClick={() => setTheme(otherTheme)}
        >
          {theme === "dark" ? t.header.themeDark : t.header.themeLight}
        </button>
      </div>
    </header>
  );
}
