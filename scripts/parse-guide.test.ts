import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { ParseError, parseDrills, parseTechniques, type FileType, type ManifestFile } from "./parse-guide.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "__fixtures__");

function readFixture(name: string): string {
  return readFileSync(path.join(FIXTURES_DIR, name), "utf-8");
}

function fixtureManifestEntry(name: string, overrides: Partial<ManifestFile> = {}): ManifestFile {
  return {
    path: `scripts/__fixtures__/${name}`,
    id: "fixture",
    title: "Fixture",
    part: "II",
    type: "techniques" as FileType,
    sections: "7-7",
    order: 0,
    status: "complete",
    ...overrides,
  };
}

test("unknown tag value fails loudly", () => {
  const raw = readFixture("unknown-tag.md");
  assert.throws(
    () => parseTechniques(raw, fixtureManifestEntry("unknown-tag.md"), new Map()),
    (err: unknown) =>
      err instanceof ParseError && /unknown tag `mythical`/.test(err.message) && /core \| later \| advanced \| caution/.test(err.message),
  );
});

test("technique entry with no declared id fails loudly (malformed entry)", () => {
  const raw = readFixture("missing-id.md");
  assert.throws(
    () => parseTechniques(raw, fixtureManifestEntry("missing-id.md"), new Map()),
    (err: unknown) =>
      err instanceof ParseError &&
      /has no declared `id` field/.test(err.message) &&
      /never derived from the display name/.test(err.message),
  );
});

test("technique id comes from the declared `id:` field, never a slug of the display name", () => {
  const raw = [
    "---",
    "id: fixture-ok",
    "title: Fixture",
    "part: II",
    "type: techniques",
    "sections: 7-7",
    "order: 0",
    "---",
    "",
    "Tags indicate roughly when a technique is worth learning:",
    "",
    "- `core` — learn first. Pays off immediately, little injury risk.",
    "- `later` — useful, once the core set is solid.",
    "- `advanced` — worth knowing by name; relevant at higher grades or in competition.",
    "- `caution` — meaningful injury risk, especially for fingers and elbows. Introduce late, never while something already hurts.",
    "",
    "`nonstandard: true` marks a name that is not standardised across gyms. The move is real; the label may differ.",
    "",
    "### 7. Fixture Category",
    "",
    "#### Some Oddly Capitalised Display Name",
    "- id: `totally-different-id`",
    "- tag: `core`",
    "- what: test",
    "- how: test",
    "- best: test",
    "",
  ].join("\n");

  const { techniques } = parseTechniques(raw, fixtureManifestEntry("inline.md"), new Map());
  assert.equal(techniques.length, 1);
  assert.equal(techniques[0]?.id, "totally-different-id");
  assert.notEqual(techniques[0]?.id, "some-oddly-capitalised-display-name");
});

test("unclaimed content inside a technique entry fails loudly, not silently dropped", () => {
  const raw = readFixture("techniques-unclaimed-content.md");
  assert.throws(
    () => parseTechniques(raw, fixtureManifestEntry("techniques-unclaimed-content.md"), new Map()),
    (err: unknown) =>
      err instanceof ParseError &&
      /unclaimed markdown content/.test(err.message) &&
      /This stray line is not a recognised field/.test(err.message),
  );
});

test("unclaimed content between drills fails loudly, not silently dropped", () => {
  const raw = readFixture("drills-unclaimed-content.md");
  assert.throws(
    () =>
      parseDrills(
        raw,
        fixtureManifestEntry("drills-unclaimed-content.md", { type: "drills", part: "III", sections: "13" }),
        new Map(),
      ),
    (err: unknown) =>
      err instanceof ParseError &&
      /unclaimed markdown content/.test(err.message) &&
      /This stray paragraph is not a drill/.test(err.message),
  );
});

test("drill section intro and per-category callouts are captured from real content shape", () => {
  const raw = [
    "---",
    "id: fixture-drills-ok",
    "title: Fixture",
    "part: III",
    "type: drills",
    "sections: 13",
    "order: 0",
    "---",
    "",
    "### 13. Fixture Drill Bank",
    "",
    "This is the section intro paragraph.",
    "",
    "#### Fixture category",
    "",
    "- **Fake drill** — a fake drill for testing.",
    "",
    "> A callout attached to Fixture category.",
    "",
  ].join("\n");

  const { categories, sectionNumber, sectionTitle, sectionIntro } = parseDrills(
    raw,
    fixtureManifestEntry("inline-drills.md", { type: "drills", part: "III", sections: "13" }),
    new Map(),
  );

  assert.equal(sectionNumber, 13);
  assert.equal(sectionTitle, "Fixture Drill Bank");
  assert.equal(sectionIntro, "This is the section intro paragraph.");
  assert.equal(categories.length, 1);
  assert.equal(categories[0]?.number, 13);
  assert.deepEqual(categories[0]?.callouts, ["A callout attached to Fixture category."]);
});
