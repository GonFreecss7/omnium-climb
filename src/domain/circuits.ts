// Gym colour circuits: each gym marks grade ranges with hold/tape colours,
// and every gym does it differently. Ranges are stored as boulder-ladder
// indices (see grades.ts) so they display in whichever scale the climber uses.

import { BOULDER_LADDER, gradeLabel, labelSpan } from "./grades";
import type { BoulderScale } from "./grades";
import type { Level } from "./levels";

export interface CircuitColor {
  id: string;
  name: string;
  hex: string;
  /** Inclusive boulder-ladder index range. */
  min: number;
  max: number;
}

export interface GymCircuit {
  id: string;
  name: string;
  /** Boulder scale this gym grades in — circuit ranges are shown in it. */
  scale: BoulderScale;
  colors: CircuitColor[];
}

export interface CircuitsState {
  /** The climber's home gym. */
  homeId: string | null;
  gyms: GymCircuit[];
}

export const EMPTY_CIRCUITS: CircuitsState = { homeId: null, gyms: [] };

export interface PaletteColor {
  hex: string;
  name: { es: string; en: string };
}

/** Common hold / tape colours, offered as one-tap swatches. */
export const PALETTE: PaletteColor[] = [
  { hex: "#2fa35b", name: { es: "Verde", en: "Green" } },
  { hex: "#f2c230", name: { es: "Amarillo", en: "Yellow" } },
  { hex: "#f28a24", name: { es: "Naranjo", en: "Orange" } },
  { hex: "#2f6fe4", name: { es: "Azul", en: "Blue" } },
  { hex: "#4cc3f0", name: { es: "Celeste", en: "Light blue" } },
  { hex: "#e0393e", name: { es: "Rojo", en: "Red" } },
  { hex: "#8b5cf6", name: { es: "Morado", en: "Purple" } },
  { hex: "#ec5fa6", name: { es: "Rosado", en: "Pink" } },
  { hex: "#111315", name: { es: "Negro", en: "Black" } },
  { hex: "#f4f4f2", name: { es: "Blanco", en: "White" } },
  { hex: "#8a8f96", name: { es: "Gris", en: "Grey" } },
  { hex: "#8b5e3c", name: { es: "Café", en: "Brown" } },
];

const LAST = BOULDER_LADDER.length - 1;

function vIndex(v: string): number {
  return BOULDER_LADDER.findIndex((r) => r.V === v);
}

/** Starting point the climber edits — a common 7-colour layout. */
export function templateColors(lang: "es" | "en"): CircuitColor[] {
  return templateGym(lang, "", "V").colors;
}

export function emptyGym(scale: BoulderScale = "V"): GymCircuit {
  return { id: newId(), name: "", scale, colors: [] };
}

export function templateGym(lang: "es" | "en", name: string, scale: BoulderScale): GymCircuit {
  const c = (hex: string, from: string, to: string | null): CircuitColor => {
    const p = PALETTE.find((x) => x.hex === hex)!;
    return { id: newId(), name: p.name[lang], hex, min: vIndex(from), max: to === null ? LAST : labelSpan(vIndex(to), "V")[1] };
  };
  return {
    id: newId(),
    name,
    scale,
    colors: [
      c("#2fa35b", "V0", "V0"),
      c("#f2c230", "V1", "V1"),
      c("#2f6fe4", "V2", "V3"),
      c("#e0393e", "V4", "V5"),
      c("#8b5cf6", "V6", "V7"),
      c("#111315", "V8", "V9"),
      c("#ec5fa6", "V10", null),
    ],
  };
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function homeGym(state: CircuitsState): GymCircuit | null {
  return state.gyms.find((g) => g.id === state.homeId) ?? null;
}

/** Home gym first, then the rest in the order they were added. */
export function orderedGyms(state: CircuitsState): GymCircuit[] {
  const home = homeGym(state);
  return home ? [home, ...state.gyms.filter((g) => g.id !== home.id)] : state.gyms;
}

/** First circuit colour whose range contains the grade. */
export function circuitForGrade(gym: GymCircuit | null, index: number | null): CircuitColor | null {
  if (!gym || index === null) return null;
  return gym.colors.find((c) => index >= c.min && index <= c.max) ?? null;
}

export function rangeLabel(c: { min: number; max: number }, scale: BoulderScale): string {
  const lo = gradeLabel(c.min, scale);
  if (c.max >= LAST) return `${lo}+`;
  const hi = gradeLabel(c.max, scale);
  return lo === hi ? lo : `${lo}–${hi}`;
}

export function sortColors(colors: CircuitColor[]): CircuitColor[] {
  return [...colors].sort((a, b) => a.min - b.min || a.max - b.max);
}

/** Readable text colour (near-black or white) for a filled swatch. */
export function inkFor(hex: string): string {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "#ffffff";
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => {
    const c = parseInt(h!, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return lum > 0.4 ? "#14171b" : "#ffffff";
}

export function isHex(s: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(s);
}

export type LevelColors = Partial<Record<Level, string>>;

export function parseCircuits(raw: unknown): CircuitsState {
  if (!raw || typeof raw !== "object") return EMPTY_CIRCUITS;
  const r = raw as Partial<CircuitsState> & { activeId?: string };
  if (!Array.isArray(r.gyms)) return EMPTY_CIRCUITS;
  const gyms = r.gyms
    .filter(
      (g): g is GymCircuit => !!g && typeof g.id === "string" && typeof g.name === "string" && Array.isArray(g.colors),
    )
    .map((g) => ({ ...g, scale: g.scale === "Font" ? "Font" : "V" }) as GymCircuit);
  const wanted = r.homeId ?? r.activeId;
  const homeId = gyms.some((g) => g.id === wanted) ? (wanted as string) : (gyms[0]?.id ?? null);
  return { homeId, gyms };
}

export function hasContent(g: GymCircuit): boolean {
  return g.name.trim() !== "" || g.colors.length > 0;
}
