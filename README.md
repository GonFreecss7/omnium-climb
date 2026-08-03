# Climb Guide

A bilingual (EN/ES), offline-first, installable web app that presents an indoor
climbing technique reference and drill bank on a phone. Built with Vite, React,
and TypeScript — no backend, no analytics, no runtime network calls.

## Running it

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. The dev server has hot reload; the language
and theme toggles, search, and PWA behavior all work the same as in production
except the service worker (Vite's dev server doesn't register one — test
offline behavior against a production build, see below).

Other scripts:

```bash
npm run build      # parse content, typecheck, and build to dist/
npm run preview    # serve the built dist/ locally, for testing PWA/offline behavior
npm run parse      # regenerate src/data/guide.en.json and guide.es.json from content/
npm run typecheck  # tsc --noEmit
npm test           # parser unit tests (scripts/parse-guide.test.ts)
npm run icons      # regenerate public/ PWA icons from src/assets/icon-source.svg
```

## Adding or editing content

`content/` is the single source of truth for everything the app displays.
`src/data/*.json` is **generated** — never hand-edit it.

1. Edit the relevant file in `content/` (see `CLAUDE.md` for the exact format
   per file type: `prose`, `techniques`, `drills`, `references`).
2. If you added a new file, register it in `content/manifest.json` with its
   `order`, `part`, `type`, `sections`, and `status`.
3. If the content is user-facing text, add its Spanish translation to
   `content/i18n/es.json`, keyed by the same `id`. The parser fails the build
   loudly if any id is missing a translation, or if the dictionary has a
   translation for an id that no longer exists in `content/`.
4. Run `npm run parse`. It fails loudly (non-zero exit, naming the file and
   heading) on a malformed entry, a duplicate id, an unknown tag, unclaimed
   markdown content, or a missing/stale translation — nothing is ever silently
   dropped.
5. `status: "stub"` files are excluded from the build entirely; flip to
   `"complete"` when the content is ready (`content/40-warmup.md` and
   `content/50-references.md` are currently stubs).

Adding a new technique, drill, or prose section never requires touching the
parser or a component — if it does, the content doesn't match the documented
format.

## Deploying to GitHub Pages

This is already set up and live: **https://gonfreecss7.github.io/omnium-climb/**

`.github/workflows/deploy.yml` builds and deploys automatically on every push
to `main` (or manually via the Actions tab → "Deploy to GitHub Pages" → "Run
workflow"). Pages itself is configured (via the repo's Settings → Pages) to
deploy from GitHub Actions rather than a branch — that's a one-time repo
setting, already done, not something the workflow file controls.

`vite.config.ts` hardcodes `base: "/omnium-climb/"` to match this repo's name,
since GitHub Pages project sites are served from a `/<repo>/` subpath. If you
fork this to a different repo name, a user/org site (`<user>.github.io`), or
a custom domain, update `BASE` in `vite.config.ts` accordingly (`"/"` for the
latter two) — it feeds both Vite's `base` and the PWA manifest's `start_url`/
`scope`/icon paths, so it's the only place that needs to change.

To deploy manually instead (no CI): build with `npm run build`, then push the
contents of `dist/` to a `gh-pages` branch (e.g. `npx gh-pages -d dist`) and
point Settings → Pages at that branch instead of Actions.

## Adding to the home screen

**iOS (Safari):** open the deployed URL, tap the Share icon, then "Add to
Home Screen". The app opens in standalone mode (no browser chrome) and works
offline after the first visit.

**Android (Chrome):** open the deployed URL, tap the ⋮ menu, then "Add to
Home screen" (or "Install app" if Chrome shows an install banner
automatically). Same offline behavior applies.

Both rely on the web app manifest (`vite-plugin-pwa`, configured in
`vite.config.ts`) and the icons in `public/icons/`.

## New features

Eight features added on top of the original build. All are local-only — no
new network calls, accounts, or sync.

- **Cross-filter (technique ↔ drill).** Expand any technique card and, if
  drills train it, a "Related drills" chip list appears (and the mirror
  image on drill rows: "Related techniques"). Tap a chip to jump straight to
  that entry's card, already expanded, on the other tab. The relation is
  computed by `npm run parse` from a technique-category → drill-category
  mapping (`CATEGORY_RELATIONS` in `scripts/parse-guide.ts`) and written into
  `relatedDrills` / `relatedTechniques` on each JSON entry — never computed
  at runtime, and the build fails loudly if a category is renamed and the
  mapping goes stale.
