// Mirrors the shape scripts/parse-guide.ts writes to src/data/guide.<lang>.json.
// src/data/ is generated — never hand-edit the JSON, only this type layer.

import type { Level } from "../domain/levels";

export type { Level };

export interface ProseSection {
  number: number;
  title: string;
  body: string;
}

export interface ProseFile {
  id: string;
  title: string;
  part: string;
  order: number;
  sections: ProseSection[];
}

export interface TechniqueCategory {
  id: string;
  number: number;
  title: string;
  intro: string;
  techniqueIds: string[];
}

export interface Technique {
  id: string;
  categoryId: string;
  categoryNumber: number;
  name: string;
  level: Level;
  /** Meaningful injury risk — shown as a warning on top of the level. */
  caution: boolean;
  nonstandard: boolean;
  gloss: string | null;
  what: string;
  how: string;
  best: string;
  /** Drill ids that train this technique, derived at build time from shared category. */
  relatedDrills: string[];
}

export interface DrillSection {
  number: number;
  title: string;
  intro: string;
}

export interface DrillCategory {
  id: string;
  number: number;
  title: string;
  drillIds: string[];
  callouts: string[];
}

export interface Drill {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  /** Technique ids this drill trains, derived at build time from shared category. */
  relatedTechniques: string[];
}

export interface ReferenceEntry {
  id: string;
  title: string;
  refType: "book" | "video" | "article" | "channel" | "paper";
  author: string;
  url?: string;
  note: string;
}

export interface WorkoutTimer {
  prep: number;
  hang: number;
  rest: number;
  reps: number;
  sets: number;
  setRest: number;
}

export interface Workout {
  id: string;
  name: string;
  level: Level;
  caution: boolean;
  test: boolean;
  timer: WorkoutTimer;
  what: string;
  how: string;
  load: string;
  sources: string[];
}

export interface WorkoutSection {
  number: number;
  title: string;
  intro: string;
}

export interface SectionIndexEntry {
  number: number;
  kind: "prose" | "techniqueCategory" | "drillCategory" | "workouts" | "references";
  title: string;
  fileId?: string;
  categoryId?: string;
}

export interface ProgressionStage {
  id: string;
  order: number;
  title: string;
  summary: string;
  /** Highest level among the stage's techniques — derived at build time. */
  level: Level;
  techniqueIds: string[];
  drillIds: string[];
}

export interface Guide {
  meta: {
    title: string;
    subtitle: string;
    version: string;
    parts: Record<string, string>;
  };
  levelLegend: Record<Level, string>;
  cautionNote: string;
  nonstandardNote: string;
  sectionIndex: Record<string, SectionIndexEntry>;
  prose: ProseFile[];
  techniqueCategories: TechniqueCategory[];
  techniques: Technique[];
  drillSection: DrillSection | null;
  drillCategories: DrillCategory[];
  drills: Drill[];
  references: ReferenceEntry[];
  progressionStages: ProgressionStage[];
  workoutSection: WorkoutSection | null;
  workouts: Workout[];
  referencesSection: { number: number; title: string } | null;
}
