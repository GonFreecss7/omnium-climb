import type { ElbowChange, SessionLogEntry } from "../state/AppState";
import type { Lang, UiStrings } from "../i18n/ui";

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

/** Extracts the numeric grade from free text like "V3" or "v3-v4". Returns null if none found. */
export function parseGrade(text: string): number | null {
  const match = text.match(/v\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

export function formatGrade(n: number): string {
  return `V${n}`;
}

export interface SessionStats {
  sessionsLogged: number;
  highestGrade: number | null;
  recentGradeLabels: string[];
  mostUsedDrill: { name: string; count: number } | null;
  recentElbow: ElbowChange[];
}

/** `log` is newest-first, as stored. All "recent" sequences are returned oldest-to-newest. */
export function computeSessionStats(log: SessionLogEntry[]): SessionStats {
  const chronological = [...log].reverse();

  const grades = chronological.map((e) => parseGrade(e.hardest)).filter((g): g is number => g !== null);
  const highestGrade = grades.length > 0 ? Math.max(...grades) : null;

  const recentGradeLabels = chronological.slice(-5).map((e) => {
    const g = parseGrade(e.hardest);
    return g !== null ? formatGrade(g) : e.hardest;
  });

  const drillCounts = new Map<string, number>();
  for (const e of log) {
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
    highestGrade,
    recentGradeLabels,
    mostUsedDrill,
    recentElbow,
  };
}
