import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getGuide } from "../data";
import type { Guide } from "../data/types";
import { ui } from "../i18n/ui";
import type { Lang, UiStrings } from "../i18n/ui";
import { computeLevel } from "../domain/levels";
import type { ClimberProfile, LevelResult } from "../domain/levels";
import type { Discipline, GradeScale } from "../domain/grades";
import { EMPTY_CIRCUITS, inkFor, isHex, parseCircuits } from "../domain/circuits";
import type { CircuitsState, LevelColors } from "../domain/circuits";
import type { ClimbEntry } from "../domain/sessions";
import { LEVELS } from "../domain/levels";

export type Theme = "dark" | "light";
export type Tab = "guide" | "techniques" | "drills" | "progressions" | "session" | "gyms";
export type ElbowChange = "better" | "same" | "worse";
export type EntryKind = "technique" | "drill";

export interface SessionLogEntry {
  id: string;
  date: string;
  drill: string;
  hardest: string;
  elbow: ElbowChange;
  note: string;
  /** Structured grade — absent on entries logged before profiles existed. */
  discipline?: Discipline;
  gradeIndex?: number | null;
  gradeScale?: GradeScale;
  /** Gym circuit colour picked for this entry, copied so later edits to the circuit don't rewrite history. */
  circuit?: { name: string; hex: string; min: number; max: number };
  /** Where the session happened. `id` is set when it was one of the saved gyms. */
  gym?: { name: string; id?: string; home: boolean; directoryId?: string };
  /** Set when the session was on a training board rather than the gym's walls. */
  board?: { id: string; name: string; angle: number };
  /** Every climb tried in the session (absent on entries logged before per-climb logging). */
  climbs?: ClimbEntry[];
}

const LANG_KEY = "cg.lang";
const THEME_KEY = "cg.theme";
const FAVORITES_KEY = "cg.favorites";
const LOG_KEY = "cg.log";
const NOTES_KEY = "cg.notes";
const PROFILE_KEY = "cg.profile";
const ONBOARDING_SKIPPED_KEY = "cg.onboardingSkipped";
const CIRCUITS_KEY = "cg.circuits";
const LEVEL_COLORS_KEY = "cg.levelColors";

function initialCircuits(): CircuitsState {
  try {
    const stored = localStorage.getItem(CIRCUITS_KEY);
    if (stored) return parseCircuits(JSON.parse(stored));
  } catch {
    // malformed/unavailable storage
  }
  return EMPTY_CIRCUITS;
}

function initialLevelColors(): LevelColors {
  try {
    const stored = localStorage.getItem(LEVEL_COLORS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      const out: LevelColors = {};
      for (const l of LEVELS) {
        const v = parsed?.[l];
        if (typeof v === "string" && isHex(v)) out[l] = v;
      }
      return out;
    }
  } catch {
    // malformed/unavailable storage
  }
  return {};
}

function initialProfile(): ClimberProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ClimberProfile>;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.disciplines)) return parsed as ClimberProfile;
    }
  } catch {
    // malformed/unavailable storage — treat as no profile
  }
  return null;
}

function initialOnboardingOpen(): boolean {
  try {
    return localStorage.getItem(PROFILE_KEY) === null && localStorage.getItem(ONBOARDING_SKIPPED_KEY) === null;
  } catch {
    return false;
  }
}

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "es") return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to navigator detection.
  }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function initialTheme(): Theme {
  // index.html's inline script already resolved and painted this before React mounted.
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" ? "light" : "dark";
}

function initialFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return new Set(parsed.filter((x): x is string => typeof x === "string"));
    }
  } catch {
    // ignore malformed/unavailable storage — start empty
  }
  return new Set();
}

function initialLog(): SessionLogEntry[] {
  try {
    const stored = localStorage.getItem(LOG_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed as SessionLogEntry[];
    }
  } catch {
    // ignore malformed/unavailable storage — start empty
  }
  return [];
}

function initialNotes(): Record<string, string> {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    }
  } catch {
    // ignore malformed/unavailable storage — start empty
  }
  return {};
}

function tabForSection(guide: Guide, sectionNumber: number): Tab | null {
  const entry = guide.sectionIndex[String(sectionNumber)];
  if (!entry) return null;
  if (entry.kind === "techniqueCategory") return "techniques";
  if (entry.kind === "drillCategory" || entry.kind === "workouts") return "drills";
  if (entry.kind === "references") return "guide";
  if (entry.kind === "prose") return entry.fileId === "session" || entry.fileId === "warmup" ? "session" : "guide";
  return null;
}

