import { useMemo } from "react";
import { useAppState } from "../state/AppState";
import { usePersistentState } from "../hooks/usePersistentState";
import { isFingerTestList } from "../domain/fingerTests";
import type { FingerTest } from "../domain/fingerTests";
import { coach } from "../domain/coach";
import type { Item } from "../domain/coach";
import { todayLocalISO } from "../utils/sessionStats";
import { getGuide } from "../data";

/** "Next session" suggestion, computed on the device from profile, log and finger tests. */
export default function CoachCard() {
  const { guide, t, profile, levelInfo, log, goToEntry, goToSection, openOnboarding } = useAppState();
  const c = t.coach;
  const [tests] = usePersistentState<FingerTest[]>("cg.fingerTests", () => [], isFingerTestList);
  const today = todayLocalISO();

  const plan = useMemo(() => {
    const names = new Map<string, string[]>();
    for (const g of [getGuide("en"), getGuide("es")]) for (const d of g.drills) names.set(d.id, [...(names.get(d.id) ?? []), d.name]);
    return coach({
      today,
      profile,
      level: levelInfo?.level ?? null,
      log,
      tests,
      scales: { boulder: profile?.boulderScale ?? "V", rope: profile?.ropeScale ?? "French" },
      drills: guide.drills.map((d) => ({ id: d.id, categoryId: d.categoryId, names: names.get(d.id) ?? [d.name] })),
      drillTechniques: Object.fromEntries(guide.drills.map((d) => [d.id, d.relatedTechniques])),
      techniques: guide.techniques.map((x) => ({ id: x.id, level: x.level, caution: x.caution })),
    });
  }, [today, profile, levelInfo, log, tests, guide]);

  function label(item: Item): { kind: string; name: string; why: string; go: () => void } | null {
    switch (item.kind) {
      case "drill": {
        const d = guide.drills.find((x) => x.id === item.id);
        if (!d) return null;
        const cat = guide.drillCategories.find((x) => x.id === d.categoryId);
        return { kind: c.kinds.drill, name: d.name, why: c.drillWhy(cat?.title ?? "", item.daysSince), go: () => goToEntry("drill", d.id) };
      }
      case "technique": {
        const x = guide.techniques.find((y) => y.id === item.id);
        if (!x) return null;
        return { kind: c.kinds.technique, name: x.name, why: c.techniqueWhy, go: () => goToEntry("technique", x.id) };
      }
      case "workout": {
        const w = guide.workouts.find((y) => y.id === item.id);
        if (!w) return null;
        return { kind: c.kinds.workout, name: w.name, why: c.workoutWhy[item.why](item.daysSinceTest ?? 0), go: () => goToEntry("drill", w.id) };
      }
      case "section": {
        const entry = guide.sectionIndex[String(item.number)];
        return { kind: c.kinds.section, name: `§${item.number} ${entry?.title ?? ""}`, why: c.sectionWhy, go: () => goToSection(item.number) };
      }
    }
  }

  const rows = plan.items.map(label).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <section className={`coach coach--${plan.focus}`} aria-labelledby="coach-focus">
      <span className="mono-label coach__eyebrow">{c.heading}</span>
      <h2 id="coach-focus" className="coach__focus">
        {c.focus[plan.focus].title}
      </h2>
      <p className="coach__plan">{c.focus[plan.focus].plan}</p>
      <p className="coach__why">{c.reason(plan.reason)}</p>

      {rows.length > 0 && (
        <ul className="coach__items">
          {rows.map((r) => (
            <li key={`${r.kind}-${r.name}`}>
              <button type="button" className="coach__item" onClick={r.go}>
                <span className="coach__kind">{r.kind}</span>
                <span className="coach__name">{r.name}</span>
                <span className="coach__item-why">{r.why}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {plan.notes.map((n) =>
        n.code === "noProfile" ? (
          <p key={n.code} className="coach__note">
            {c.notes.noProfile}{" "}
            <button type="button" className="filters__clear" onClick={openOnboarding}>
              {c.notes.createProfile}
            </button>
          </p>
        ) : (
          <p key={n.code} className="coach__note">
            {c.notes[n.code](n.done, n.target)}
          </p>
        ),
      )}

      <p className="coach__fine">{c.fine}</p>
    </section>
  );
}
