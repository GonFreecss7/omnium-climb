// content/*.md -> src/data/guide.<lang>.json
// Run via `npm run parse`. See CLAUDE.md for the content contract this enforces.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const MANIFEST_PATH = path.resolve(ROOT, "content/manifest.json");
const ES_DICT_PATH = path.resolve(ROOT, "content/i18n/es.json");
const OUT_PATH_EN = path.resolve(ROOT, "src/data/guide.en.json");
const OUT_PATH_ES = path.resolve(ROOT, "src/data/guide.es.json");

const VALID_TAGS = ["core", "later", "advanced", "caution"] as const;
type Tag = (typeof VALID_TAGS)[number];

const VALID_REF_TYPES = ["book", "video", "article", "channel", "paper"] as const;

type FileType = "prose" | "techniques" | "drills" | "references" | "progressions";

interface ManifestFile {
  path: string;
  id: string;
  title: string;
  part: string;
  type: FileType;
  sections: string;
  order: number;
  status: "complete" | "stub";
}

interface Manifest {
  title: string;
  subtitle: string;
  version: string;
  source_language: string;
  target_languages: string[];
  parts: Record<string, string>;
  files: ManifestFile[];
}

interface ProseSection {
  number: number;
  title: string;
  body: string;
}

interface ProseFile {
  id: string;
  title: string;
  part: string;
  order: number;
  sections: ProseSection[];
}

interface TechniqueCategory {
  id: string;
  number: number;
  title: string;
  intro: string;
  techniqueIds: string[];
}

interface Technique {
  id: string;
  categoryId: string;
  categoryNumber: number;
  name: string;
  tag: Tag;
  nonstandard: boolean;
  /** Secondary Spanish gloss shown under the (always-English) name. Always null in EN. */
  gloss: string | null;
  what: string;
  how: string;
  best: string;
  /** Drill ids that train this technique — derived post-parse from shared category, see computeRelations(). */
  relatedDrills: string[];
}

interface DrillSection {
  number: number;
  title: string;
  intro: string;
}

interface DrillCategory {
  id: string;
  number: number;
  title: string;
  drillIds: string[];
  callouts: string[];
}

interface Drill {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  /** Technique ids this drill trains — derived post-parse from shared category, see computeRelations(). */
  relatedTechniques: string[];
}

interface ReferenceEntry {
  id: string;
  refType: (typeof VALID_REF_TYPES)[number];
  author: string;
  url?: string;
  note: string;
}

interface SectionIndexEntry {
  number: number;
  kind: "prose" | "techniqueCategory" | "drillCategory";
  title: string;
  fileId?: string;
  categoryId?: string;
}

interface ProgressionStage {
  id: string;
  order: number;
  title: string;
  summary: string;
  techniqueIds: string[];
  drillIds: string[];
}

interface Guide {
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

class ParseError extends Error {}

function fail(context: string, message: string): never {
  throw new ParseError(`${context}: ${message}`);
}

const HORIZONTAL_RULE = /^(-{3,}|\*{3,}|_{3,})\s*$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function registerId(idRegistry: Map<string, string>, id: string, context: string): void {
  const existing = idRegistry.get(id);
  if (existing) {
    fail(context, `duplicate id \`${id}\` — already used by ${existing}`);
  }
  idRegistry.set(id, context);
}

function stripFrontmatter(raw: string, context: string): string {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n[\s\S]*?\n---\n?/);
  if (!match) {
    fail(context, "missing YAML frontmatter block");
  }
  return normalized.slice(match[0].length).replace(/\n?$/, "\n");
}

function parseSectionRange(range: string): [number, number] {
  const m = range.match(/^(\d+)(?:-(\d+))?$/);
  if (!m) return [-1, -1];
  const lo = Number(m[1]);
  const hi = m[2] ? Number(m[2]) : lo;
  return [lo, hi];
}

function checkSectionRange(context: string, manifestRange: string, foundNumbers: number[]): void {
  if (foundNumbers.length === 0) {
    fail(context, "no numbered sections found");
  }
  const [lo, hi] = parseSectionRange(manifestRange);
  const min = Math.min(...foundNumbers);
  const max = Math.max(...foundNumbers);
  if (min !== lo || max !== hi) {
    fail(
      context,
      `manifest declares sections "${manifestRange}" but parsed sections span ${min}-${max}`,
    );
  }
}

// ---------- prose ----------
//
// Every line either opens a new numbered section or belongs to the section
// currently open; content before the first heading (the "preamble") is rejected
// outright. That means 100% of the file's bytes are always accounted for —
// there is no branch here that can silently drop a block.

