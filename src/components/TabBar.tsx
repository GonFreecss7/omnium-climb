import { useAppState } from "../state/AppState";
import type { Tab } from "../state/AppState";

const TABS: Tab[] = ["guide", "techniques", "drills", "progressions", "session"];

export default function TabBar() {
  const { tab, setTab, t } = useAppState();

  return (
    <nav className="tabbar" aria-label={t.nav.ariaLabel}>
      {TABS.map((id) => (
        <button
          key={id}
          type="button"
          className={`tabbar__item${tab === id ? " tabbar__item--active" : ""}`}
          aria-current={tab === id ? "page" : undefined}
          onClick={() => setTab(id)}
        >
          {t.nav[id]}
        </button>
      ))}
    </nav>
  );
}
