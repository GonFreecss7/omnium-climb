// Grade scales used in indoor gyms, and conversion between them.
//
// Each discipline has one canonical ladder. A grade is stored as its index on
// that ladder, so any scale can be shown or parsed through the same row.
// Equivalences are indicative only — gyms and regions vary by a grade or more.
//
// Source: Wikipedia, "Grade (bouldering)" and "Grade (climbing)" comparison
// tables (themselves drawn from RockFax 2021, theCrag 2023, CAI/UIAA 2016).
// Where the source leaves a cell blank, the nearest listed neighbour is used.

export type Discipline = "boulder" | "rope";
export type BoulderScale = "V" | "Font";
export type RopeScale = "YDS" | "French" | "UIAA" | "Ewbank";
export type GradeScale = BoulderScale | RopeScale;

export const BOULDER_SCALES: BoulderScale[] = ["V", "Font"];
export const ROPE_SCALES: RopeScale[] = ["YDS", "French", "UIAA", "Ewbank"];

export const SCALE_LABELS: Record<GradeScale, string> = {
  V: "V",
  Font: "Font",
  YDS: "YDS (5.x)",
  French: "Francesa / French",
  UIAA: "UIAA",
  Ewbank: "Ewbank",
};

interface BoulderRow {
  V: string;
  Font: string;
  /** Numeric V value used for level bands (VB = -1, V0- / V0 / V0+ = 0). */
  vNum: number;
}

export const BOULDER_LADDER: BoulderRow[] = [
  { V: "VB", Font: "3", vNum: -1 },
  { V: "V0-", Font: "4-", vNum: 0 },
  { V: "V0", Font: "4", vNum: 0 },
  { V: "V0+", Font: "4+", vNum: 0 },
  { V: "V1", Font: "5", vNum: 1 },
  { V: "V2", Font: "5+", vNum: 2 },
  { V: "V3", Font: "6A", vNum: 3 },
  { V: "V3", Font: "6A+", vNum: 3 },
  { V: "V4", Font: "6B", vNum: 4 },
  { V: "V4", Font: "6B+", vNum: 4 },
  { V: "V5", Font: "6C", vNum: 5 },
  { V: "V5", Font: "6C+", vNum: 5 },
  { V: "V6", Font: "7A", vNum: 6 },
  { V: "V7", Font: "7A+", vNum: 7 },
  { V: "V8", Font: "7B", vNum: 8 },
  { V: "V8", Font: "7B+", vNum: 8 },
  { V: "V9", Font: "7C", vNum: 9 },
  { V: "V10", Font: "7C+", vNum: 10 },
  { V: "V11", Font: "8A", vNum: 11 },
  { V: "V12", Font: "8A+", vNum: 12 },
  { V: "V13", Font: "8B", vNum: 13 },
  { V: "V14", Font: "8B+", vNum: 14 },
  { V: "V15", Font: "8C", vNum: 15 },
  { V: "V16", Font: "8C+", vNum: 16 },
  { V: "V17", Font: "9A", vNum: 17 },
  { V: "V18", Font: "9A+", vNum: 18 },
];

interface RopeRow {
  YDS: string;
  French: string;
  UIAA: string;
  Ewbank: string;
}

export const ROPE_LADDER: RopeRow[] = [
  { YDS: "5.4", French: "4a", UIAA: "IV", Ewbank: "10" },
  { YDS: "5.5", French: "4b", UIAA: "IV+", Ewbank: "11" },
  { YDS: "5.6", French: "4c", UIAA: "V", Ewbank: "13" },
  { YDS: "5.7", French: "5a", UIAA: "V+", Ewbank: "14" },
  { YDS: "5.8", French: "5b", UIAA: "VI-", Ewbank: "16" },
  { YDS: "5.9", French: "5c", UIAA: "VI", Ewbank: "17" },
  { YDS: "5.10a", French: "6a", UIAA: "VI+", Ewbank: "18" },
  { YDS: "5.10b", French: "6a+", UIAA: "VII-", Ewbank: "19" },
  { YDS: "5.10c", French: "6b", UIAA: "VII", Ewbank: "20" },
  { YDS: "5.10d", French: "6b+", UIAA: "VII+", Ewbank: "20" },
  { YDS: "5.11a", French: "6c", UIAA: "VII+", Ewbank: "21" },
  { YDS: "5.11b", French: "6c", UIAA: "VIII-", Ewbank: "22" },
  { YDS: "5.11c", French: "6c+", UIAA: "VIII-", Ewbank: "23" },
  { YDS: "5.11d", French: "7a", UIAA: "VIII", Ewbank: "23" },
  { YDS: "5.12a", French: "7a+", UIAA: "VIII+", Ewbank: "24" },
  { YDS: "5.12b", French: "7b", UIAA: "VIII+", Ewbank: "25" },
  { YDS: "5.12c", French: "7b+", UIAA: "IX-", Ewbank: "26" },
  { YDS: "5.12d", French: "7c", UIAA: "IX", Ewbank: "27" },
  { YDS: "5.13a", French: "7c+", UIAA: "IX+", Ewbank: "28" },
  { YDS: "5.13b", French: "8a", UIAA: "X-", Ewbank: "29" },
  { YDS: "5.13c", French: "8a+", UIAA: "X-", Ewbank: "30" },
  { YDS: "5.13d", French: "8b", UIAA: "X", Ewbank: "31" },
  { YDS: "5.14a", French: "8b+", UIAA: "X+", Ewbank: "32" },
  { YDS: "5.14b", French: "8c", UIAA: "XI-", Ewbank: "33" },
  { YDS: "5.14c", French: "8c+", UIAA: "XI", Ewbank: "34" },
  { YDS: "5.14d", French: "9a", UIAA: "XI+", Ewbank: "35" },
  { YDS: "5.15a", French: "9a+", UIAA: "XII-", Ewbank: "36" },
  { YDS: "5.15b", French: "9b", UIAA: "XII-", Ewbank: "37" },
  { YDS: "5.15c", French: "9b+", UIAA: "XII", Ewbank: "38" },
  { YDS: "5.15d", French: "9c", UIAA: "XII+", Ewbank: "39" },
];

