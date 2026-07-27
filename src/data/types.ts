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
}
