// Per-climb session logging. A session holds the climbs tried in it; the
// session-level `hardest` / `gradeIndex` fields are derived from the best
// *sent* climb so older code paths (stats, level-up) keep working.

import { parseGradeAnyScale } from "./grades";
import type { Discipline, GradeScale } from "./grades";

export type ClimbResult = "flash" | "send" | "attempt";
export const CLIMB_RESULTS: ClimbResult[] = ["flash", "send", "attempt"];

export interface ClimbEntry {
  id: string;
  discipline: Discipline;
  /** Exact grade, or the bottom of the circuit range when only a colour was picked. */
  gradeIndex: number;
  gradeScale: GradeScale;
  exact: boolean;
  circuit?: { name: string; hex: string; min: number; max: number };
  board?: { id: string; name: string; angle: number };
  result: ClimbResult;
  attempts: number;
}

export function isSent(c: ClimbEntry): boolean {
  return c.result !== "attempt";
}

interface LegacyEntry {
  id: string;
  hardest: string;
  discipline?: Discipline;
  gradeIndex?: number | null;
  gradeScale?: GradeScale;
  circuit?: ClimbEntry["circuit"];
  board?: ClimbEntry["board"];
  climbs?: ClimbEntry[];
}

/** Climbs of an entry; entries logged before per-climb logging become one sent climb. */
export function entryClimbs(e: LegacyEntry): ClimbEntry[] {
  if (e.climbs && e.climbs.length > 0) return e.climbs;
  const discipline = e.discipline ?? "boulder";
  const index = e.gradeIndex ?? parseGradeAnyScale(e.hardest, discipline);
  if (index === null || index === undefined) return [];
  return [
    {
      id: `${e.id}-legacy`,
      discipline,
      gradeIndex: index,
      gradeScale: e.gradeScale ?? (discipline === "boulder" ? "V" : "French"),
      exact: !e.circuit,
      ...(e.circuit ? { circuit: e.circuit } : {}),
      ...(e.board ? { board: e.board } : {}),
      result: "send",
      attempts: 1,
    },
  ];
}

/** Hardest sent climb, preferring boulder when a session mixes disciplines. */
export function bestSent(climbs: ClimbEntry[]): ClimbEntry | null {
  let best: ClimbEntry | null = null;
  for (const c of climbs) {
    if (!isSent(c)) continue;
    if (!best || (c.discipline === best.discipline ? c.gradeIndex > best.gradeIndex : c.discipline === "boulder")) best = c;
  }
  return best;
}
