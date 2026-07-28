# CLAUDE.md

Context for Claude Code. Read this before doing anything in this repo.

## What this is

A bilingual (EN/ES), offline-first, installable web app that presents a climbing technique
reference on a phone. It is used at the gym, mid-session, one-handed, sometimes on bad wifi.
Every design decision follows from that.

The audience is indoor climbers generally — beginner to early intermediate. It is not
personalised to any individual, and content should never assume a specific person's injuries,
gym, or goals.

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
- tag: `core`
- nonstandard: true        (optional)
- what: one-sentence definition
- how: how to execute it
- best: what it is for, plus any risk note
```

`tag` is exactly one of `core | later | advanced | caution`.

Drill (in `type: drills` files), as a list item under a `####` category heading:

```
- **Silent feet** — climb an easy problem with zero foot noise.
```

Reference (in `type: references` files): see the format block in `50-references.md`.

Prose files are free-form markdown. `§n` cross-references must resolve to in-app links.

The parser must **fail loudly** on any entry that does not match, on a duplicate id, and on an
unknown tag value. Silent skipping hides content loss.

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
- No runtime network calls. Fonts are self-hosted and subset to Latin.
- `localStorage` keys are namespaced `cg.*` (`cg.lang`, `cg.theme`, `cg.favorites`, `cg.log`).
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
features, no streaks, badges, or engagement mechanics. This is a reference tool.

## Definition of done

- All 81 technique entries and all 6 drill categories render in both languages.
- Language and theme toggles persist and apply before first paint.
- Works fully offline after first load.
- `npm run parse` regenerates data from `content/` with no manual steps.
- No console errors or warnings.
