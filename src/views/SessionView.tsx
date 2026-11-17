import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import Prose from "../components/Prose";
import SessionLog from "../components/SessionLog";
import CoachCard from "../components/CoachCard";
import { APP_VERSION } from "../version";

export default function SessionView() {
  const { guide, scrollTarget, clearScrollTarget } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const file = guide.prose.find((p) => p.id === "session");
  const warmup = guide.prose.find((p) => p.id === "warmup");
  if (!file) return null;
  // §16 (warm-up) reads best right after §14's session plan, before §15's tracking.
  const sections = [...file.sections, ...(warmup?.sections ?? [])].sort((a, b) => {
    const order = (n: number) => (n === 16 ? 14.5 : n);
    return order(a.number) - order(b.number);
  });

  return (
    <div className="view">
      <h1 className="view__heading">{file.title}</h1>
      <CoachCard />
      {sections.map((section) => (
        <section key={section.number} id={`section-${section.number}`} className="guide-section">
          <h2 className="guide-section__title">
            <span className="guide-section__num">§{section.number}</span>
            {section.title}
          </h2>
          <Prose body={section.body} />
        </section>
      ))}
      <SessionLog />
      <p className="mono-label app-version">v{APP_VERSION}</p>
    </div>
  );
}
