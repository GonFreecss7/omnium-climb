// Full-device backup: every `cg.*` localStorage key in one JSON file, so a
// lost phone or a cleared browser doesn't take the climber's history with it.

export const BACKUP_FORMAT = "omnium-climb-backup";
export const BACKUP_VERSION = 1;

/** Keys that hold the climber's own data. UI-only keys are included too so a restore feels identical. */
const KEYS = [
  "cg.profile",
  "cg.circuits",
  "cg.log",
  "cg.notes",
  "cg.favorites",
  "cg.levelColors",
  "cg.sessionDraft",
  "cg.lang",
  "cg.theme",
  "cg.onboardingSkipped",
  "cg.levelUpDismissed",
] as const;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  appVersion: string;
  data: Record<string, string>;
}

export function buildBackup(appVersion: string): BackupFile {
  const data: Record<string, string> = {};
  for (const key of KEYS) {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) data[key] = v;
    } catch {
      // unavailable storage — export what we can
    }
  }
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), appVersion, data };
}

export type RestoreResult = { ok: true; keys: number } | { ok: false; reason: "invalid" | "newer" | "storage" };

/** Validates and writes a backup. Existing keys not in the file are cleared, so the result matches the backup exactly. */
export function restoreBackup(raw: string): RestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  const b = parsed as Partial<BackupFile>;
  if (!b || b.format !== BACKUP_FORMAT || typeof b.version !== "number" || !b.data || typeof b.data !== "object") {
    return { ok: false, reason: "invalid" };
  }
  if (b.version > BACKUP_VERSION) return { ok: false, reason: "newer" };
  const entries = Object.entries(b.data).filter(
    ([k, v]) => (KEYS as readonly string[]).includes(k) && typeof v === "string",
  ) as Array<[string, string]>;
  try {
    for (const key of KEYS) localStorage.removeItem(key);
    for (const [k, v] of entries) localStorage.setItem(k, v);
  } catch {
    return { ok: false, reason: "storage" };
  }
  return { ok: true, keys: entries.length };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
