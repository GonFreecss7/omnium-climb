import { useEffect, useState } from "react";
import { useAppState } from "../state/AppState";
import DrillsView from "./DrillsView";
import StrengthView from "./StrengthView";

/** The "Train" tab: technique drills or finger-strength protocols. */
export default function TrainView() {
  const { t, guide, scrollTarget } = useAppState();
  const isStrengthTarget = (id: string | null) =>
    !!id && (id === `section-${guide.workoutSection?.number}` || guide.workouts.some((w) => w.id === id));
  const [mode, setMode] = useState<"drills" | "strength">(() => (isStrengthTarget(scrollTarget) ? "strength" : "drills"));

  // A §N link into the strength section (or a workout) switches mode first.
  useEffect(() => {
    if (isStrengthTarget(scrollTarget)) setMode("strength");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollTarget, guide]);

  return (
    <div className="view">
      <div className="segmented train__switch" role="tablist">
        {(["drills", "strength"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`segmented__option${mode === m ? " segmented__option--active" : ""}`}
            onClick={() => setMode(m)}
          >
            {t.strength.modes[m]}
          </button>
        ))}
      </div>
      {mode === "drills" ? <DrillsView embedded /> : <StrengthView />}
    </div>
  );
}
