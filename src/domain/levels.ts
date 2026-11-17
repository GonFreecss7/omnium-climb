// Climber level bands and the profile they are derived from.
//
// Bands are a convention of this app, documented in CLAUDE.md. They are
// derived from the hardest grade the climber reports, then capped by
// experience: connective tissue adapts over months to years, so anyone
// in their first year is held at most at "intermediate" regardless of grade.

import { BOULDER_LADDER, parseGradeAnyScale } from "./grades";
import type { BoulderScale, Discipline, RopeScale } from "./grades";

export type Level = "beginner" | "intermediate" | "advanced" | "elite";
export const LEVELS: Level[] = ["beginner", "intermediate", "advanced", "elite"];

export type Experience = "lt1" | "1to2" | "3to5" | "gt5";
export const EXPERIENCES: Experience[] = ["lt1", "1to2", "3to5", "gt5"];

export interface ClimberProfile {
  version: 1;
  disciplines: Discipline[];
  boulderScale: BoulderScale;
  ropeScale: RopeScale;
  /** Ladder index of the hardest boulder the climber sends reliably, or null if unknown. */
  boulderMax: number | null;
  /** Ladder index of the hardest rope route the climber sends reliably, or null if unknown. */
  ropeMax: number | null;
  experience: Experience;
  sessionsPerWeek: number;
  weightKg: number | null;
  heightCm: number | null;
  /** Climber reports current pain or an injury being managed. */
  injured: boolean;
  /** Manual override of the computed band. */
  levelOverride: Level | null;
  createdAt: string;
  updatedAt: string;
}

export function levelRank(level: Level): number {
  return LEVELS.indexOf(level);
}

export function levelFromBoulder(index: number): Level {
  const v = BOULDER_LADDER[Math.max(0, Math.min(BOULDER_LADDER.length - 1, index))]!.vNum;
  if (v <= 2) return "beginner";
  if (v <= 5) return "intermediate";
  if (v <= 8) return "advanced";
  return "elite";
}

// Ladder indices into ROPE_LADDER: 6 = 5.10a/6a, 13 = 5.11d/7a, 18 = 5.13a/7c+.
export function levelFromRope(index: number): Level {
  if (index <= 6) return "beginner";
  if (index <= 13) return "intermediate";
  if (index <= 18) return "advanced";
  return "elite";
}

export type LevelSource = "override" | "grade" | "experience";

export interface LevelResult {
  level: Level;
  source: LevelSource;
  /** True when the grade suggested a higher band but first-year experience capped it. */
  capped: boolean;
}

export function computeLevel(p: ClimberProfile): LevelResult {
  if (p.levelOverride) return { level: p.levelOverride, source: "override", capped: false };

  const fromGrades: Level[] = [];
  if (p.disciplines.includes("boulder") && p.boulderMax !== null) fromGrades.push(levelFromBoulder(p.boulderMax));
  if (p.disciplines.includes("rope") && p.ropeMax !== null) fromGrades.push(levelFromRope(p.ropeMax));

  let level: Level;
  let source: LevelSource;
  if (fromGrades.length > 0) {
    level = fromGrades.reduce((a, b) => (levelRank(b) > levelRank(a) ? b : a));
    source = "grade";
  } else {
    level = p.experience === "lt1" || p.experience === "1to2" ? "beginner" : "intermediate";
    source = "experience";
  }

  if (p.experience === "lt1" && levelRank(level) > levelRank("intermediate")) {
    return { level: "intermediate", source, capped: true };
  }
  return { level, source, capped: false };
}

export type Relevance = "mastered" | "current" | "next" | "later";

/** Where a piece of content sits relative to the climber's band. */
export function relevance(contentLevel: Level, userLevel: Level): Relevance {
  const d = levelRank(contentLevel) - levelRank(userLevel);
  if (d < 0) return "mastered";
  if (d === 0) return "current";
  if (d === 1) return "next";
  return "later";
}

/** Inclusive band range used by conditional prose blocks: "beginner", "intermediate+", "beginner-intermediate". */
export interface LevelRange {
  min: Level;
  max: Level;
}

export function parseLevelRange(spec: string): LevelRange | null {
  const s = spec.trim();
  const plus = s.match(/^([a-z]+)\+$/);
  if (plus && LEVELS.includes(plus[1] as Level)) return { min: plus[1] as Level, max: "elite" };
  const range = s.match(/^([a-z]+)-([a-z]+)$/);
  if (range && LEVELS.includes(range[1] as Level) && LEVELS.includes(range[2] as Level)) {
    const min = range[1] as Level;
    const max = range[2] as Level;
    return levelRank(min) <= levelRank(max) ? { min, max } : null;
  }
  if (LEVELS.includes(s as Level)) return { min: s as Level, max: s as Level };
  return null;
}

export function inRange(level: Level, range: LevelRange): boolean {
  const r = levelRank(level);
  return r >= levelRank(range.min) && r <= levelRank(range.max);
}

export interface LevelUpSuggestion {
  discipline: Discipline;
  loggedBest: number;
  profileMax: number | null;
}

interface LoggedGrade {
  discipline?: Discipline;
  gradeIndex?: number | null;
  hardest: string;
}

/**
 * If the session log shows a harder grade than the profile records, suggest
 * updating the profile. Only the most recent `window` entries count, so one
 * lucky send months ago doesn't drive it.
 */
export function suggestLevelUp(p: ClimberProfile, log: LoggedGrade[], window = 10): LevelUpSuggestion | null {
  for (const discipline of p.disciplines) {
    let best: number | null = null;
    for (const e of log.slice(0, window)) {
      const d = e.discipline ?? "boulder";
      if (d !== discipline) continue;
      const idx = e.gradeIndex ?? parseGradeAnyScale(e.hardest, d);
      if (idx !== null && (best === null || idx > best)) best = idx;
    }
    const profileMax = discipline === "boulder" ? p.boulderMax : p.ropeMax;
    if (best !== null && (profileMax === null || best > profileMax)) {
      return { discipline, loggedBest: best, profileMax };
    }
  }
  return null;
}