- **Random technique of the day.** A "Random technique" button at the top of
  the Techniques tab, visually identical to the existing Random Drill card.
- **Session history export (JSON/CSV).** Two pills (JSON / CSV) next to the
  session log's "Export" button pick the format. CSV includes a header row
  and a UTF-8 BOM so accented Spanish text opens correctly in Excel. The
  button only appears once at least one session is logged.
- **Warm-up generator.** A "Warm-up generator" button on the Drills tab opens
  a modal: pick drill categories (defaults to Footwork / Body-position /
  Movement — see interpretation notes below), generate one random drill per
  category, and reroll any single drill without resetting the rest.
- **Shareable session checklist.** A "Session checklist" button on the
  Session tab opens a picker over the full technique and drill lists;
  selected items generate a clean, high-contrast checklist view with a
  dedicated print stylesheet (strips the header, tab bar, and all buttons)
  and a Share button (Web Share API where available, clipboard copy
  otherwise).
- **Combined-filter search.** Techniques already combined free-text + tag +
  category filters; Drills now has the same free-text + category filtering
  (drills have no `tag` field, so no tag chips there). Both views show an
  explicit "Active filters" strip of removable chips whenever any filter is
  on, and "Clear filters" restores exactly the default view.
- **Progressions view.** A fifth tab, "Progression", renders an ordered
  sequence of stages (`content/25-progressions.md`, parsed like everything
  else) grouping existing techniques and drills into a suggested learning
  order. Every chip links to the real technique/drill card — no content is
  duplicated.
- **Personal notes per technique.** Inside an expanded technique card, a
  collapsed "Personal note" toggle reveals a plain-text field (2000-char
  cap, counter, saved/unsaved indicator). Autosaves on a short debounce and
  on blur; clearing the text removes the stored entry rather than keeping an
  empty string. Stored in `localStorage` under `cg.notes`, keyed by
  technique id.

## Interpretations and decisions made while building this

- **Section-number registry.** Beyond parsing `content/`, the build assigns
  every numbered section (prose §1–6/14–15, technique categories §7–12, the
  drill bank §13) into one `sectionIndex`, and fails loudly if two files ever
  claim the same number. This is what makes `§13` in `30-session.md` a real,
  clickable in-app link to the Drills tab rather than inert text.
- **Spanish translation pipeline.** `content/` is authored in English only, so
  the Spanish text lives in a hand-authored dictionary,
  `content/i18n/es.json`, keyed by the same ids the parser already produces.
  `npm run parse` merges the two into `guide.es.json`, sharing structure
  (tags, ids, ordering) with the English file and failing the build if the
  dictionary and content/ ever drift out of sync in either direction.
- **Spanish glosses.** Per the brief's own examples, I used `gancho de talón`
  (heel hook), `adherencia` (smear), and `invertida` (undercling) directly.
  I additionally added `gancho de puntera` for toe hook, by direct analogy
  with heel hook. I deliberately did **not** add glosses for other
  technique names (e.g. lock-off, pinch, flag) where I wasn't confident a
  single term is genuinely standard across Spanish-speaking gyms, rather than
  invent one — worth a native-speaker pass if you want more coverage.
  Fixing this only requires editing `content/i18n/es.json`, not any code.
- **Random drill** picks from the entire drill bank (all 43), not filtered by
  category — the brief didn't scope it further.
- **§n navigation** switches the relevant tab and scrolls the target section
  into view; there's no URL routing (no router library — this is a 4-tab app
  with no deep-linking requirement stated, so I kept the dependency list to
  what was actually needed).
- **Fonts**: self-hosted via `@fontsource`'s Latin-only subsets (`latin-*.css`
  imports in `src/main.tsx`), rather than hand-downloading and subsetting —
  same result (offline, Latin-only, no external requests), less manual work.
- **PWA icon**: no design asset was provided, so I made a simple abstract
  mark (three holds on a diagonal line) in the app's own accent color —
  `src/assets/icon-source.svg`, rasterized by `npm run icons`. Happy to swap
  it for a real mark.
- **Favorites**: a star toggle on every technique card and drill row,
  `localStorage` key `cg.favorites` (a flat array of ids — technique and
  drill ids never collide, per the global-uniqueness rule in `CLAUDE.md`),
  surfaced as its own filter chip in both the Techniques and Drills views.
