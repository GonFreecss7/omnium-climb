/**
 * Finger-strength self-assessments (Lattice protocol: 7 s two-arm dead hang on
 * a 20 mm edge). Stored per device in `cg.fingerTests`, newest first.
 */

export type TestGrip = "half" | "open";

export interface FingerTest {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  bodyweightKg: number;
  /** Weight hung from the harness; negative when weight was removed with a pulley. */
  addedKg: number;
  edgeMm: number;
  grip: TestGrip;
}

export function totalLoad(t: FingerTest): number {
  return t.bodyweightKg + t.addedKg;
}

/** Total load as a percentage of bodyweight (Lattice's score). */
export function percentBW(t: FingerTest): number {
  return (totalLoad(t) / t.bodyweightKg) * 100;
}

/**
 * Harness load for training at `fraction` of the tested total load, at the
 * climber's current bodyweight. Negative means remove that much with a pulley.
 * Rounded to 0.5 kg, the smallest plate step most walls have.
 */
export function harnessLoadAt(t: FingerTest, fraction: number, bodyweightKg = t.bodyweightKg): number {
  return Math.round((totalLoad(t) * fraction - bodyweightKg) * 2) / 2;
}

/** Lattice's training prescriptions derived from the test, as fractions of max total load. */
export const LATTICE_PRESCRIPTIONS = [
  { id: "maxStrength", fraction: 0.85 },
  { id: "anaerobic", fraction: 0.8 },
] as const;

export function isFingerTestList(v: unknown): v is FingerTest[] {
  return (
    Array.isArray(v) &&
    v.every(
      (t) =>
        t &&
        typeof t === "object" &&
        typeof t.id === "string" &&
        typeof t.date === "string" &&
        typeof t.bodyweightKg === "number" &&
        t.bodyweightKg > 0 &&
        typeof t.addedKg === "number" &&
        typeof t.edgeMm === "number" &&
        (t.grip === "half" || t.grip === "open"),
    )
  );
}

export function sortTests(tests: FingerTest[]): FingerTest[] {
  return [...tests].sort((a, b) => (a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date)));
}

/**
 * Comparable history for the latest test's edge and grip, oldest first —
 * changing either changes what the number means, so they never share a line.
 */
export function comparableHistory(tests: FingerTest[]): FingerTest[] {
  const sorted = sortTests(tests);
  const latest = sorted[0];
  if (!latest) return [];
  return sorted.filter((t) => t.edgeMm === latest.edgeMm && t.grip === latest.grip).reverse();
}
