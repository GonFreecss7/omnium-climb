import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import Prose from "../components/Prose";
import SessionLog from "../components/SessionLog";
import { APP_VERSION } from "../version";

export default function SessionView() {
  const { guide, scrollTarget, clearScrollTarget } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const file = guide.prose.find((p) => p.id === "session");
  if (!file) return null;

  return (
    <div className="view">
      <h1 className="view__heading">{file.title}</h1>
      {file.sections.map((section) => (
        <section key={section.number} id={`section-${section.number}`} className="guide-section">
          <h2 className="guide-section__title">{section.title}</h2>
          <Prose body={section.body} />
        </section>
      ))}
      <SessionLog />
      <p className="mono-label app-version">v{APP_VERSION}</p>
    </div>
  );
}
