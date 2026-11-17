# CLAUDE.md

Context for Claude Code. Read this before doing anything in this repo.

## What this is

A bilingual (EN/ES), offline-first, installable web app that presents a climbing technique
reference on a phone. It is used at the gym, mid-session, one-handed, sometimes on bad wifi.
Every design decision follows from that.

The audience is every indoor climber, from a first session to elite and competition level, on
boulder and rope. **Content is written neutrally**: it describes moves, risks and practice, never
who the reader is ("not a beginner move", "nothing you need yet", fixed grades like V1–V3).
Personalisation comes only from the climber profile (below), applied by the app at render time.

## Repo layout

```
content/              authoritative source content — markdown, human-edited
  manifest.json       file order, titles, part/section numbers, type, status
  00-foundations.md   prose      §1–6
  10-techniques.md    techniques §7–12   (81 entries)
  20-drills.md        drills     §13
  30-session.md       prose      §14–15
  40-warmup.md        prose      §16      STUB
  50-references.md    references §17      STUB
scripts/
  parse-guide.ts      content/*.md → src/data/*.json
src/
  data/               GENERATED — never hand-edit
  i18n/ui.ts          UI strings, en + es
```

## Content rules

1. **`content/` is the single source of truth.** Everything the app displays originates there.
2. **Never invent, expand, summarise, or "improve" climbing content.** If something is missing,
   ambiguous, or looks wrong, ask instead of filling the gap. A plausible-sounding invented
   technique description is worse than no entry.
3. **`src/data/` is generated.** Fix content bugs in `content/`, then re-run `npm run parse`.
   Never patch the JSON directly.
4. **IDs are stable and globally unique.** They are React keys, deep-link anchors, and
   translation keys. Renaming an id is a breaking change; changing display text is not.
5. **Files with `"status": "stub"` in the manifest are excluded from the build** until the
   status is changed to `complete`. Do not render placeholder text to users.
6. **References store links and one-line original notes only.** Never paste chapters, article
   bodies, or transcripts into this repo — copyright, and it bloats an offline bundle.

## Content formats

Technique entry (in `type: techniques` files):

```
#### Back step
- id: `back-step`
- level: `beginner`
- caution: true             (optional)
- nonstandard: true        (optional)
- what: one-sentence definition
- how: how to execute it
- best: what it is for, plus any risk note
```

`level` is exactly one of `beginner | intermediate | advanced | elite` — the band at which the
move typically becomes useful. `caution: true` marks meaningful injury risk; it is independent of
level and drives the injury warnings.

Level-conditional prose: wrap lines in a fence to show them only to climbers in a band. Ranges are
`beginner`, `intermediate+` or `beginner-intermediate`. Fences are validated in EN and ES, cannot
nest, and without a profile every block is shown with its band label.

```
:::level beginner
- **Skip for a while:** hangboarding, campus board…
:::
```

Grades in content are relative to the climber's limit ("well below your limit", "one grade below
your limit"), never absolute V/Font/YDS values.

Drill (in `type: drills` files), as a list item under a `####` category heading:

```
- **Silent feet** — climb an easy problem with zero foot noise.
```

Reference (in `type: references` files): see the format block in `50-references.md`.

Prose files are free-form markdown. `§n` cross-references must resolve to in-app links.

The parser must **fail loudly** on any entry that does not match, on a duplicate id, and on an
unknown level value. Silent skipping hides content loss.

## Translation

- `content/` is authored in English. Spanish is generated at build time into a parallel JSON
  with identical ids. No runtime translation, no API calls.
- **Technique names stay in English in both languages.** Gyms in Spanish-speaking countries use
  backstep, gaston, heel hook, drop knee, dyno, mantle, lock off. Translating them makes the app
  less useful.
- In ES mode, show a smaller Spanish gloss under the English name *only* where a genuinely common
  term exists (Heel hook / *gancho de talón*). No common term, no gloss. Do not invent one.
- Everything else translates fully: prose, `what`, `how`, `best`, drill names and descriptions,
  all UI. Neutral Latin American Spanish, informal "tú".
- Injury warnings and the medical disclaimer keep their full force in translation. Never soften.
- Tag labels in ES: `core` → Base, `later` → Después, `advanced` → Avanzado, `caution` → Precaución.

## Code conventions

- Vite + React + TypeScript. Plain CSS with custom properties. No CSS framework, no component
  library, no state management library.
- All colour, spacing, radius and timing values come from CSS custom properties. No hardcoded
  colours in components.
- No runtime network calls except map tiles in the Gyms tab (see below). Fonts are self-hosted
  and subset to Latin.
- `localStorage` keys are namespaced `cg.*` (`cg.lang`, `cg.theme`, `cg.favorites`, `cg.log`,
  `cg.notes`, `cg.profile`, `cg.onboardingSkipped`, `cg.levelUpDismissed`, `cg.circuits`,
  `cg.levelColors`).

## Design language

