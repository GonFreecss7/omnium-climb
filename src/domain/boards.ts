// Standardised training boards. Angle ranges come from the makers' published
// specs where available (Tension Board 2: 0–65°, Quantum M: 15–60°, Decoy on a
// Grasshopper frame: 0–60°); otherwise the common adjustable range 0–70° is
// offered. MoonBoard sets are graded at fixed 25° and 40°.

import type { BoulderScale } from "./grades";

export interface Board {
  id: string;
  name: string;
  minAngle: number;
  maxAngle: number;
  /** Boards graded only at specific angles. */
  fixedAngles?: number[];
  defaultScale: BoulderScale;
}

export const BOARDS: Board[] = [
  { id: "kilter", name: "Kilter Board", minAngle: 0, maxAngle: 70, defaultScale: "V" },
  { id: "tension-1", name: "Tension Board 1", minAngle: 0, maxAngle: 70, defaultScale: "V" },
  { id: "tension-2", name: "Tension Board 2", minAngle: 0, maxAngle: 65, defaultScale: "V" },
  { id: "moon-2016", name: "MoonBoard 2016", minAngle: 25, maxAngle: 40, fixedAngles: [25, 40], defaultScale: "Font" },
  { id: "moon-2017", name: "MoonBoard Masters 2017", minAngle: 25, maxAngle: 40, fixedAngles: [25, 40], defaultScale: "Font" },
  { id: "moon-2019", name: "MoonBoard Masters 2019", minAngle: 25, maxAngle: 40, fixedAngles: [25, 40], defaultScale: "Font" },
  { id: "moon-2024", name: "MoonBoard 2024", minAngle: 25, maxAngle: 40, fixedAngles: [25, 40], defaultScale: "Font" },
  { id: "grasshopper", name: "Grasshopper", minAngle: 0, maxAngle: 70, defaultScale: "V" },
  { id: "decoy", name: "Decoy Board", minAngle: 0, maxAngle: 60, defaultScale: "V" },
  { id: "quantum", name: "Quantum Board", minAngle: 15, maxAngle: 60, defaultScale: "V" },
  { id: "lattice", name: "Lattice Board", minAngle: 0, maxAngle: 70, defaultScale: "V" },
  { id: "spray", name: "Spray wall", minAngle: 0, maxAngle: 70, defaultScale: "V" },
  { id: "other", name: "", minAngle: 0, maxAngle: 70, defaultScale: "V" },
];

export function boardAngles(b: Board): number[] {
  if (b.fixedAngles) return b.fixedAngles;
  const out: number[] = [];
  for (let a = Math.ceil(b.minAngle / 5) * 5; a <= b.maxAngle; a += 5) out.push(a);
  return out;
}

/** Most boards are set and graded around 40°; start there when it's in range. */
export function defaultAngle(b: Board): number {
  const angles = boardAngles(b);
  return angles.includes(40) ? 40 : angles[Math.floor(angles.length / 2)]!;
}
