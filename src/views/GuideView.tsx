import { useAppState } from "../state/AppState";
import { useScrollToTarget } from "../hooks/useScrollToTarget";
import Prose from "../components/Prose";

export default function GuideView() {
  const { guide, scrollTarget, clearScrollTarget } = useAppState();
  useScrollToTarget(scrollTarget, clearScrollTarget);

  const file = guide.prose.find((p) => p.id !== "session");
  if (!file) return null;

  return (
    <div className="view">
      <h1 className="view__heading">{guide.meta.title}</h1>
      <p className="view__subheading">{guide.meta.subtitle}</p>
      {file.sections.map((section) => (
        <section key={section.number} id={`section-${section.number}`} className="guide-section">
          <h2 className="guide-section__title">{section.title}</h2>
          <Prose body={section.body} />
        </section>
      ))}
    </div>
  );
}
