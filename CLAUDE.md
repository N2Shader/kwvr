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
- Exception: form errors use a red outside the palette (`--colour-red` #c00000, via `--colour-text-error` / `--colour-border-error`), at 14px (`--font-size-xs`).
- Pastel shades tell timetables apart (e.g. the tint marks alert rows).
- Font: Gill Sans, from a local font stack only (no webfont files). SemiBold for headers, Regular for body.
- Left-align long text; centre only short snippets.
- **No icons yet** — they're still being confirmed. Use text labels (e.g. "Service alert") until the icon set is approved. Exceptions: built-in control affordances (the Select's chevron and ✓) and the footer social links, which use brand logos from Simple Icons (`@iconify-json/simple-icons`, CC0, bundled locally) with a visually hidden text name.
- Footer legal links have no underline (they sit in a labelled `<nav>`); they underline on hover like the main nav.

## Stack
- Nuxt 4 (`app/` directory layout), Vue 3, TypeScript (strict)
- pnpm (`packageManager` pinned in `package.json`) — never use npm/yarn
- VueUse (`@vueuse/nuxt`, composables auto-imported)
- GSAP (client-only plugin, `useNuxtApp().$gsap`)
- Plain CSS with custom properties — no preprocessors, no utility classes in our code
- Nuxt UI v4 (`@nuxt/ui`) for interactive components (`USelect`, `UButton`, …). Tailwind CSS v4 is installed only as Nuxt UI's styling engine. `ui.fonts` and `ui.colorMode` are off (local fonts only, no dark mode). Icons come from locally bundled sets only (`@iconify-json/lucide` for control icons, `@iconify-json/simple-icons` for social logos), with `icon.fallbackToApi: false`, so nothing is fetched from the Iconify API
- ESLint via `@nuxt/eslint` with stylistic formatting (no Prettier) + `eslint-plugin-vuejs-accessibility`
- Vitest + `@nuxt/test-utils` + happy-dom + `vitest-axe`
- `@nuxt/image` for responsive images: `useImage()` builds resized/cropped WebP URLs (ipx locally). Keep srcset widths at or below the original's width, and keep originals in WebP
- `@internationalized/date` (Nuxt UI's optional peer) for `UCalendar`/`UInputTime` values (`CalendarDate`, `Time`)
- TypeScript is pinned to `~6.0` because typescript-eslint doesn't support TS 7 yet
- `nuxt.config.ts` has a `nitro.externals.inline` workaround for a Nuxt 4.6.0 Windows SSR bug ([nuxt#36467](https://github.com/nuxt/nuxt/issues/36467)) — remove once a Nitro release includes nitrojs/nitro#4732

## Folder conventions
```
app/
  app.vue              # <UApp :toaster="null"> wrapping skip link + <SiteHeader /> + <main id="main"> + <SiteFooter />
  app.config.ts        # site link data (nav, donate, legal, social, contact, organisation) — read via useAppConfig()
  assets/css/
    tokens.css         # design tokens: brand → semantic (components use semantic only) → Nuxt UI bridge (--ui-* mapped to semantic)
    main.css           # @import tailwindcss → @nuxt/ui → tokens.css; reset in @layer base (after preflight);
                       # unlayered: focus styles, .container, .button-primary, .surface-inverse, reduced-motion guard
  components/          # PascalCase .vue files, auto-imported
    site/              # SiteHeader, SiteNav, SiteFooter
    timetable/         # TimetableSearchHero, TimetableSearchForm, TimetableOriginSelect, TimetableDepartureDatePicker, TimetableDepartureTimeField, TimetableSearchFieldError, TimetableResults, TimetableResultRow, TimetableFirstUseState, TimetableLoadingState, TimetableResultsState, TimetableNoResultsState, TimetableErrorState
    station/           # StationInfo, StationAttractions, StationAttractionCard, StationBento, StationBentoCard
  composables/         # useXxx composables, auto-imported
  data/                # placeholderTimetable.ts: TEMPORARY placeholder data — replace with an API composable;
                       # stationHighlights.ts: site content (station card copy + photos from kwvr.co.uk), stays
  pages/               # file-based routes
  plugins/             # gsap.client.ts
  types/               # shared TypeScript types (import with `import type … from '~/types/…'`)
  utils/               # pure helpers (formatting, parsing API data, departure prefill rules)
public/images/         # logo.svg, hero-train-45596.webp (hero original, 1536×512), station-card.jpg (exported from Figma),
                       # stations/<station-id>.webp (station card originals, 1280px wide, from kwvr.co.uk)
test/
  setup.ts             # vitest-axe matchers
  fixtures/            # shared test data
  unit/**/*.spec.ts    # unit tests
```
- Component folders don't change names: Nuxt drops the repeated folder prefix (`site/SiteHeader.vue` → `<SiteHeader>`).
- Dark bands (burgundy/grey) get `.surface-inverse` so the focus ring switches to white.

## Page states
The content area under the search box shows exactly one state, driven by `TimetableSearchState` (`app/types/timetable.ts`) through a `v-if` / `v-else-if` chain in `pages/index.vue`.

| Status | Component | When | Current status |
|---|---|---|---|
| `first-use` | `TimetableFirstUseState` | No search yet (Figma's "empty state"): "Or catch the next train from…" + `StationBento` | Done |
| `loading` | `TimetableLoadingState` | Search sent, waiting for the API | Shell |
| `results` | `TimetableResultsState` | API returned services; will compose `TimetableResults` + `StationInfo` + `StationAttractions` | Shell |
| `no-results` | `TimetableNoResultsState` | API returned nothing | Shell |
| `error` | `TimetableErrorState` | The request failed | Shell |

- First use: `StationBento` is Vue Bits' [MagicBento](https://vue-bits.dev/components/magic-bento) layout with every effect off (plain CSS, no GSAP; only the 2px hover lift is left). Each card is a stretched `<button>` inside an `<h3>`; choosing one calls the search form's exposed `searchNextTrainFromStation`, so the form shows the station, date and time searched (the next departure, by the prefill rule). Card photos sit under a scrim (`--colour-photo-scrim*`): white text only where it's at least 55% black.
- Substates belong in their variant of the union (e.g. an error `kind`), not in extra flags.
- The `aria-live="polite"` summary (`.results-summary`) stays rendered in every state. Its text comes from the state, and it's empty on first use.

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
- Plain CSS; no utility classes in our code. Theme Nuxt UI via `--ui-*` in tokens.css; restyle a Nuxt UI component by giving it an unlayered class (via `class` or `:ui` slot hooks). Unlayered CSS beats Nuxt UI's layered utilities whatever the specificity.
- Scoped styles don't reach inside multi-root Nuxt UI components (e.g. `USelect`, `UButton`): target their classes with `:deep()` under a scoped ancestor, and use a non-scoped `<style>` for portalled content (menus).
- No `console.log` (only `console.warn` / `console.error`).

## Accessibility rules (WCAG 2.2 AA)
- Result tables use semantic markup: `<table>`, `<caption>`, `<thead>`/`<tbody>`, `<th scope="col">` / `<th scope="row">`. No div-tables.
- Every form control has a visible `<label>`; group related inputs with `<fieldset>`/`<legend>`.
- Full keyboard operability; logical tab order; never remove focus outlines (use `:focus-visible`).
- Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components. Never convey meaning by colour alone.
- Form errors appear only after a search is tried, under the field to fix, tied to its control with `aria-describedby` (plus `aria-invalid` where the role supports it), with a visually hidden "Error:" prefix; focus moves to the first field to fix. Never disable the submit button.
- Announce async results (e.g. search results count) via an `aria-live="polite"` region.
- Touch targets ≥ 24×24 CSS px (WCAG 2.2 2.5.8).
- Use `.visually-hidden` for screen-reader-only text.
- `lang="en-GB"` is set globally; times/dates use `<time datetime="…">`.
- Anything read from the user's clock (e.g. the search form's date/time prefill) is set in `onMounted`, never during SSR — the server's clock and time zone differ and would break hydration.

## Motion
- All GSAP animations must honour `prefers-reduced-motion`: wrap them in `$gsap.matchMedia()` (or check VueUse's `usePreferredReducedMotion()`), and provide a no-motion path.
- Animate transforms/opacity only; never block content behind an animation.
- `main.css` also has a global CSS reduced-motion guard.

## Testing
- Unit tests only, in `test/unit/**/*.spec.ts`.
- Use `mountSuspended` from `@nuxt/test-utils/runtime` for components needing Nuxt context.
- Add an axe assertion to component specs: `expect(await axe(wrapper.html())).toHaveNoViolations()`.
- Mock the external API — tests never hit the network.