- Monochrome UI: chalk on basalt (dark), ink on concrete (light). Colour only carries meaning —
  the four level "circuit tapes" (`--lvl-*`: green, blue, red, black) and hazard yellow for
  injury risk (`--hazard`, striped like safety tape).
- One family, Archivo variable (self-hosted Latin subset, `src/styles/fonts.css`): condensed
  (`--stretch-display` / `--stretch-title`) for names and headings, normal width for body.
  Labels are sentence case — no tracked-out caps, no monospace.
- Levels render as `.tape` tags (fishtail-cut tape); the progression renders as a route line
  with numbered nodes. Lists are grouped surfaces with hairline rows; sheets rise from the bottom.
- Icons are inline SVG in `src/components/Icon.tsx` (24px grid, `currentColor`).

## Gym directory, map and boards

- `content/gyms-cl.json` is the hand-maintained directory of Chilean gyms (exported from the
  owner's Google Maps list "BOULDER"). Ids are stable; saved gyms reference them via
  `directoryId`. Add gyms by editing the file — `region` must be a key of `regions`.
- The Gyms tab map is Leaflet over CARTO basemaps (OpenStreetMap data; `dark_all` / `light_all`
  to match the theme) — the app's one deliberate runtime network use. The service worker caches
  viewed tiles (`map-tiles`, CacheFirst) so known areas work offline, and Chile's coastline
  (`src/assets/chile-outline.json`, Natural Earth 1:50m via world-atlas) is drawn under the tiles
  as an offline fallback. Attribution to OSM and CARTO must stay visible. "Open in Google Maps"
  is a plain outbound link. Geolocation ("Near me") stays in memory and is never stored.
- `src/domain/boards.ts` lists training boards (Kilter, Tension 1/2, MoonBoard sets, Grasshopper,
  Decoy, Quantum, Lattice, spray wall) with their angle ranges; board sessions store
  `board: { id, name, angle }` and grade in the board's own scale.

## Climber profile, levels and grades

- The profile lives only on the device (`cg.profile`): disciplines, grade scale per discipline,
  hardest reliable grade, years climbing, sessions/week, optional weight/height, current
  pain/injury, optional manual level. No account, no sync.
- `src/domain/levels.ts` derives the band from the hardest grade, capped at `intermediate` during
  the first year (connective tissue lags muscle). Bands: beginner ≤ V2 / 5.10a, intermediate
  V3–V5 / 5.10b–5.11d, advanced V6–V8 / 5.12a–5.13a, elite ≥ V9 / 5.13b. Changing them is a
  product decision — update the onboarding `bandsNote` strings too.
- `src/domain/grades.ts` holds the boulder (V, Font) and rope (YDS, French, UIAA, Ewbank) ladders.
  Grades are stored as ladder indices so every scale converts through the same row. Source:
  Wikipedia "Grade (bouldering)" / "Grade (climbing)" comparison tables. Equivalences are
  indicative.
- Gyms (`cg.circuits`, `src/domain/circuits.ts`): the climber's saved gyms, one marked home,
  each with its boulder scale and colour circuits (colour → inclusive ladder-index range).
  Every gym uses different colours, so circuits are always user-defined; the 7-colour template
  is only a starting point. Set up in onboarding ("home gym" step) or Settings.
- Level tag colours are user-overridable (`cg.levelColors`), applied as inline `--lvl-*` vars.
- Session log entries store `discipline`, `gradeIndex`, `gradeScale`, plus `gym` (name, saved id,
  home flag) and a snapshot of the `circuit` picked, so editing a circuit later never rewrites
  history; legacy free-text entries are
  parsed best-effort. When recent entries beat the profile's grade, the app offers to update it.
- Prefer a few well-named components over deep hierarchies. This is a small app.

## Version marker

`src/version.ts` exports `APP_VERSION`, a `YYYY-MM-DD.N` string rendered small and muted at the
bottom of the Session tab (below the session log) so the user can confirm which build is running
on their phone. **Bump it in every commit that changes app behavior or content** — same date,
next `N` for a same-day change, new date otherwise. Skip it only for things that can't change
what's rendered (e.g. this file, CI config).

## Adding content later

1. Add or edit a file in `content/`.
2. Register it in `content/manifest.json` with `order`, `part`, `type`, `sections`, `status`.
3. `npm run parse`.
4. Translation regenerates for changed ids only.

Adding content must never require touching the parser or the components. If it does, the format
is wrong — say so rather than special-casing it.

## Non-goals

No accounts, no sync, no backend, no analytics, no notifications, no images or video, no AI
features, no streaks, badges, or engagement mechanics.

## Definition of done

- All 81 technique entries and all 6 drill categories render in both languages.
- No content string assumes the reader's level; level-specific advice lives in `:::level` blocks.
- Language and theme toggles persist and apply before first paint.
- Works fully offline after first load.
- `npm run parse` regenerates data from `content/` with no manual steps.
- No console errors or warnings.
