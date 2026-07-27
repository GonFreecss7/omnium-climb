# Claude Code — Build Prompt

Copy everything below the line into Claude Code, run from the root of the scaffolded repo (the one containing `CLAUDE.md` and `content/`).

---

## Task

Build a mobile-first, installable web app from the markdown in `content/`. It is a reference tool for indoor climbers, used on a phone at the gym, so it must work fully offline and load instantly.

Read `CLAUDE.md` and every file in `content/` first, in full, before writing any code. `content/` is the single source of truth for all content. Do not invent, expand, summarise, or "improve" any climbing content — if something seems missing or contradictory, ask me instead of filling the gap.

## Stack

- Vite + React + TypeScript
- Plain CSS with custom properties (no Tailwind, no component library)
- No backend, no analytics, no external API calls at runtime
- Static build, deployable to GitHub Pages or Netlify
- PWA: web app manifest + service worker, all content and fonts cached for offline use

Keep the dependency list minimal. If a dependency is not obviously necessary, don't add it.

## Content pipeline

1. Write a build-time script (`scripts/parse-guide.ts`, run via `npm run parse`) that reads
   `content/manifest.json`, then parses every listed file **in `order`** into typed JSON at
   `src/data/guide.en.json`.
2. File `type` determines the parser branch:
   - `prose` — kept as markdown strings, rendered with a small markdown renderer.
   - `techniques` — `####` heading followed by the strict fields `id`, `tag`, optional
     `nonstandard`, `what`, `how`, `best`.
   - `drills` — `####` category heading, then list items in the form `**Name** — description`.
   - `references` — `####` heading followed by `id`, `type`, `author`, optional `url`, `note`.
3. Files with `"status": "stub"` in the manifest are **excluded from the build**. Never render
   placeholder or TODO text to users. Log which files were skipped.
4. The parser must **fail loudly** — non-zero exit, clear message naming the file and heading — on:
   a malformed entry, a duplicate `id` anywhere across all files, an unknown `tag` value, or a
   file listed in the manifest that does not exist. Never silently skip.
5. `id` values are stable and are used as React keys, deep-link anchors, and translation keys.
6. Re-running the parser is idempotent and requires no manual edits to the generated JSON.
7. Adding a new content file must require only: create the file, register it in the manifest,
   re-run parse. If it requires touching the parser or components, the format is wrong — tell me.
8. Section numbers come from the manifest, not from hardcoded values in components. `§n`
   cross-references in prose resolve to in-app links.

## Translation

Produce `src/data/guide.es.json` with the same shape and the same `id` values, translated to Spanish. All UI strings live in a separate `src/i18n/ui.ts` with `en` and `es` keys.

Rules for the Spanish translation — these matter:

- **Keep technique names in English as the primary label in both languages.** Most Spanish-speaking gyms use the English terms (backstep, gaston, heel hook, drop knee, dyno, mantle, lock off). Translating them would make the app less useful, not more.
- Where a genuinely common Spanish term exists, show it as a smaller secondary gloss under the English name in ES mode only — e.g. `Heel hook` / *gancho de talón*, `Smear` / *adherencia*, `Undercling` / *invertida*. If no common Spanish term exists, show no gloss. Don't force one.
- Translate everything else fully and naturally: `what`, `how`, `best`, all prose, all UI, all drill names and descriptions.
- Use neutral Latin American Spanish, informal "tú".
- The medical disclaimer in §2 and the injury warnings on `caution`-tagged entries must appear in both languages with the same force. Do not soften them in translation. The disclaimer must be visible in the app, not buried.
- Tag names in ES: `core` → Base, `later` → Después, `advanced` → Avanzado, `caution` → Precaución.

## Features — required

1. **Language toggle** (EN / ES). Instant switch, no reload, persisted to `localStorage` under `cg.lang`. First load defaults from `navigator.language`, falling back to English.
2. **Theme toggle** (dark / light). Persisted under `cg.theme`. First load defaults from `prefers-color-scheme`. No flash of wrong theme on load — set the theme class before first paint via an inline script in `index.html`.
3. **Techniques view** — the 81 entries across the 6 categories. Collapsed cards show name, tag chip, and the `what` line; expanding reveals `how` and `best`. Non-standard names show an asterisk with an explanation on tap.
4. **Search** — instant, fuzzy-tolerant, matches technique names and body text in the active language. Sticky at the top of the techniques view.
5. **Filter chips** — by tag (Core / Later / Advanced / Caution) and by category. Multi-select, clearable.
6. **Drills view** — the drill bank by category, plus a prominent "Random drill" button that picks one drill for today's session.
7. **Guide view** — the Part I and Part III prose sections, rendered readably with working `§` cross-references as in-app links.
8. **Session view** — the session structure table plus the tracking/progress checklist from §15.