- **Session log**: a form at the bottom of the Session view — date, drill
  used (a `<select>` populated from the current drill bank), hardest problem
  climbed cleanly, niggles vs. last session (better/same/worse), and one
  optional note. Entries persist to `localStorage` under `cg.log`, newest
  first, with an "Export as JSON" button that downloads the full log as a
  file (client-side `Blob` + object URL — no network call). I stored the
  drill as its display name rather than an id, so a log entry stays readable
  even if `content/` changes later.
- **Progress panel**: a quiet, text-only stats summary (sessions logged,
  highest grade climbed cleanly, most-used drill, and the last five sessions'
  grades and niggles as plain arrow-joined sequences) shown above the log
  form once at least one entry exists. Deliberately no charts, streaks,
  badges, or scores — `CLAUDE.md`/`PROMPT.md` both call out "no streaks,
  badges, or engagement mechanics" as a non-goal, so this only reflects data
  you already logged, nothing gamified. Grade parsing (`src/utils/
  sessionStats.ts`) reads the leading `V<n>` out of the free-text "hardest"
  field and simply ignores anything it can't parse.

## Interpretation calls made while adding the eight new features

- **Cross-filter relation.** The prompt says "derive from shared tags/
  category" but techniques and drills don't share a tag or category
  namespace directly, so I hand-authored a technique-category → drill-
  category mapping (6 technique categories → the 6 drill categories, several
  many-to-one) based on actual content overlap — e.g. "Centre-of-Gravity
  Techniques" maps to "Body-position drills" because drills like *Backstep
  everything* and *Flag hunt* literally name-check the techniques in that
  category. It's validated against real parsed category ids every build, so
  a renamed category fails loudly instead of silently going stale.
- **Warm-up default category subset.** All 6 drill categories can be picked,
  but the default selection is the 3 that are physical movement drills
  (Footwork / Body-position / Movement) rather than all 6 — "Reading &
  mental drills" and "Partner games" don't fit a solo pre-climb warm-up.
- **Progressions content.** `content/25-progressions.md` is new authored
  content: 6 stages, each grouping existing technique/drill ids with a
  short organisational summary I wrote (not climbing instruction — the
  instructional text itself still lives only in the technique/drill
  entries). The sequence follows the guide's own stated priorities
  (footwork and body position first, grip fundamentals before advanced
  holds, static movement before dynamic/power work, comp-specialty moves
  last) rather than inventing a new curriculum.
- **Progressions surfaced as a 5th tab**, not a toggle inside Techniques,
  since a stage mixes techniques *and* drills and the flat category view
  can't represent that. `TabBar`'s items are `flex: 1` with no fixed count
  baked in, so a 5th tab doesn't touch the safe-area/tab-rendering fixes
  from earlier work.
- **Session checklist selection UI** is a plain checkbox list grouped by
  existing categories (all 81 techniques, all 43 drills) rather than a
  search-filtered picker — the prompt didn't ask for filtering here, and the
  existing category grouping already keeps it navigable.
- **Notes character counter** is always visible (not just "near the limit")
  — showing it constantly is simpler and no worse for a 2000-char field than
  showing/hiding it at a threshold; it does switch to the caution color in
  the last 200 characters.
- **CSV export** includes an `id` column alongside the session-log fields,
  for round-trip fidelity with the JSON export; both share the same
  underlying entries, so the two formats can't drift out of sync.

## Verified against the acceptance criteria

All of `PROMPT.md`'s acceptance checklist passes, including the one that
needs a real tool rather than reasoning about the code: a Lighthouse run
against the production build (`npm run build && npm run preview`), mobile
form factor with default throttling —

| Category | Score |
|---|---|
| Performance | 97 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

(Lighthouse's CLI no longer ships a standalone "PWA" category as of v12+;
installability and offline support were instead verified directly — service
worker registers and reaches `activated`, and a full page reload with the
network killed still renders the Guide view from cache.)

Two accessibility findings and one SEO finding came out of that first run and
are now fixed: a heading level was skipped (`h2` → `h4` for the bold
lead-in lines inside prose, e.g. "**What actually prevents them**" — now
`h3`), the header's language/theme toggle buttons had an `aria-label` that
didn't include their own visible text ("EN", "Dark") which trips the
WCAG 2.5.3 Label-in-Name check, and there was no `robots.txt` (added,
`Allow: /`).
