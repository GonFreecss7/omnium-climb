// Offline coach: turns the profile, the session log and finger tests into a
// suggestion for the next session. Pure and deterministic — every output is
// a code plus the numbers behind it, so the UI can explain *why* in either
// language and the same day always gives the same pick.

import { entryClimbs, isSent } from "./sessions";
import type { ClimbEntry } from "./sessions";
import { gradeLabel, gradeOptions } from "./grades";
import type { Discipline, GradeScale } from "./grades";
import { levelRank } from "./levels";
import type { ClimberProfile, Level } from "./levels";
import { sortTests } from "./fingerTests";
import type { FingerTest } from "./fingerTests";

export type Focus = "rest" | "easy" | "technique" | "volume" | "project";

export type Reason =
  | { code: "injured" }
  | { code: "niggle"; daysAgo: number }
  | { code: "niggleTrend"; count: number }
  | { code: "streak"; days: number }
  | { code: "loggedToday" }
  | { code: "noData"; sessions: number }
  | { code: "noDrills"; days: number | null }
  | { code: "manyAttempts"; perSend: number }
  | { code: "thinBase"; limit: string; below: string; count: number }
  | { code: "highFlash"; rate: number; next: string }
  | { code: "solidBase"; limit: string; below: string; count: number };

export type Item =
  | { kind: "drill"; id: string; daysSince: number | null }
  | { kind: "technique"; id: string }
  | { kind: "workout"; id: string; why: "noTest" | "testDue" | "trainLoads" | "optional"; daysSinceTest?: number }
  | { kind: "section"; number: number };

export type Note =
  | { code: "belowTarget"; done: number; target: number }
  | { code: "aboveTarget"; done: number; target: number }
  | { code: "noProfile" };

export interface CoachPlan {
  focus: Focus;
  reason: Reason;
  items: Item[];
  notes: Note[];
}

interface LogLike {
  id: string;
  date: string;
  drill: string;
  hardest: string;
  elbow: "better" | "same" | "worse";
  discipline?: Discipline;
  gradeIndex?: number | null;
  gradeScale?: GradeScale;
  circuit?: ClimbEntry["circuit"];
  board?: ClimbEntry["board"];
  climbs?: ClimbEntry[];
}

export interface CoachDrill {
  id: string;
  categoryId: string;
  /** The drill's name in every language — the log stores the name, not the id. */
  names: string[];
}

export interface CoachTechnique {
  id: string;
  level: Level;
  caution: boolean;
}

export interface CoachInput {
  today: string;
  profile: ClimberProfile | null;
  level: Level | null;
  log: LogLike[];
  tests: FingerTest[];
  scales: Record<Discipline, GradeScale>;
  drills: CoachDrill[];
  /** Techniques each drill trains, by drill id. */
  drillTechniques: Record<string, string[]>;
  techniques: CoachTechnique[];
}

/** Drill categories that need a partner are never the coach's pick. */
const SOLO_EXCLUDED = new Set(["partner-games"]);
const EASY_CATEGORY = "footwork-drills";

