import type { ElbowChange, SessionLogEntry } from "../state/AppState";
import type { Lang, UiStrings } from "../i18n/ui";
import { gradeLabel, parseGradeAnyScale } from "../domain/grades";
import type { BoulderScale, Discipline, RopeScale } from "../domain/grades";

export function elbowLabels(t: UiStrings): Record<ElbowChange, string> {
  return {
    better: t.sessionLog.elbowBetter,
    same: t.sessionLog.elbowSame,
    worse: t.sessionLog.elbowWorse,
  };
}

/**
 * Today's date as "YYYY-MM-DD" in the *local* calendar day — not
 * `Date.toISOString()`, which is UTC and rolls over to the next day for
 * anyone west of Greenwich in the evening (e.g. 22:32 local in a UTC-5 zone
 * is already past midnight UTC).
 */
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Formats a "YYYY-MM-DD" string for display in the active language, parsed as a local date. */
export function formatDisplayDate(isoDate: string, lang: Lang): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(lang === "es" ? "es" : "en", { dateStyle: "medium" }).format(date);
}

export interface DisplayScales {
  boulder: BoulderScale;
  rope: RopeScale;
}

/** Ladder index of an entry's grade — structured if present, otherwise parsed from the legacy free text. */
export function entryGradeIndex(e: SessionLogEntry): { discipline: Discipline; index: number } | null {
  const discipline = e.discipline ?? "boulder";
  const index = e.gradeIndex ?? parseGradeAnyScale(e.hardest, discipline);
  return index === null || index === undefined ? null : { discipline, index };
}

/** The entry's grade shown in the climber's current scale, falling back to what was typed. */
export function entryGradeLabel(e: SessionLogEntry, scales: DisplayScales): string {
  const g = entryGradeIndex(e);
  if (!g) return e.hardest;
  return gradeLabel(g.index, g.discipline === "boulder" ? scales.boulder : scales.rope);
}

export interface SessionStats {
  sessionsLogged: number;
  highestBoulder: number | null;
  highestRope: number | null;
  recentGradeLabels: string[];
  mostUsedDrill: { name: string; count: number } | null;
  recentElbow: ElbowChange[];
}

/** `log` is newest-first, as stored. All "recent" sequences are returned oldest-to-newest. */
export function computeSessionStats(log: SessionLogEntry[], scales: DisplayScales): SessionStats {
  const chronological = [...log].reverse();

  let highestBoulder: number | null = null;
  let highestRope: number | null = null;
  for (const e of chronological) {
    const g = entryGradeIndex(e);
    if (!g) continue;
    if (g.discipline === "boulder") highestBoulder = Math.max(highestBoulder ?? -1, g.index);
    else highestRope = Math.max(highestRope ?? -1, g.index);
  }

  const recentGradeLabels = chronological.slice(-5).map((e) => entryGradeLabel(e, scales));

  const drillCounts = new Map<string, number>();
  for (const e of log) {
    if (!e.drill) continue;
    drillCounts.set(e.drill, (drillCounts.get(e.drill) ?? 0) + 1);
  }
  let mostUsedDrill: SessionStats["mostUsedDrill"] = null;
  for (const [name, count] of drillCounts) {
    if (!mostUsedDrill || count > mostUsedDrill.count) {
      mostUsedDrill = { name, count };
    }
  }

  const recentElbow = chronological.slice(-5).map((e) => e.elbow);

  return {
    sessionsLogged: log.length,
    highestBoulder,
    highestRope,
    recentGradeLabels,
    mostUsedDrill,
    recentElbow,
  };
}