interface AppStateValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: UiStrings;
  guide: Guide;
  tab: Tab;
  setTab: (tab: Tab) => void;
  scrollTarget: string | null;
  clearScrollTarget: () => void;
  goToSection: (sectionNumber: number) => void;
  expandRequest: { kind: EntryKind; id: string } | null;
  clearExpandRequest: () => void;
  goToEntry: (kind: EntryKind, id: string) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  log: SessionLogEntry[];
  addLogEntry: (entry: Omit<SessionLogEntry, "id">) => void;
  notes: Record<string, string>;
  setNote: (techniqueId: string, text: string) => void;
  profile: ClimberProfile | null;
  /** Derived from the profile; null when the climber skipped onboarding. */
  levelInfo: LevelResult | null;
  saveProfile: (profile: ClimberProfile) => void;
  deleteProfile: () => void;
  onboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  circuits: CircuitsState;
  setCircuits: (next: CircuitsState) => void;
  levelColors: LevelColors;
  setLevelColors: (next: LevelColors) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [tab, setTab] = useState<Tab>("guide");
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(initialFavorites);
  const [log, setLog] = useState<SessionLogEntry[]>(initialLog);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);
  const [expandRequest, setExpandRequest] = useState<{ kind: EntryKind; id: string } | null>(null);
  const [profile, setProfile] = useState<ClimberProfile | null>(initialProfile);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(initialOnboardingOpen);
  const levelInfo = useMemo(() => (profile ? computeLevel(profile) : null), [profile]);
  const [circuits, setCircuits] = useState<CircuitsState>(initialCircuits);
  const [levelColors, setLevelColors] = useState<LevelColors>(initialLevelColors);

  useEffect(() => {
    try {
      localStorage.setItem(CIRCUITS_KEY, JSON.stringify(circuits));
    } catch {
      // ignore write failures
    }
  }, [circuits]);

  // Custom level colours override the theme defaults in both light and dark.
  useEffect(() => {
    const style = document.documentElement.style;
    for (const l of LEVELS) {
      const hex = levelColors[l];
      if (hex) {
        style.setProperty(`--lvl-${l}`, hex);
        style.setProperty(`--lvl-${l}-ink`, inkFor(hex));
      } else {
        style.removeProperty(`--lvl-${l}`);
        style.removeProperty(`--lvl-${l}-ink`);
      }
    }
    try {
      localStorage.setItem(LEVEL_COLORS_KEY, JSON.stringify(levelColors));
    } catch {
      // ignore write failures
    }
  }, [levelColors]);

  const guide = useMemo(() => getGuide(lang), [lang]);
  const t = ui[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore write failures (private mode, storage full)
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore write failures
    }
  }, [theme]);

  useEffect(() => {
    document.title = guide.meta.title;
  }, [guide]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {
      // ignore write failures
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch {
      // ignore write failures
    }
  }, [log]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {
      // ignore write failures
    }
  }, [notes]);

  useEffect(() => {
    try {
      if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      else localStorage.removeItem(PROFILE_KEY);
    } catch {
      // ignore write failures
    }
  }, [profile]);

  const saveProfile = useCallback((next: ClimberProfile) => {
    setProfile({ ...next, updatedAt: new Date().toISOString() });
    setOnboardingOpen(false);
  }, []);

  const deleteProfile = useCallback(() => {
    setProfile(null);
  }, []);

  const openOnboarding = useCallback(() => setOnboardingOpen(true), []);

  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false);
    try {
      localStorage.setItem(ONBOARDING_SKIPPED_KEY, "1");
    } catch {
      // ignore write failures
    }
  }, []);

  const goToSection = useCallback(
    (sectionNumber: number) => {
      const target = tabForSection(guide, sectionNumber);
      if (!target) return;
      setTab(target);
      setScrollTarget(`section-${sectionNumber}`);
    },
    [guide],
  );

  const clearScrollTarget = useCallback(() => setScrollTarget(null), []);

  const clearExpandRequest = useCallback(() => setExpandRequest(null), []);

  const goToEntry = useCallback((kind: EntryKind, id: string) => {
    setTab(kind === "technique" ? "techniques" : "drills");
    setScrollTarget(id);
    setExpandRequest({ kind, id });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addLogEntry = useCallback((entry: Omit<SessionLogEntry, "id">) => {
    const withId: SessionLogEntry = { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    setLog((prev) => [withId, ...prev]);
  }, []);

  const setNote = useCallback((techniqueId: string, text: string) => {
    setNotes((prev) => {
      if (text.trim() === "") {
        if (!(techniqueId in prev)) return prev;
        const next = { ...prev };
        delete next[techniqueId];
        return next;
      }
      return { ...prev, [techniqueId]: text };
    });
  }, []);

  const value: AppStateValue = {
    lang,
    setLang: setLangState,
    theme,
    setTheme: setThemeState,
    t,
    guide,
    tab,
    setTab,
    scrollTarget,
    clearScrollTarget,
    goToSection,
    expandRequest,
    clearExpandRequest,
    goToEntry,
    favorites,
    toggleFavorite,
    log,
    addLogEntry,
    notes,
    setNote,
    profile,
    levelInfo,
    saveProfile,
    deleteProfile,
    onboardingOpen,
    openOnboarding,
    closeOnboarding,
    circuits,
    setCircuits,
    levelColors,
    setLevelColors,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