export function daysBetween(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** Stable per-day pick so the suggestion doesn't change on every render. */
function seeded<T>(items: T[], seed: string): T | undefined {
  if (items.length === 0) return undefined;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return items[h % items.length];
}

/** Position of a ladder index among the distinct labels of a scale (V4 → 4, 6C+ → its own step). */
function labelRank(index: number, scale: GradeScale): number {
  const opts = gradeOptions(scale);
  let rank = 0;
  for (let i = 0; i < opts.length; i++) if (opts[i]!.index <= index) rank = i;
  return rank;
}

function labelOfRank(rank: number, scale: GradeScale): string {
  const opts = gradeOptions(scale);
  const o = opts[Math.max(0, Math.min(opts.length - 1, rank))]!;
  return gradeLabel(o.index, scale);
}

export function coach(input: CoachInput): CoachPlan {
  const { today, profile, level, scales } = input;
  const log = [...input.log].filter((e) => e.date <= today).sort((a, b) => b.date.localeCompare(a.date));
  const notes: Note[] = [];
  if (!profile) notes.push({ code: "noProfile" });

  const within = (days: number) => log.filter((e) => daysBetween(e.date, today) < days);

  // Consistency vs. the target the climber set in onboarding.
  if (profile && profile.sessionsPerWeek > 0 && log.length > 0) {
    const done = new Set(within(14).map((e) => e.date)).size;
    const target = profile.sessionsPerWeek * 2;
    if (done > Math.ceil(target * 1.5)) notes.push({ code: "aboveTarget", done, target });
    else if (done < target - 1 && daysBetween(log[log.length - 1]!.date, today) >= 14) {
      notes.push({ code: "belowTarget", done, target });
    }
  }

  const drillItem = (category?: string): Item | null => {
    const lastUsed = new Map<string, string>();
    const byName = new Map<string, CoachDrill>();
    for (const d of input.drills) for (const n of d.names) byName.set(n, d);
    for (const e of log) {
      const d = byName.get(e.drill);
      if (d && !lastUsed.has(d.categoryId)) lastUsed.set(d.categoryId, e.date);
    }
    const categories = [...new Set(input.drills.map((d) => d.categoryId))].filter((c) => !SOLO_EXCLUDED.has(c));
    let cat = category;
    if (!cat) {
      // Least recently practised category; never-practised ones first.
      const ranked = categories
        .map((c) => ({ c, last: lastUsed.get(c) ?? "" }))
        .sort((a, b) => a.last.localeCompare(b.last));
      const oldest = ranked[0]?.last ?? "";
      cat = seeded(
        ranked.filter((r) => r.last === oldest).map((r) => r.c),
        today,
      );
    }
    if (!cat) return null;
    const pool = input.drills.filter((d) => d.categoryId === cat);
    const pick = seeded(pool, `${today}:${cat}`);
    if (!pick) return null;
    const last = lastUsed.get(cat);
    return { kind: "drill", id: pick.id, daysSince: last ? daysBetween(last, today) : null };
  };

  const techniqueItem = (drillId: string | undefined, allowCaution: boolean): Item | null => {
    if (!level) return null;
    const fits = (t: CoachTechnique) => t.level === level && (allowCaution || !t.caution);
    const related = (drillId ? (input.drillTechniques[drillId] ?? []) : [])
      .map((id) => input.techniques.find((t) => t.id === id))
      .filter((t): t is CoachTechnique => !!t && fits(t));
    const pick = seeded(related.length > 0 ? related : input.techniques.filter(fits), `${today}:tech`);
    return pick ? { kind: "technique", id: pick.id } : null;
  };

  const strengthItems = (): Item[] => {
    if (!profile || !level || profile.injured) return [];
    if (levelRank(level) >= levelRank("advanced")) {
      const latest = sortTests(input.tests)[0];
      if (!latest) return [{ kind: "workout", id: "finger-test", why: "noTest" }];
      const age = daysBetween(latest.date, today);
      if (age > 56) return [{ kind: "workout", id: "finger-test", why: "testDue", daysSinceTest: age }];
      return [{ kind: "workout", id: "max-hangs", why: "trainLoads", daysSinceTest: age }];
    }
    if (level === "intermediate" && profile.experience !== "lt1") {
      return [{ kind: "workout", id: "repeaters-10-5", why: "optional" }];
    }
    return [];
  };

  const plan = (focus: Focus, reason: Reason, items: Array<Item | null>): CoachPlan => ({
    focus,
    reason,
    items: items.filter((x): x is Item => x !== null),
    notes,
  });

  // 1. Safety first.
  if (profile?.injured) {
    const d = drillItem(EASY_CATEGORY);
    return plan("easy", { code: "injured" }, [{ kind: "section", number: 2 }, d]);
  }
  const lastThree = log.slice(0, 3);
  const worse = lastThree.filter((e) => e.elbow === "worse").length;
  if (worse >= 2) return plan("rest", { code: "niggleTrend", count: worse }, [{ kind: "section", number: 2 }]);
  const last = log[0];
  if (last && last.elbow === "worse" && daysBetween(last.date, today) <= 3) {
    const d = drillItem(EASY_CATEGORY);
    return plan("easy", { code: "niggle", daysAgo: daysBetween(last.date, today) }, [{ kind: "section", number: 2 }, d]);
  }

  // 2. Recovery.
  if (last && last.date === today) return plan("rest", { code: "loggedToday" }, []);
  const dates = new Set(log.map((e) => e.date));
  let streak = 0;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10) - i));
    if (!dates.has(d.toISOString().slice(0, 10))) break;
    streak++;
  }
  if (streak >= 3) return plan("rest", { code: "streak", days: streak }, [{ kind: "section", number: 2 }]);

  // 3. Training focus from the numbers.
  const drill = drillItem();
  const drillId = drill?.kind === "drill" ? drill.id : undefined;
  const tech = techniqueItem(drillId, true);
  const strength = strengthItems();

  const recent = within(30);
  if (recent.length < 3) {
    return plan("technique", { code: "noData", sessions: recent.length }, [drill, tech, ...strength]);
  }

  const lastDrill = log.find((e) => e.drill && input.drills.some((d) => d.names.includes(e.drill)));
  const drillGap = lastDrill ? daysBetween(lastDrill.date, today) : null;
  if (drillGap === null || drillGap > 21) {
    return plan("technique", { code: "noDrills", days: drillGap }, [drill, tech, ...strength]);
  }

  const climbs30 = recent.flatMap(entryClimbs);
  const sends30 = climbs30.filter(isSent);
  const attempts30 = climbs30.reduce((n, c) => n + c.attempts, 0);
  const perSend = sends30.length > 0 ? attempts30 / sends30.length : Infinity;
  if (sends30.length >= 3 && perSend > 4) {
    return plan("volume", { code: "manyAttempts", perSend: Math.round(perSend * 10) / 10 }, [tech, drill, ...strength]);
  }

  // Pyramid in the main discipline over 60 days, counted in the climber's own scale.
  const climbs60 = within(60).flatMap(entryClimbs);
  const byDisc = (d: Discipline) => climbs60.filter((c) => c.discipline === d).length;
  const disc: Discipline = byDisc("rope") > byDisc("boulder") ? "rope" : "boulder";
  const scale = scales[disc];
  const ranks = climbs60.filter((c) => c.discipline === disc && isSent(c)).map((c) => labelRank(c.gradeIndex, scale));
  if (ranks.length > 0) {
    const limit = Math.max(...ranks);
    const belowCount = ranks.filter((r) => r === limit - 1).length;
    const limitCount = ranks.filter((r) => r === limit).length;
    const labels = { limit: labelOfRank(limit, scale), below: labelOfRank(limit - 1, scale) };
    // A single lucky send at the top with little underneath: consolidate one grade below (§1).
    if (limit > 0 && belowCount < 3 && limitCount < 3) {
      return plan("volume", { code: "thinBase", ...labels, count: belowCount }, [tech, drill, ...strength]);
    }
    const flashes = sends30.filter((c) => c.result === "flash").length;
    const rate = sends30.length > 0 ? flashes / sends30.length : 0;
    if (rate >= 0.5) {
      return plan("project", { code: "highFlash", rate: Math.round(rate * 100), next: labelOfRank(limit + 1, scale) }, [tech, ...strength, drill]);
    }
    return plan("project", { code: "solidBase", ...labels, count: belowCount }, [tech, ...strength, drill]);
  }

  return plan("technique", { code: "noData", sessions: recent.length }, [drill, tech, ...strength]);
}
