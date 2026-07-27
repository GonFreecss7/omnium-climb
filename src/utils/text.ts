// Strips combining diacritical marks (Unicode General Category "Mark") after
// NFD decomposition, so search is accent-insensitive: "talon" and "talón" match.
const COMBINING_MARKS = /\p{M}/gu;

export function normalize(text: string): string {
  return text.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase();
}