function parseProse(raw: string, file: ManifestFile): ProseFile {
  const context = file.path;
  const body = stripFrontmatter(raw, context);
  const lines = body.split("\n");

  const sections: ProseSection[] = [];
  let current: { number: number; title: string; lines: string[] } | null = null;
  const preamble: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^### (\d+)\.\s+(.+?)\s*$/);
    if (heading) {
      if (current) {
        sections.push({ number: current.number, title: current.title, body: current.lines.join("\n").trim() });
      }
      current = { number: Number(heading[1]!), title: heading[2]!, lines: [] };
      continue;
    }
    if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) {
    sections.push({ number: current.number, title: current.title, body: current.lines.join("\n").trim() });
  }

  if (preamble.join("\n").trim().length > 0) {
    fail(context, "content found before the first numbered section heading");
  }

  checkSectionRange(context, file.sections, sections.map((s) => s.number));

  return { id: file.id, title: file.title, part: file.part, order: file.order, sections };
}

// ---------- techniques ----------

/**
 * Parses the free text that precedes the first `### N.` category heading in the
 * techniques file: the tag legend and the sentence explaining `nonstandard: true`.
 * Both are surfaced in the app (filter chip meaning, and the asterisk explanation
 * on nonstandard technique names), so they must come from content, not be hardcoded.
 */
function parseTechniquesIntro(
  lines: string[],
  context: string,
): { tagLegend: Record<Tag, string>; nonstandardNote: string } {
  const legendFound: Partial<Record<Tag, string>> = {};
  let nonstandardNote = "";

  for (const line of lines) {
    const bullet = line.match(/^- `(core|later|advanced|caution)`\s*[—–-]\s*(.+?)\s*$/);
    if (bullet) {
      legendFound[bullet[1] as Tag] = bullet[2];
      continue;
    }
    const nonstandardLine = line.match(/^`nonstandard: true`\s+(.+?)\s*$/);
    if (nonstandardLine) {
      nonstandardNote = nonstandardLine[1]!;
      continue;
    }
    if (line.trim() === "" || line.trim() === "Tags indicate roughly when a technique is worth learning:") {
      continue;
    }
    fail(context, `unclaimed content in the file intro: "${line.trim()}"`);
  }

  const tagLegend = {} as Record<Tag, string>;
  for (const tag of VALID_TAGS) {
    const text = legendFound[tag];
    if (!text) {
      fail(context, `file intro is missing the legend line for tag \`${tag}\` (expected "- \`${tag}\` — ...")`);
    }
    tagLegend[tag] = text;
  }
  if (!nonstandardNote) {
    fail(context, "file intro is missing the `nonstandard: true` explanation sentence");
  }

  return { tagLegend, nonstandardNote };
}

