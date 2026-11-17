import { test } from "node:test";
import assert from "node:assert/strict";
import { coach, daysBetween } from "../src/domain/coach";
import type { CoachInput } from "../src/domain/coach";
import type { ClimberProfile } from "../src/domain/levels";
import type { ClimbEntry } from "../src/domain/sessions";

const TODAY = "2026-11-17";

function day(offset: number): string {
  const d = new Date(Date.UTC(2026, 10, 17 - offset));
  return d.toISOString().slice(0, 10);
}

function profile(over: Partial<ClimberProfile> = {}): ClimberProfile {
  return {
    version: 1,
    disciplines: ["boulder"],
    boulderScale: "V",
    ropeScale: "French",
    boulderMax: 10,
    ropeMax: null,
    experience: "3to5",
    sessionsPerWeek: 3,
    weightKg: 70,
    heightCm: 175,
    injured: false,
    levelOverride: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...over,
  };
}

function climb(gradeIndex: number, result: ClimbEntry["result"] = "send", attempts = 1): ClimbEntry {
  return { id: `${Math.random()}`, discipline: "boulder", gradeIndex, gradeScale: "V", exact: true, result, attempts };
}

function entry(offset: number, climbs: ClimbEntry[], extra: Partial<CoachInput["log"][number]> = {}) {
  return { id: `e${offset}`, date: day(offset), drill: "Silent feet", hardest: "", elbow: "same" as const, climbs, ...extra };
}

function input(over: Partial<CoachInput> = {}): CoachInput {
  return {
    today: TODAY,
    profile: profile(),
    level: "intermediate",
    log: [],
    tests: [],
    scales: { boulder: "V", rope: "French" },
    drills: [
      { id: "silent-feet", categoryId: "footwork-drills", names: ["Silent feet", "Pies silenciosos"] },
      { id: "hover", categoryId: "body-position-drills", names: ["Hover hands"] },
      { id: "tag", categoryId: "partner-games", names: ["Tag"] },
    ],
    drillTechniques: { "silent-feet": ["edge"], hover: ["flag"] },
    techniques: [
      { id: "edge", level: "intermediate", caution: false },
      { id: "flag", level: "intermediate", caution: false },
    ],
    ...over,
  };
}

test("daysBetween counts calendar days", () => {
  assert.equal(daysBetween("2026-11-10", TODAY), 7);
});

test("injury overrides everything", () => {
  const p = coach(input({ profile: profile({ injured: true }) }));
  assert.equal(p.focus, "easy");
  assert.equal(p.reason.code, "injured");
  assert.ok(!p.items.some((i) => i.kind === "workout"));
});

test("two worse-elbow sessions in the last three means rest", () => {
  const log = [entry(1, [climb(10)], { elbow: "worse" }), entry(3, [climb(10)], { elbow: "worse" }), entry(5, [climb(10)])];
  assert.equal(coach(input({ log })).focus, "rest");
});

test("three days in a row means rest", () => {
  const log = [entry(1, [climb(8)]), entry(2, [climb(8)]), entry(3, [climb(8)])];
  const p = coach(input({ log }));
  assert.equal(p.focus, "rest");
  assert.deepEqual(p.reason, { code: "streak", days: 3 });
});

test("little data → technique, never a partner game", () => {
  const p = coach(input({ log: [entry(4, [climb(8)])] }));
  assert.equal(p.focus, "technique");
  const drill = p.items.find((i) => i.kind === "drill");
  assert.ok(drill && drill.kind === "drill" && drill.id !== "tag");
});

test("one send at the top with little below → volume one grade down", () => {
  // V-scale ladder: find two indices with distinct V labels.
  const log = [entry(2, [climb(14), climb(4), climb(4)]), entry(5, [climb(4)]), entry(9, [climb(4)])];
  const p = coach(input({ log }));
  assert.equal(p.focus, "volume");
  assert.equal(p.reason.code, "thinBase");
});

test("high flash rate with a solid base → project", () => {
  const log = [0, 1, 2].map((k) => entry(2 + k * 3, [climb(10, "flash"), climb(10, "flash"), climb(9, "flash"), climb(9, "send")]));
  const p = coach(input({ log }));
  assert.equal(p.focus, "project");
});

test("advanced climber without a finger test is asked to test", () => {
  const log = [2, 5, 8].map((o) => entry(o, [climb(12)]));
  const p = coach(input({ log, level: "advanced" }));
  assert.ok(p.items.some((i) => i.kind === "workout" && i.id === "finger-test" && i.why === "noTest"));
});

test("beginners get no hangboard", () => {
  const p = coach(input({ level: "beginner" }));
  assert.ok(!p.items.some((i) => i.kind === "workout"));
});

test("same day, same pick", () => {
  assert.deepEqual(coach(input()), coach(input()));
});