export function disciplineOf(scale: GradeScale): Discipline {
  return (BOULDER_SCALES as string[]).includes(scale) ? "boulder" : "rope";
}

export function ladderLength(discipline: Discipline): number {
  return discipline === "boulder" ? BOULDER_LADDER.length : ROPE_LADDER.length;
}

/** Display label for a ladder index in the given scale. */
export function gradeLabel(index: number, scale: GradeScale): string {
  if (disciplineOf(scale) === "boulder") {
    const row = BOULDER_LADDER[clamp(index, BOULDER_LADDER.length)];
    return row ? row[scale as BoulderScale] : "?";
  }
  const row = ROPE_LADDER[clamp(index, ROPE_LADDER.length)];
  return row ? row[scale as RopeScale] : "?";
}

/**
 * Options for a grade picker in one scale. Rows that repeat the previous row's
 * label (e.g. V3 = 6A and 6A+) are merged: the first index is used.
 */
export function gradeOptions(scale: GradeScale): Array<{ index: number; label: string }> {
  const n = ladderLength(disciplineOf(scale));
  const out: Array<{ index: number; label: string }> = [];
  for (let i = 0; i < n; i++) {
    const label = gradeLabel(i, scale);
    if (out.length > 0 && out[out.length - 1]!.label === label) continue;
    out.push({ index: i, label });
  }
  return out;
}

function normalize(s: string): string {
  return s.replace(/[−–—]/g, "-").replace(/\s+/g, "").toLowerCase();
}

/** Parses a grade written in `scale`. Returns the ladder index or null. */
export function parseGrade(text: string, scale: GradeScale): number | null {
  const needle = normalize(text);
  if (!needle) return null;
  const n = ladderLength(disciplineOf(scale));
  for (let i = 0; i < n; i++) {
    if (normalize(gradeLabel(i, scale)) === needle) return i;
  }
  // Common shorthand: "v3" written as "3" in V scale.
  if (scale === "V" && /^\d+$/.test(needle)) return parseGrade(`V${needle}`, "V");
  return null;
}

/** Tries every scale of a discipline — for legacy free-text entries. */
export function parseGradeAnyScale(text: string, discipline: Discipline): number | null {
  const scales: GradeScale[] = discipline === "boulder" ? BOULDER_SCALES : ROPE_SCALES;
  for (const scale of scales) {
    const hit = parseGrade(text, scale);
    if (hit !== null) return hit;
  }
  // Legacy entries like "V3-V4" or "v3 flash": take the first V number.
  if (discipline === "boulder") {
    const m = text.match(/v\s*(\d+)/i);
    if (m) return parseGrade(`V${m[1]}`, "V");
  }
  return null;
}

/** "V5 · 6C" style secondary label in the other scales of the discipline. */
export function equivalents(index: number, scale: GradeScale): string {
  const scales: GradeScale[] = disciplineOf(scale) === "boulder" ? BOULDER_SCALES : ROPE_SCALES;
  return scales
    .filter((s) => s !== scale)
    .map((s) => gradeLabel(index, s))
    .join(" · ");
}

function clamp(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, Math.round(i)));
}

/**
 * First and last ladder index that share this index's label in `scale`
 * (V3 covers both 6A and 6A+). Range ends picked in a coarse scale should
 * cover the whole label, not just its first row.
 */
export function labelSpan(index: number, scale: GradeScale): [number, number] {
  const label = gradeLabel(index, scale);
  const n = ladderLength(disciplineOf(scale));
  let lo = index;
  let hi = index;
  while (lo > 0 && gradeLabel(lo - 1, scale) === label) lo--;
  while (hi < n - 1 && gradeLabel(hi + 1, scale) === label) hi++;
  return [lo, hi];
}