function parseTechniques(
  raw: string,
  file: ManifestFile,
  idRegistry: Map<string, string>,
): {
  categories: TechniqueCategory[];
  techniques: Technique[];
  tagLegend: Record<Tag, string>;
  nonstandardNote: string;
} {
  const context = file.path;
  const body = stripFrontmatter(raw, context);
  const lines = body.split("\n");

  const categories: TechniqueCategory[] = [];
  const techniques: Technique[] = [];
  const fileIntroLines: string[] = [];

  let category: TechniqueCategory | null = null;
  let categoryIntroLines: string[] = [];
  let sawEntryInCategory = false;
  let entry: (Partial<Technique> & { name?: string }) | null = null;
  let entryContext = "";
  let currentField: "what" | "how" | "best" | null = null;

  const finishEntry = () => {
    if (!entry) return;
    if (!category) fail(context, "internal: entry without category");

    if (!entry.id || String(entry.id).trim() === "") {
      fail(
        entryContext,
        `technique "${entry.name}" has no declared \`id\` field — ids must be explicit ` +
          `(\`- id: \`some-id\`\`) and are never derived from the display name`,
      );
    }

    const required: Array<keyof Technique> = ["tag", "what", "how", "best"];
    for (const key of required) {
      if (!entry[key] || String(entry[key]).trim() === "") {
        fail(entryContext, `missing required field \`${key}\``);
      }
    }
    const tag = entry.tag as string;
    if (!VALID_TAGS.includes(tag as Tag)) {
      fail(entryContext, `unknown tag \`${tag}\` — must be one of ${VALID_TAGS.join(" | ")}`);
    }
    const id = entry.id as string;
    registerId(idRegistry, id, entryContext);
    const technique: Technique = {
      id,
      categoryId: category!.id,
      categoryNumber: category!.number,
      name: entry.name!,
      tag: tag as Tag,
      nonstandard: entry.nonstandard === true,
      gloss: null,
      what: entry.what!.trim(),
      how: entry.how!.trim(),
      best: entry.best!.trim(),
      relatedDrills: [],
    };
    techniques.push(technique);
    category!.techniqueIds.push(id);
    entry = null;
    currentField = null;
  };

  const finishCategory = () => {
    finishEntry();
    if (category) {
      category.intro = categoryIntroLines.join("\n").trim();
      categories.push(category);
    }
    categoryIntroLines = [];
  };

  for (const line of lines) {
    const categoryHeading = line.match(/^### (\d+)\.\s+(.+?)\s*$/);
    if (categoryHeading) {
      finishCategory();
      const number = Number(categoryHeading[1]!);
      const title = categoryHeading[2]!;
      category = { id: slugify(title), number, title, intro: "", techniqueIds: [] };
      sawEntryInCategory = false;
      continue;
    }

    const entryHeading = line.match(/^#### (.+?)\s*$/);
    if (entryHeading) {
      if (!category) fail(context, `technique "${entryHeading[1]}" appears before any category heading`);
      finishEntry();
      entry = { name: entryHeading[1] };
      entryContext = `${context} #### ${entryHeading[1]}`;
      currentField = null;
      sawEntryInCategory = true;
      continue;
    }

    const fieldLine = line.match(/^- ([a-zA-Z]+):\s*(.*)$/);
    if (fieldLine) {
      if (!entry) fail(context, `field \`${fieldLine[1]}\` appears outside any technique entry`);
      const key = fieldLine[1]!.toLowerCase();
      let value = fieldLine[2]!.trim();
      if (key === "id" || key === "tag") {
        value = value.replace(/`/g, "").trim();
        (entry as Record<string, unknown>)[key] = value;
        currentField = null;
      } else if (key === "nonstandard") {
        if (value !== "true" && value !== "false") {
          fail(entryContext, `field \`nonstandard\` must be true or false, got \`${value}\``);
        }
        entry.nonstandard = value === "true";
        currentField = null;
      } else if (key === "what" || key === "how" || key === "best") {
        entry[key] = value;
        currentField = key;
      } else {
        fail(entryContext, `unknown field \`${key}\``);
      }
      continue;
    }

    if (HORIZONTAL_RULE.test(line.trim())) {
      continue;
    }

    if (line.trim() === "") {
      currentField = null;
      continue;
    }

    // continuation of a wrapped what/how/best line
    if (entry && currentField) {
      entry[currentField] = `${entry[currentField]} ${line.trim()}`;
      continue;
    }

    // category-level intro paragraph, only valid before that category's first entry
    if (category && !entry && !sawEntryInCategory) {
      categoryIntroLines.push(line);
      continue;
    }

    // file-level intro (tag legend + nonstandard note), only valid before any category
    if (!category) {
      fileIntroLines.push(line);
      continue;
    }

    fail(
      entry ? entryContext : `${context} #### ${category.title}`,
      `unclaimed markdown content not recognised by any parser branch: "${line.trim()}"`,
    );
  }
  finishCategory();

  checkSectionRange(context, file.sections, categories.map((c) => c.number));

  const { tagLegend, nonstandardNote } = parseTechniquesIntro(fileIntroLines, context);

  return { categories, techniques, tagLegend, nonstandardNote };
}

// ---------- drills ----------

function parseDrills(
  raw: string,
  file: ManifestFile,
  idRegistry: Map<string, string>,
): {
  categories: DrillCategory[];
  drills: Drill[];
  sectionNumber: number;
  sectionTitle: string;
  sectionIntro: string;
} {
  const context = file.path;
  const body = stripFrontmatter(raw, context);
  const lines = body.split("\n");

  const categories: DrillCategory[] = [];
  const drills: Drill[] = [];
  const fileIntroLines: string[] = [];
  const sectionNumbers: number[] = [];
  let sectionNumber: number | null = null;
  let sectionTitle = "";

  let category: DrillCategory | null = null;
  let lastDrill: Drill | null = null;
  let calloutLines: string[] | null = null;

  const flushCallout = () => {
    if (calloutLines && calloutLines.length > 0) {
      if (!category) fail(context, `callout "${calloutLines.join(" ")}" appears before any category heading`);
      category.callouts.push(calloutLines.join(" ").trim());
    }
    calloutLines = null;
  };

  for (const line of lines) {
    const sectionHeading = line.match(/^### (\d+)\.\s+(.+?)\s*$/);
    if (sectionHeading) {
      flushCallout();
      sectionNumbers.push(Number(sectionHeading[1]!));
      if (sectionNumber === null) {
        sectionNumber = Number(sectionHeading[1]!);
        sectionTitle = sectionHeading[2]!;
      }
      lastDrill = null;
      continue;
    }

    const categoryHeading = line.match(/^#### (.+?)\s*$/);
    if (categoryHeading) {
      flushCallout();
      if (category) categories.push(category);
      category = {
        id: slugify(categoryHeading[1]!),
        number: -1,
        title: categoryHeading[1]!,
        drillIds: [],
        callouts: [],
      };
      lastDrill = null;
      continue;
    }

    const drillItem = line.match(/^- \*\*(.+?)\*\*\s*[—–-]\s*(.+?)\s*$/);
    if (drillItem) {
      flushCallout();
      if (!category) fail(context, `drill "${drillItem[1]}" appears before any category heading`);
      const name = drillItem[1]!;
      const id = slugify(name);
      registerId(idRegistry, id, `${context} #### ${category.title} — ${name}`);
      const drill: Drill = { id, categoryId: category.id, name, description: drillItem[2]!.trim(), relatedTechniques: [] };
      drills.push(drill);
      category.drillIds.push(id);
      lastDrill = drill;
      continue;
    }

    if (HORIZONTAL_RULE.test(line.trim())) {
      continue;
    }

    if (line.trim().startsWith("-")) {
      fail(context, `malformed drill list item: "${line.trim()}" (expected "- **Name** — description")`);
    }

    const blockquote = line.match(/^>\s?(.*)$/);
    if (blockquote) {
      lastDrill = null;
      calloutLines = calloutLines ?? [];
      calloutLines.push(blockquote[1]!.trim());
      continue;
    }

    if (line.trim() === "") {
      flushCallout();
      lastDrill = null;
      continue;
    }

    // continuation of a wrapped drill description
    if (lastDrill) {
      lastDrill.description = `${lastDrill.description} ${line.trim()}`;
      continue;
    }

    // section-level intro paragraph, only valid before the first category heading
    if (!category) {
      fileIntroLines.push(line);
      continue;
    }

    fail(
      `${context} #### ${category.title}`,
      `unclaimed markdown content not recognised by any parser branch: "${line.trim()}"`,
    );
  }
  flushCallout();
  if (category) categories.push(category);

  checkSectionRange(context, file.sections, sectionNumbers);
  if (sectionNumber === null) {
    fail(context, "no section heading found");
  }
  for (const cat of categories) {
    cat.number = sectionNumber;
  }

  const sectionIntro = fileIntroLines.join("\n").trim();
  if (!sectionIntro) {
    fail(context, "drill section intro is missing (expected a paragraph before the first category heading)");
  }

  return { categories, drills, sectionNumber, sectionTitle, sectionIntro };
}

// ---------- relations (technique <-> drill cross-filter) ----------
//
// The relation is derived from a fixed technique-category -> drill-category
// mapping, not free-form matching, so it's reproducible and reviewable. The
// mapping is validated against the *actual* parsed category ids every run —
// a renamed category heading fails the build instead of silently producing
// an empty or stale relation.

const CATEGORY_RELATIONS: Record<string, string[]> = {
  "centre-of-gravity-techniques": ["body-position-drills"],
  "foot-techniques": ["footwork-drills"],
  "hand-grip-techniques": ["movement-drills"],
  "positions-hold-orientations": ["body-position-drills"],
  "movement-techniques": ["movement-drills"],
  "dynamic-techniques": ["movement-drills"],
};

function computeRelations(guide: Guide): void {
  const techniqueCategoryIds = new Set(guide.techniqueCategories.map((c) => c.id));
  const drillCategoryIds = new Set(guide.drillCategories.map((c) => c.id));

  for (const [techCatId, drillCatIds] of Object.entries(CATEGORY_RELATIONS)) {
    if (!techniqueCategoryIds.has(techCatId)) {
      fail(
        "CATEGORY_RELATIONS (scripts/parse-guide.ts)",
        `references unknown technique category \`${techCatId}\` — it no longer matches any parsed category id`,
      );
    }
    for (const drillCatId of drillCatIds) {
      if (!drillCategoryIds.has(drillCatId)) {
        fail(
          "CATEGORY_RELATIONS (scripts/parse-guide.ts)",
          `references unknown drill category \`${drillCatId}\` — it no longer matches any parsed category id`,
        );
      }
    }
  }

  const techCatToDrillCats = new Map<string, Set<string>>();
  const drillCatToTechCats = new Map<string, Set<string>>();
  for (const [techCatId, drillCatIds] of Object.entries(CATEGORY_RELATIONS)) {
    techCatToDrillCats.set(techCatId, new Set(drillCatIds));
    for (const drillCatId of drillCatIds) {
      if (!drillCatToTechCats.has(drillCatId)) drillCatToTechCats.set(drillCatId, new Set());
      drillCatToTechCats.get(drillCatId)!.add(techCatId);
    }
  }

  const drillIdsByCategory = new Map<string, string[]>();
  for (const drill of guide.drills) {
    if (!drillIdsByCategory.has(drill.categoryId)) drillIdsByCategory.set(drill.categoryId, []);
    drillIdsByCategory.get(drill.categoryId)!.push(drill.id);
  }
  const techniqueIdsByCategory = new Map<string, string[]>();
  for (const technique of guide.techniques) {
    if (!techniqueIdsByCategory.has(technique.categoryId)) techniqueIdsByCategory.set(technique.categoryId, []);
    techniqueIdsByCategory.get(technique.categoryId)!.push(technique.id);
  }

  for (const technique of guide.techniques) {
    const drillCats = techCatToDrillCats.get(technique.categoryId);
    if (!drillCats) continue;
    const related: string[] = [];
    for (const drillCatId of drillCats) {
      related.push(...(drillIdsByCategory.get(drillCatId) ?? []));
    }
    technique.relatedDrills = related;
  }

  for (const drill of guide.drills) {
    const techCats = drillCatToTechCats.get(drill.categoryId);
    if (!techCats) continue;
    const related: string[] = [];
    for (const techCatId of techCats) {
      related.push(...(techniqueIdsByCategory.get(techCatId) ?? []));
    }
    drill.relatedTechniques = related;
  }
}

// ---------- progressions ----------

function parseProgressions(
  raw: string,
  file: ManifestFile,
  techniqueIds: Set<string>,
  drillIds: Set<string>,
  idRegistry: Map<string, string>,
): ProgressionStage[] {
  const context = file.path;
  const body = stripFrontmatter(raw, context);
  const lines = body.split("\n");

  const stages: ProgressionStage[] = [];
  const preamble: string[] = [];

  let entry: (Partial<ProgressionStage> & { techniquesRaw?: string; drillsRaw?: string }) | null = null;
  let entryContext = "";

  const finishEntry = () => {
    if (!entry) return;
    const required: Array<"id" | "title" | "summary"> = ["id", "title", "summary"];
    for (const key of required) {
      if (!entry[key] || String(entry[key]).trim() === "") {
        fail(entryContext, `missing required field \`${key}\``);
      }
    }
    const id = entry.id as string;
    const techniques = (entry.techniquesRaw ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
    const drills = (entry.drillsRaw ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (techniques.length === 0 && drills.length === 0) {
      fail(entryContext, "stage has no `techniques:` or `drills:` entries — a stage must reference at least one");
    }
    for (const tId of techniques) {
      if (!techniqueIds.has(tId)) {
        fail(entryContext, `\`techniques:\` references unknown technique id \`${tId}\``);
      }
    }
    for (const dId of drills) {
      if (!drillIds.has(dId)) {
        fail(entryContext, `\`drills:\` references unknown drill id \`${dId}\``);
      }
    }

    registerId(idRegistry, id, entryContext);
    stages.push({
      id,
      order: stages.length + 1,
      title: entry.title!.trim(),
      summary: entry.summary!.trim(),
      techniqueIds: techniques,
      drillIds: drills,
    });
    entry = null;
  };

  for (const line of lines) {
    const entryHeading = line.match(/^#### (.+?)\s*$/);
    if (entryHeading) {
      finishEntry();
      entry = { title: entryHeading[1] };
      entryContext = `${context} #### ${entryHeading[1]}`;
      continue;
    }

    const fieldLine = line.match(/^- ([a-zA-Z]+):\s*(.*)$/);
    if (fieldLine) {
      if (!entry) fail(context, `field \`${fieldLine[1]}\` appears outside any stage entry`);
      const key = fieldLine[1]!.toLowerCase();
      const value = fieldLine[2]!.trim();
      if (key === "id") entry.id = value.replace(/`/g, "").trim();
      else if (key === "techniques") entry.techniquesRaw = value.replace(/`/g, "");
      else if (key === "drills") entry.drillsRaw = value.replace(/`/g, "");
      else if (key === "summary") entry.summary = value;
      else fail(entryContext, `unknown field \`${key}\``);
      continue;
    }

    if (HORIZONTAL_RULE.test(line.trim())) {
      continue;
    }

    if (line.trim() === "") {
      continue;
    }

    if (!entry) {
      preamble.push(line);
      continue;
    }

    fail(entryContext, `unclaimed markdown content not recognised by any parser branch: "${line.trim()}"`);
  }
  finishEntry();

  if (preamble.join("\n").trim().length > 0) {
    fail(context, "content found outside any `####` stage entry — only entries and their fields are supported");
  }

  return stages;
}

// ---------- references ----------

function parseReferences(raw: string, file: ManifestFile, idRegistry: Map<string, string>): ReferenceEntry[] {
  const context = file.path;
  const body = stripFrontmatter(raw, context);
  const lines = body.split("\n");

  const references: ReferenceEntry[] = [];
  const sectionNumbers: number[] = [];
  const preamble: string[] = [];

  let entry: (Partial<ReferenceEntry> & { title?: string }) | null = null;
  let entryContext = "";

  const finishEntry = () => {
    if (!entry) return;
    const required: Array<"id" | "refType" | "author" | "note"> = ["id", "refType", "author", "note"];
    for (const key of required) {
      if (!entry[key] || String(entry[key]).trim() === "") {
        fail(entryContext, `missing required field \`${key === "refType" ? "type" : key}\``);
      }
    }
    const id = entry.id as string;
    if (!id.startsWith("ref-")) {
      fail(entryContext, `id \`${id}\` must start with \`ref-\``);
    }
    if (!VALID_REF_TYPES.includes(entry.refType as any)) {
      fail(entryContext, `unknown type \`${entry.refType}\` — must be one of ${VALID_REF_TYPES.join(" | ")}`);
    }
    registerId(idRegistry, id, entryContext);
    references.push({
      id,
      refType: entry.refType as ReferenceEntry["refType"],
      author: entry.author!.trim(),
      url: entry.url?.trim(),
      note: entry.note!.trim(),
    });
    entry = null;
  };

  for (const line of lines) {
    const sectionHeading = line.match(/^### (\d+)\.\s+(.+?)\s*$/);
    if (sectionHeading) {
      sectionNumbers.push(Number(sectionHeading[1]));
      continue;
    }

    const entryHeading = line.match(/^#### (.+?)\s*$/);
    if (entryHeading) {
      finishEntry();
      entry = { title: entryHeading[1] };
      entryContext = `${context} #### ${entryHeading[1]}`;
      continue;
    }

    const fieldLine = line.match(/^- ([a-zA-Z]+):\s*(.*)$/);
    if (fieldLine) {
      if (!entry) fail(context, `field \`${fieldLine[1]}\` appears outside any reference entry`);
      const key = fieldLine[1]!.toLowerCase();
      let value = fieldLine[2]!.trim();
      if (key === "id") entry.id = value.replace(/`/g, "").trim();
      else if (key === "type") entry.refType = value.replace(/`/g, "").trim() as ReferenceEntry["refType"];
      else if (key === "author") entry.author = value;
      else if (key === "url") entry.url = value;
      else if (key === "note") entry.note = value;
      else fail(entryContext, `unknown field \`${key}\``);
      continue;
    }

    if (HORIZONTAL_RULE.test(line.trim())) {
      continue;
    }

    if (line.trim() === "") {
      continue;
    }

    if (!entry) {
      preamble.push(line);
      continue;
    }

    fail(entryContext, `unclaimed markdown content not recognised by any parser branch: "${line.trim()}"`);
  }
  finishEntry();

  if (preamble.join("\n").trim().length > 0) {
    fail(context, "content found outside any `####` reference entry — only entries and their fields are supported");
  }

  if (sectionNumbers.length > 0) {
    checkSectionRange(context, file.sections, sectionNumbers);
  }

  return references;
}

// ---------- translation (guide.es.json) ----------
//
// content/ is authored in English only. The Spanish translation is a hand-authored
// dictionary keyed by the same ids the EN parse produced, merged onto the EN
// structure (ids, tags, section numbers, order, drillIds/techniqueIds) so both
// languages are guaranteed to share identical shape and identical ids. Missing
// *or* stale (orphaned) dictionary entries both fail loudly — content drifting
// out of sync with its translation is exactly the kind of silent gap this
// pipeline elsewhere refuses to allow.

interface EsDict {
  meta: { title: string; subtitle: string; parts: Record<string, string> };
  tagLegend: Record<Tag, string>;
  nonstandardNote: string;
  prose: Record<string, { title: string; sections: Record<string, { title: string; body: string }> }>;
  techniqueCategories: Record<string, { title: string; intro: string }>;
  techniques: Record<string, { gloss: string | null; what: string; how: string; best: string }>;
  drillSection: { title: string; intro: string };
  drillCategories: Record<string, { title: string; callouts: string[] }>;
  drills: Record<string, { name: string; description: string }>;
  progressionStages: Record<string, { title: string; summary: string }>;
}

function checkKeysMatch(enKeys: string[], dictKeys: string[], label: string): void {
  const enSet = new Set(enKeys);
  const dictSet = new Set(dictKeys);
  const missing = enKeys.filter((k) => !dictSet.has(k));
  const stale = dictKeys.filter((k) => !enSet.has(k));
  if (missing.length > 0) {
    fail(ES_DICT_PATH, `${label}: missing ES translation for: ${missing.join(", ")}`);
  }
  if (stale.length > 0) {
    fail(
      ES_DICT_PATH,
      `${label}: translation dictionary has entries no longer present in content/: ${stale.join(", ")} — remove them`,
    );
  }
}

function loadEsDict(): EsDict {
  if (!existsSync(ES_DICT_PATH)) {
    fail(ES_DICT_PATH, "Spanish translation dictionary not found");
  }
  return JSON.parse(readFileSync(ES_DICT_PATH, "utf-8"));
}

function buildEsGuide(en: Guide, dict: EsDict): Guide {
  checkKeysMatch(
    en.prose.map((p) => p.id),
    Object.keys(dict.prose),
    "prose files",
  );
  for (const file of en.prose) {
    checkKeysMatch(
      file.sections.map((s) => String(s.number)),
      Object.keys(dict.prose[file.id]!.sections),
      `prose/${file.id} sections`,
    );
  }
  checkKeysMatch(
    en.techniqueCategories.map((c) => c.id),
    Object.keys(dict.techniqueCategories),
    "technique categories",
  );
  checkKeysMatch(
    en.techniques.map((t) => t.id),
    Object.keys(dict.techniques),
    "techniques",
  );
  checkKeysMatch(
    en.drillCategories.map((c) => c.id),
    Object.keys(dict.drillCategories),
    "drill categories",
  );
  checkKeysMatch(
    en.drills.map((d) => d.id),
    Object.keys(dict.drills),
    "drills",
  );
  checkKeysMatch(
    en.progressionStages.map((s) => s.id),
    Object.keys(dict.progressionStages),
    "progression stages",
  );
  for (const tag of VALID_TAGS) {
    if (!dict.tagLegend[tag]) {
      fail(ES_DICT_PATH, `tag legend: missing ES translation for tag \`${tag}\``);
    }
  }

  const prose: ProseFile[] = en.prose.map((file) => {
    const fileDict = dict.prose[file.id]!;
    const sections: ProseSection[] = file.sections.map((s) => {
      const sDict = fileDict.sections[String(s.number)]!;
      return { number: s.number, title: sDict.title, body: sDict.body };
    });
    return { id: file.id, title: fileDict.title, part: file.part, order: file.order, sections };
  });

  const techniqueCategories: TechniqueCategory[] = en.techniqueCategories.map((c) => {
    const cDict = dict.techniqueCategories[c.id]!;
    return { ...c, title: cDict.title, intro: cDict.intro };
  });

  const techniques: Technique[] = en.techniques.map((t) => {
    const tDict = dict.techniques[t.id]!;
    return { ...t, gloss: tDict.gloss ?? null, what: tDict.what, how: tDict.how, best: tDict.best };
  });

  const drillCategories: DrillCategory[] = en.drillCategories.map((c) => {
    const cDict = dict.drillCategories[c.id]!;
    if (cDict.callouts.length !== c.callouts.length) {
      fail(
        ES_DICT_PATH,
        `drill category \`${c.id}\` has ${c.callouts.length} callout(s) in English but ${cDict.callouts.length} in the ES dictionary`,
      );
    }
    return { ...c, title: cDict.title, callouts: cDict.callouts };
  });

  const drills: Drill[] = en.drills.map((d) => {
    const dDict = dict.drills[d.id]!;
    return { ...d, name: dDict.name, description: dDict.description };
  });

  const progressionStages: ProgressionStage[] = en.progressionStages.map((s) => {
    const sDict = dict.progressionStages[s.id]!;
    return { ...s, title: sDict.title, summary: sDict.summary };
  });

  if (!en.drillSection) {
    fail(ES_DICT_PATH, "internal: EN guide has no drillSection to translate");
  }
  const drillSection: DrillSection = {
    number: en.drillSection.number,
    title: dict.drillSection.title,
    intro: dict.drillSection.intro,
  };

  const sectionIndex: Record<string, SectionIndexEntry> = {};
  for (const [key, entry] of Object.entries(en.sectionIndex)) {
    let title = entry.title;
    if (entry.kind === "prose" && entry.fileId) {
      const section = prose.find((p) => p.id === entry.fileId)?.sections.find((s) => String(s.number) === key);
      if (section) title = section.title;
    } else if (entry.kind === "techniqueCategory" && entry.categoryId) {
      const cat = techniqueCategories.find((c) => c.id === entry.categoryId);
      if (cat) title = cat.title;
    } else if (entry.kind === "drillCategory") {
      title = drillSection.title;
    }
    sectionIndex[key] = { ...entry, title };
  }

  return {
    meta: {
      title: dict.meta.title,
      subtitle: dict.meta.subtitle,
      version: en.meta.version,
      parts: dict.meta.parts,
    },
    tagLegend: dict.tagLegend,
    nonstandardNote: dict.nonstandardNote,
    sectionIndex,
    prose,
    techniqueCategories,
    techniques,
    drillSection,
    drillCategories,
    drills,
    references: [],
    progressionStages,
  };
}

// ---------- driver ----------

function main() {
  if (!existsSync(MANIFEST_PATH)) {
    fail(MANIFEST_PATH, "manifest not found");
  }
  const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));

  const files = [...manifest.files].sort((a, b) => a.order - b.order);

  const idRegistry = new Map<string, string>();
  const sectionIndex: Record<string, SectionIndexEntry> = {};

  function addSection(entry: SectionIndexEntry, context: string): void {
    const key = String(entry.number);
    const existing = sectionIndex[key];
    if (existing) {
      fail(context, `section §${entry.number} is already claimed by ${existing.kind} "${existing.title}"`);
    }
    sectionIndex[key] = entry;
  }

  const guide: Guide = {
    meta: {
      title: manifest.title,
      subtitle: manifest.subtitle,
      version: manifest.version,
      parts: manifest.parts,
    },
    tagLegend: {} as Record<Tag, string>,
    nonstandardNote: "",
    sectionIndex,
    prose: [],
    techniqueCategories: [],
    techniques: [],
    drillSection: null,
    drillCategories: [],
    drills: [],
    references: [],
    progressionStages: [],
  };

  const skipped: string[] = [];
  const parsed: string[] = [];

  for (const file of files) {
    const absPath = path.resolve(ROOT, file.path);
    if (!existsSync(absPath)) {
      fail(file.path, "listed in manifest.json but the file does not exist");
    }

    if (file.status === "stub") {
      skipped.push(`${file.path} (${file.id}, status: stub)`);
      continue;
    }

    const raw = readFileSync(absPath, "utf-8");

    switch (file.type) {
      case "prose": {
        const proseFile = parseProse(raw, file);
        for (const section of proseFile.sections) {
          addSection(
            { number: section.number, kind: "prose", title: section.title, fileId: proseFile.id },
            `${file.path} §${section.number}`,
          );
        }
        guide.prose.push(proseFile);
        break;
      }
      case "techniques": {
        const { categories, techniques, tagLegend, nonstandardNote } = parseTechniques(raw, file, idRegistry);
        for (const cat of categories) {
          addSection(
            { number: cat.number, kind: "techniqueCategory", title: cat.title, categoryId: cat.id },
            `${file.path} §${cat.number}`,
          );
        }
        guide.techniqueCategories.push(...categories);
        guide.techniques.push(...techniques);
        guide.tagLegend = tagLegend;
        guide.nonstandardNote = nonstandardNote;
        break;
      }
      case "drills": {
        const { categories, drills, sectionNumber, sectionTitle, sectionIntro } = parseDrills(raw, file, idRegistry);
        addSection({ number: sectionNumber, kind: "drillCategory", title: sectionTitle }, `${file.path} §${sectionNumber}`);
        guide.drillSection = { number: sectionNumber, title: sectionTitle, intro: sectionIntro };
        guide.drillCategories.push(...categories);
        guide.drills.push(...drills);
        break;
      }
      case "references": {
        guide.references.push(...parseReferences(raw, file, idRegistry));
        break;
      }
      case "progressions": {
        const techniqueIds = new Set(guide.techniques.map((t) => t.id));
        const drillIds = new Set(guide.drills.map((d) => d.id));
        guide.progressionStages.push(...parseProgressions(raw, file, techniqueIds, drillIds, idRegistry));
        break;
      }
      default: {
        fail(file.path, `unknown file type \`${file.type}\` in manifest`);
      }
    }
    parsed.push(`${file.path} (${file.id})`);
  }

  computeRelations(guide);

  const esDict = loadEsDict();
  const guideEs = buildEsGuide(guide, esDict);

  mkdirSync(path.dirname(OUT_PATH_EN), { recursive: true });
  writeFileSync(OUT_PATH_EN, `${JSON.stringify(guide, null, 2)}\n`, "utf-8");
  writeFileSync(OUT_PATH_ES, `${JSON.stringify(guideEs, null, 2)}\n`, "utf-8");

  console.log("parse-guide: done");
  console.log(`  parsed:  ${parsed.join(", ")}`);
  console.log(`  skipped: ${skipped.length ? skipped.join(", ") : "(none)"}`);
  console.log(
    `  techniques: ${guide.techniques.length} across ${guide.techniqueCategories.length} categories`,
  );
  console.log(`  drills: ${guide.drills.length} across ${guide.drillCategories.length} categories`);
  console.log(
    `  drill callouts: ${guide.drillCategories.reduce((n, c) => n + c.callouts.length, 0)}`,
  );
  console.log(`  references: ${guide.references.length}`);
  console.log(`  progression stages: ${guide.progressionStages.length}`);
  console.log(`  sections indexed: ${Object.keys(sectionIndex).length}`);
  console.log(`  wrote: ${path.relative(ROOT, OUT_PATH_EN)}`);
  console.log(`  wrote: ${path.relative(ROOT, OUT_PATH_ES)}`);
}

const isDirectRun = (() => {
  if (!process.argv[1]) return false;
  return path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
})();

if (isDirectRun) {
  try {
    main();
  } catch (err) {
    if (err instanceof ParseError) {
      console.error(`\nparse-guide: FAILED\n  ${err.message}\n`);
      process.exit(1);
    }
    throw err;
  }
}

export { ParseError, parseProse, parseTechniques, parseDrills, parseReferences, parseProgressions, computeRelations, buildEsGuide };
export type {
  ManifestFile,
  FileType,
  Guide,
  Tag,
  Technique,
  TechniqueCategory,
  ProgressionStage,
  Drill,
  DrillCategory,
  DrillSection,
  ProseFile,
  ProseSection,
  ReferenceEntry,
  SectionIndexEntry,
  EsDict,
};
