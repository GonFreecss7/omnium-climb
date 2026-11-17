// Progress analytics over the session log. Everything is derived from the
// per-climb data (legacy entries count as one sent climb).

import { entryClimbs, isSent } from "./sessions";
import type { ClimbEntry } from "./sessions";
import type { Discipline } from "./grades";

export type Range = "30" | "90" | "all";

interface LogLike {
  id: string;
  date: string;
  hardest: string;
  discipline?: Discipline;
  gradeIndex?: number | null;
  gradeScale?: ClimbEntry["gradeScale"];
  circuit?: ClimbEntry["circuit"];
  board?: ClimbEntry["board"];
  climbs?: ClimbEntry[];
  gym?: { name: string };
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function inRange<T extends { date: string }>(log: T[], range: Range): T[] {
  if (range === "all") return log;
  const from = daysAgoISO(Number(range));
  return log.filter((e) => e.date >= from);
}

export interface Analytics {
  sessions: number;
  climbs: number;
  sends: number;
  flashes: number;
  flashRate: number | null;
  attemptsPerSend: number | null;
  best: Record<Discipline, number | null>;
  /** Sends per ladder index, per discipline. */
  pyramid: Record<Discipline, Map<number, { sends: number; flashes: number }>>;
  /** Best sent index per session, oldest first, for the discipline with most data. */
  timeline: Array<{ date: string; index: number; discipline: Discipline }>;
  /** Climbs per ISO week (Mon start), last 8 weeks, oldest first. */
  weeks: Array<{ start: string; climbs: number; sends: number }>;
  wallClimbs: number;
  boardClimbs: number;
  boards: Array<{ name: string; count: number }>;
  gyms: Array<{ name: string; count: number }>;
}

function mondayOf(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y!, m! - 1, d!);
  const dow = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - dow);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function topCounts(values: string[], n: number): Array<{ name: string; count: number }> {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export function computeAnalytics(fullLog: LogLike[], range: Range): Analytics {
  const log = inRange(fullLog, range);
  const chronological = [...log].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const pyramid: Analytics["pyramid"] = { boulder: new Map(), rope: new Map() };
  const best: Analytics["best"] = { boulder: null, rope: null };
  const timelineByDisc: Record<Discipline, Analytics["timeline"]> = { boulder: [], rope: [] };
  let climbs = 0;
  let sends = 0;
  let flashes = 0;
  let attemptsOnSends = 0;
  let wallClimbs = 0;
  let boardClimbs = 0;
  const boardNames: string[] = [];
  const gymNames: string[] = [];

  for (const e of chronological) {
    const cs = entryClimbs(e);
    if (e.gym?.name) gymNames.push(e.gym.name);
    const sessionBest: Record<Discipline, number | null> = { boulder: null, rope: null };
    for (const c of cs) {
      climbs++;
      if (c.board) {
        boardClimbs++;
        boardNames.push(`${c.board.name} · ${c.board.angle}°`);
      } else wallClimbs++;
      if (!isSent(c)) continue;
      sends++;
      attemptsOnSends += c.attempts;
      if (c.result === "flash") flashes++;
      const p = pyramid[c.discipline].get(c.gradeIndex) ?? { sends: 0, flashes: 0 };
      p.sends++;
      if (c.result === "flash") p.flashes++;
      pyramid[c.discipline].set(c.gradeIndex, p);
      best[c.discipline] = Math.max(best[c.discipline] ?? -1, c.gradeIndex);
      sessionBest[c.discipline] = Math.max(sessionBest[c.discipline] ?? -1, c.gradeIndex);
    }
    for (const d of ["boulder", "rope"] as Discipline[]) {
      const v = sessionBest[d];
      if (v !== null) timelineByDisc[d].push({ date: e.date, index: v, discipline: d });
    }
  }

  const timeline = timelineByDisc.boulder.length >= timelineByDisc.rope.length ? timelineByDisc.boulder : timelineByDisc.rope;

  const weeks: Analytics["weeks"] = [];
  const thisMonday = mondayOf(daysAgoISO(0));
  for (let i = 7; i >= 0; i--) {
    const [y, m, d] = thisMonday.split("-").map(Number);
    const dt = new Date(y!, m! - 1, d! - i * 7);
    const start = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    weeks.push({ start, climbs: 0, sends: 0 });
  }
  for (const e of fullLog) {
    const w = weeks.find((x) => x.start === mondayOf(e.date));
    if (!w) continue;
    const cs = entryClimbs(e);
    w.climbs += cs.length;
    w.sends += cs.filter(isSent).length;
  }

  return {
    sessions: log.length,
    climbs,
    sends,
    flashes,
    flashRate: sends > 0 ? flashes / sends : null,
    attemptsPerSend: sends > 0 ? attemptsOnSends / sends : null,
    best,
    pyramid,
    timeline: timeline.slice(-24),
    weeks,
    wallClimbs,
    boardClimbs,
    boards: topCounts(boardNames, 4),
    gyms: topCounts(gymNames, 4),
  };
}
