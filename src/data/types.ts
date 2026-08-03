// Mirrors the shape scripts/parse-guide.ts writes to src/data/guide.<lang>.json.
// src/data/ is generated — never hand-edit the JSON, only this type layer.

export type Tag = "core" | "later" | "advanced" | "caution";

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
  tag: Tag;
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
  refType: "book" | "video" | "article" | "channel" | "paper";
  author: string;
  url?: string;
  note: string;
}

export interface SectionIndexEntry {
  number: number;
  kind: "prose" | "techniqueCategory" | "drillCategory";
  title: string;
  fileId?: string;
  categoryId?: string;
}

export interface ProgressionStage {
  id: string;
  order: number;
  title: string;
  summary: string;
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
  tagLegend: Record<Tag, string>;
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
}
