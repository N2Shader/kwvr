# KWVR Timetable

## Project context
- Timetable web app for the **Keighley & Worth Valley Railway** (KWVR).
- Structure is **airline-style**: a search box → a result table → links. The result table differs from an airline's (train services, stations, heritage-railway specifics) — follow the Figma design, not airline conventions, where they diverge.
- Data comes from a **single external API**. The API itself is **out of scope** — we only consume it.
- Must be **fast on desktop and mobile**.
- **Accessibility first** — it is a requirement, not an afterthought.
- **Unit tests only** (no e2e).
- Design lives in **Figma**: https://www.figma.com/design/6OXQWKSVSEQqa4RcylfEZv (desktop + mobile, each with an empty state).
- Links (nav, legal, social, contact) mirror the official site https://kwvr.co.uk.

## Brand (KWVR Brand Guidelines)
- Palette: Burgundy `#a32638`, Cream `#f4f4e9`, Grey `#423d33`, White `#ffffff`, plus the pastel `#f3e4e6` (burgundy tint). Defined once in `app/assets/css/tokens.css`.
- Text is grey or white. Burgundy is the accent (headers, buttons, stand-out text). Cream is for backgrounds only.
- Exception: the main nav links are black (`--colour-text-nav`) with no underline, per Figma.
- Pastel shades tell timetables apart (e.g. the tint marks alert rows).
- Font: Gill Sans, from a local font stack only (no webfont files). SemiBold for headers, Regular for body.
- Left-align long text; centre only short snippets.
- **No icons yet** — they're still being confirmed. Use text labels (e.g. "Service alert", social links as words) until the icon set is approved.

## Stack
- Nuxt 4 (`app/` directory layout), Vue 3, TypeScript (strict)
- pnpm (`packageManager` pinned in `package.json`) — never use npm/yarn
- VueUse (`@vueuse/nuxt`, composables auto-imported)
- GSAP (client-only plugin, `useNuxtApp().$gsap`)
- Plain CSS with custom properties — no Tailwind, no preprocessors
- ESLint via `@nuxt/eslint` with stylistic formatting (no Prettier) + `eslint-plugin-vuejs-accessibility`
- Vitest + `@nuxt/test-utils` + happy-dom + `vitest-axe`
- TypeScript is pinned to `~6.0` because typescript-eslint doesn't support TS 7 yet
- `nuxt.config.ts` has a `nitro.externals.inline` workaround for a Nuxt 4.6.0 Windows SSR bug ([nuxt#36467](https://github.com/nuxt/nuxt/issues/36467)) — remove once a Nitro release includes nitrojs/nitro#4732

## Folder conventions
```
app/
  app.vue              # skip link + <SiteHeader /> + <main id="main"> + <SiteFooter />
  app.config.ts        # site link data (nav, donate, legal, social, contact, organisation) — read via useAppConfig()
  assets/css/
    tokens.css         # design tokens: brand layer → semantic layer (components use semantic only)
    main.css           # reset, focus styles, .container, .button-primary, .surface-inverse, reduced-motion guard
  components/          # PascalCase .vue files, auto-imported
    site/              # SiteHeader, SiteNav, SiteFooter
    timetable/         # TimetableSearchHero, TimetableSearchForm, TimetableResults, TimetableResultRow, TimetableEmptyState
    station/           # StationInfo, StationAttractions, StationAttractionCard
  composables/         # useXxx composables, auto-imported
  data/                # TEMPORARY static placeholder data — replace with an API composable
  pages/               # file-based routes
  plugins/             # gsap.client.ts
  types/               # shared TypeScript types (import with `import type … from '~/types/…'`)
  utils/               # pure helpers (formatting, parsing API data)
public/images/         # logo.svg, hero-train.jpg, station-card.jpg (exported from Figma)
test/
  setup.ts             # vitest-axe matchers
  fixtures/            # shared test data
  unit/**/*.spec.ts    # unit tests
```
- Component folders don't change names: Nuxt drops the repeated folder prefix (`site/SiteHeader.vue` → `<SiteHeader>`).
- Dark bands (burgundy/grey) get `.surface-inverse` so the focus ring switches to white.

## Scripts
| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server at http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm lint` / `pnpm lint:fix` | ESLint (includes formatting) |
| `pnpm typecheck` | `nuxt typecheck` (vue-tsc) |
| `pnpm test` / `pnpm test:watch` | Vitest unit tests |

## Coding rules
- Arrow functions everywhere (`func-style: expression`, `prefer-arrow-callback`).
- PascalCase for components (files and template usage).
- Descriptive names — no generic `getData`/`getUser`; prefer `getServicesByStation`, `formatDepartureTime`.
- Split any file over 250 lines (`max-lines` warns).
- No `any`; use `import type` for type-only imports.
- Style with CSS custom properties from `tokens.css` — never hard-code colours in components.
- No `console.log` (only `console.warn` / `console.error`).

## Accessibility rules (WCAG 2.2 AA)
- Result tables use semantic markup: `<table>`, `<caption>`, `<thead>`/`<tbody>`, `<th scope="col">` / `<th scope="row">`. No div-tables.
- Every form control has a visible `<label>`; group related inputs with `<fieldset>`/`<legend>`.
- Full keyboard operability; logical tab order; never remove focus outlines (use `:focus-visible`).
- Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components. Never convey meaning by colour alone.
- Announce async results (e.g. search results count) via an `aria-live="polite"` region.
- Touch targets ≥ 24×24 CSS px (WCAG 2.2 2.5.8).
- Use `.visually-hidden` for screen-reader-only text.
- `lang="en-GB"` is set globally; times/dates use `<time datetime="…">`.

## Motion
- All GSAP animations must honour `prefers-reduced-motion`: wrap them in `$gsap.matchMedia()` (or check VueUse's `usePreferredReducedMotion()`), and provide a no-motion path.
- Animate transforms/opacity only; never block content behind an animation.
- `main.css` also has a global CSS reduced-motion guard.

## Testing
- Unit tests only, in `test/unit/**/*.spec.ts`.
- Use `mountSuspended` from `@nuxt/test-utils/runtime` for components needing Nuxt context.
- Add an axe assertion to component specs: `expect(await axe(wrapper.html())).toHaveNoViolations()`.
- Mock the external API — tests never hit the network.