Navigation: fixed bottom tab bar with four tabs (Guide / Techniques / Drills / Session). Language and theme toggles live in a compact header, always reachable.

## Features — only if the above is complete and working

- Favourites: star a technique or drill, `localStorage` key `cg.favorites`, surfaced as a filter.
- Session log: date, drill used, hardest clean problem, elbow better/same/worse, one note. `localStorage` key `cg.log`. Export as JSON.

Do not start these until everything in "required" is done and verified.

## Design direction

Minimalistic-futuristic. Restrained, high-contrast, precise. Think instrument panel, not neon cyberpunk — one accent colour used sparingly, hairline borders, generous negative space. No gradients on surfaces, no glow effects other than a single subtle accent on the active tab, no decorative icons.

Define these as CSS custom properties and use them everywhere. No hardcoded colours in components.

**Dark (default)**
```
--bg: #07090C;  --surface: #0E1318;  --surface-2: #141B22;
--border: rgba(255,255,255,0.07);  --border-strong: rgba(255,255,255,0.14);
--text: #E6EDF3;  --text-muted: #8A97A6;
--accent: #22D3EE;  --accent-dim: rgba(34,211,238,0.12);
--core: #34D399;  --later: #94A3B8;  --advanced: #FBBF24;  --caution: #F87171;
```

**Light**
```
--bg: #FAFBFC;  --surface: #FFFFFF;  --surface-2: #F2F5F7;
--border: rgba(0,0,0,0.08);  --border-strong: rgba(0,0,0,0.16);
--text: #0E1318;  --text-muted: #5A6672;
--accent: #0891B2;  --accent-dim: rgba(8,145,178,0.10);
--core: #059669;  --later: #64748B;  --advanced: #B45309;  --caution: #DC2626;
```

**Typography**
- UI and headings: Space Grotesk, fallback system sans. Tight letter-spacing (-0.02em) on large headings.
- Body: Inter, fallback system sans. 16px base, 1.55 line-height.
- Tags, numbers, category labels: JetBrains Mono, uppercase, 11px, letter-spacing 0.08em.
- Self-host the fonts so the app works offline. Subset to Latin.

**Detail rules**
- Corner radius: 10px on cards, 999px on chips. Consistent everywhere.
- Borders are 1px hairlines, never shadows, for separation. One exception: the bottom tab bar may use a top hairline plus a blurred translucent background.
- Transitions: 140ms `cubic-bezier(0.2, 0.8, 0.2, 1)`. Animate opacity and transform only.
- Tag chips: coloured 1px border and coloured text on a transparent background. Never solid coloured pills.
- Respect `prefers-reduced-motion`.

## Mobile requirements

- Design at 380px width first. Test at 360px and 430px.
- All tap targets ≥ 44×44px.
- Respect safe-area insets (`env(safe-area-inset-bottom)`) so the tab bar clears the iPhone home indicator.
- No horizontal scrolling anywhere, including the session table — make it stack on narrow screens.
- Search input must not trigger iOS zoom (font-size ≥ 16px).

## Accessibility

- Tag meaning must never be conveyed by colour alone — always include the text label.
- Every toggle and icon button gets an `aria-label` in the active language.
- Both themes must pass WCAG AA for body text.
- Expandable cards use real `<button>` elements with `aria-expanded`.

## Acceptance criteria

Verify each of these before telling me you're done:

- [ ] All 81 technique entries appear, with correct tag, in both languages.
- [ ] All 6 technique categories and all 6 drill categories are present.
- [ ] The 11 non-standard names are flagged and the flag is explained.
- [ ] Language toggle switches every visible string, including tag labels and the tab bar.
- [ ] Theme toggle works with no flash on reload, and the choice survives a restart.
- [ ] Search finds "heel" → Heel hook, and "talón" → Heel hook when in ES.
- [ ] App loads and works fully with the network disabled after first visit.
- [ ] Lighthouse: PWA installable, performance ≥ 90 on mobile.
- [ ] No console errors or warnings.
- [ ] `npm run build` succeeds clean; `npm run parse` regenerates data from `content/`.
- [ ] Stub files are excluded and no placeholder text is reachable in the UI.
- [ ] The parser exits non-zero on a duplicate id, a malformed entry, and an unknown tag — test each.

## Deliverables

1. Working app.
2. `README.md` with: how to run, how to add or edit content in `content/` and rebuild, how to deploy to GitHub Pages, and how to add the app to the home screen on iOS and Android.
3. A one-paragraph summary of anything you had to interpret or decide that wasn't specified here.

## Non-goals

No accounts, no sync, no backend, no notifications, no video, no images, no AI features, no dark patterns around streaks or gamification. This is a reference tool, not an engagement product.
