# KWVR Timetable

## Project context
- Timetable web app for the **Keighley & Worth Valley Railway** (KWVR).
- Structure is **airline-style**: a search box → a result table → links. The result table differs from an airline's (train services, stations, heritage-railway specifics) — follow the Figma design, not airline conventions, where they diverge.
- Data comes from a **single external API**. The API itself is **out of scope** — we only consume it.
- Data flow: `TimetableSearchForm` emits `search` (criteria) → `useTimetableSearch` (owns the page state) → `GET /api/timetable/search` (our Nuxt server endpoint) → `fetchTimetableByQuery` (`server/utils/timetableApi.ts`) → the external API. If the external API fails, the endpoint logs its error and fails too, with a 502 (its details never reach the browser), so the page shows the error state. The external API doesn't exist yet, so `fetchTimetableByQuery` returns a dummy response (and `SIMULATE_TIMETABLE_API_ERROR`, TEMPORARY, makes it fail on purpose), a whole timetable (`server/data/dummy-timetable-response.json`, the orange one: each call has a `time` and a `timeType` (`departure` / `arrival`), and trains and stations carry `notes` codes resolved through the `key`; typed by `TimetableApiResponse` in `app/types/timetableApi.ts`), and `getTrainServicesByCriteria` (`app/utils/timetableResponse.ts`) picks the trains leaving the searched station at or after the searched time, both ways, as result rows, each with its symbols (`notes`: the train's, then those of the stations it calls at from the origin on).
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
- Pastel shades tell timetables apart (e.g. the tint marks alert rows and the last train's row).
- Font: Gill Sans, from a local font stack only (no webfont files). SemiBold for headers, Regular for body.
- Left-align long text; centre only short snippets.
- **No icons yet** — they're still being confirmed. Use text labels (e.g. "Service alert") until the icon set is approved. Exceptions: built-in control affordances (the Select's chevron and ✓) and the footer social links, which use brand logos from Simple Icons (`@iconify-json/simple-icons`, CC0, bundled locally) with a visually hidden text name, and the timetable key symbols (diesel, steam, bar, National Rail, Rail Story) from kwvr.co.uk's printed timetables, plus our own last-train symbol (a clock on 11:00, drawn in the same black-glyph style, as the printed key has none), in `public/images/timetable-key/` as 96px WebP. Their paths, alt text (`label`) and meanings (`description`) come from the API response's `key`, never hard-coded. On hover a symbol shows its `label` in a tooltip (`TimetableNoteIcon`: `UPopover` in hover mode, the tooltip text `aria-hidden` because the alt text already says it).
- Footer legal links have no underline (they sit in a labelled `<nav>`); they underline on hover like the main nav.
- Footer social logos grow to 1.1 on hover (pointer devices only, a `transform` transition), like the timetable symbols.

## Stack
- Nuxt 4 (`app/` directory layout), Vue 3, TypeScript (strict)
- pnpm (`packageManager` pinned in `package.json`) — never use npm/yarn
- VueUse (`@vueuse/nuxt`, composables auto-imported)
- GSAP (client-only plugin, `useNuxtApp().$gsap`)
- Plain CSS with custom properties — no preprocessors, no utility classes in our code
- Nuxt UI v4 (`@nuxt/ui`) for interactive components (`USelect`, `UButton`, …). Tailwind CSS v4 is installed only as Nuxt UI's styling engine. `ui.fonts` and `ui.colorMode` are off (local fonts only, no dark mode). Icons come from locally bundled sets only (`@iconify-json/lucide` for control icons, `@iconify-json/simple-icons` for social logos), with `icon.fallbackToApi: false`, so nothing is fetched from the Iconify API
- The site is boxed at 80rem with Nuxt UI's `UContainer` (`--ui-container` ← `--layout-max-width` in tokens.css): `SiteFrame` (used by `app.vue` and `error.vue`) wraps header, main and footer in a `UContainer` (`.site-frame`, no gutter, so the bands' backgrounds stop at the box edge), and every content column (header, footer bands, page sections) is a `UContainer` too, with its gutters (1rem / 1.5rem from 40rem / 2rem from 64rem). Give it `as="section"` (or `header`) and keep the element's own class; there is no `.container` class. Set only `padding-block` on a `UContainer`, so its gutters stay in place.
- ESLint via `@nuxt/eslint` with stylistic formatting (no Prettier) + `eslint-plugin-vuejs-accessibility`
- Vitest + `@nuxt/test-utils` + happy-dom + `vitest-axe`
- `@nuxt/image` for responsive images: `useImage()` builds resized/cropped WebP URLs (ipx locally). Keep srcset widths at or below the original's width, and keep originals in WebP
- `@internationalized/date` (Nuxt UI's optional peer) for `UCalendar`/`UInputTime` values (`CalendarDate`, `Time`)
- TypeScript is pinned to `~6.0` because typescript-eslint doesn't support TS 7 yet
- `nuxt.config.ts` has a `nitro.externals.inline` workaround for a Nuxt 4.6.0 Windows SSR bug ([nuxt#36467](https://github.com/nuxt/nuxt/issues/36467)) — remove once a Nitro release includes nitrojs/nitro#4732

## Folder conventions
```
app/
  app.vue              # <SiteFrame><NuxtPage /></SiteFrame>
  error.vue            # the 404 / error page (kwvr.co.uk's 404 with a "Take me home please" button), inside <SiteFrame>
  app.config.ts        # site link data (nav, donate, legal, social, contact, organisation) — read via useAppConfig()
  assets/css/
    tokens.css         # design tokens: brand → semantic (components use semantic only) → Nuxt UI bridge (--ui-* mapped to semantic)
    main.css           # @import tailwindcss → @nuxt/ui → tokens.css → timetable-table.css; reset in @layer base (after preflight);
                       # unlayered: focus styles, .button-primary, .surface-inverse, reduced-motion guard
    timetable-table.css # non-scoped .timetable-table* classes: the look shared by the results, their skeleton and the journey's stops (portalled modal),
                       # plus the departures layout (.timetable-table-departures: columns, departure-* cells, mobile cards) for the results and their skeleton
  components/          # PascalCase .vue files, auto-imported
    site/              # SiteFrame (the shell: <UApp :toaster="null"> wrapping skip link + <UContainer class="site-frame"> (the 80rem box) around <SiteHeader /> + <main id="main"><slot /></main> + <SiteFooter />), SiteHeader, SiteNav, SiteFooter
    timetable/         # TimetableSearchHero, TimetableSearchForm, TimetableOriginSelect, TimetableDepartureDatePicker, TimetableDepartureTimeField, TimetableSearchFieldError, TimetableResults, TimetableResultJourneyButton, TimetableResultStationTime, TimetableResultInfo, TimetableNoteIcon, TimetableNoteList, TimetableResultsKey, TimetableResultsDayHint, TimetableJourneyModal, TimetableFirstUseState, TimetableLoadingState, TimetableResultsSkeleton, TimetableResultsKeySkeleton, TimetableResultsState, TimetableNoResultsState, TimetableErrorState
    station/           # StationInfo, StationAttractions, StationAttractionCard, StationBento, StationBentoCard
  composables/         # useXxx composables, auto-imported (useTimetableSearch: search → endpoint → page state; useResultRowsEntranceMotion; useStationBentoEntranceMotion)
  data/                # placeholderTimetable.ts: TEMPORARY placeholder data — replace with an API composable;
                       # stationHighlights.ts: site content (station card copy + photos from kwvr.co.uk), stays
  pages/               # file-based routes
  plugins/             # gsap.client.ts
  types/               # shared TypeScript types (import with `import type … from '~/types/…'`)
  utils/               # pure helpers (formatting, API response → result rows, departure prefill rules, form values → search criteria)
server/
  api/                 # Nuxt server endpoints (Nitro): timetable/search.get.ts, the search box's endpoint (external API failure → 502)
  utils/               # auto-imported server helpers: timetableApi.ts (fetchTimetableByQuery, the external API call)
  data/                # dummy-timetable-response.json: the endpoint's dummy answer (the orange timetable, train by train), server-only
public/images/         # logo.svg, hero-train-45596.webp (hero original, 1536×512), station-card.jpg (exported from Figma),
                       # stations/<station-id>.webp (station card originals, 1280px wide, from kwvr.co.uk),
                       # timetable-key/<symbol>.webp (timetable key symbols, 96px, from kwvr.co.uk; last-train.webp is ours),
                       # derailed-train.webp (the error state's illustration, 960×1056, white made transparent)
test/
  setup.ts             # vitest-axe matchers
  fixtures/            # shared test data
  unit/**/*.spec.ts    # unit tests
```
- Component folders don't change names: Nuxt drops the repeated folder prefix (`site/SiteHeader.vue` → `<SiteHeader>`).
- Dark bands (burgundy/grey) get `.surface-inverse` so the focus ring switches to white.

## Page states
The content area under the search box shows exactly one state, driven by `TimetableSearchState` (`app/types/timetable.ts`) through a `v-if` / `v-else-if` chain in `pages/index.vue`. The chain sits in `.timetable-page-content`, at least one screen tall (`min-height: 100vh` then `100svh`) in every state, so swapping states (the tall bento for the shorter skeleton) never pulls the footer up into view; the first-use state grows to fill it. Nothing scrolls after a card click.

| Status | Component | When | Current status |
|---|---|---|---|
| `first-use` | `TimetableFirstUseState` | No search yet (Figma's "empty state"): "Or catch the next train from…" + `StationBento` | Done |
| `loading` | `TimetableLoadingState` | Search sent, waiting for the API | Skeleton (UTable) + Key placeholder |
| `results` | `TimetableResultsState` | API returned services; will compose `TimetableResults` + `StationInfo` + `StationAttractions` | `TimetableResults` (a UTable, services from the dummy response; rows open the journey modal) + `TimetableResultsKey` |
| `no-results` | `TimetableNoResultsState` | API returned nothing | Shell |
| `error` | `TimetableErrorState` | The request failed | Derailed-train illustration, message, "Take me home please" button |

- First use: `StationBento` is Vue Bits' [MagicBento](https://vue-bits.dev/components/magic-bento) layout with every effect off (plain CSS; only the 2px hover lift is left, on the `translate` property because GSAP owns the card's `transform`). Each card is a stretched `<button>` inside an `<h3>`; choosing one calls the search form's exposed `searchNextTrainFromStation`, so the form shows the station, date and time searched (the next departure, by the prefill rule). Card photos sit under a scrim (`--colour-photo-scrim*`): white text only where it's at least 55% black.
- Bento entrance: `useStationBentoEntranceMotion` brings the cards in one after another, each fading in from 64px outside its place, straight out from the bento's centre (so they converge at 4, 2 and 1 columns; measured before tweening). GSAP `fromTo` (opacity 0 → 1, 0.6s, `power3.out`, 0.08s stagger, `clearProps: 'transform,opacity'`) under `(prefers-reduced-motion: no-preference)` only. `fromTo`, not `from`: an anti-flash guard (`station-bento-entrance-pending` on the list, `opacity: 0` on the cards under no-preference, with a 2s CSS reveal in case the script never runs) keeps the server-rendered cards hidden, and `from` would read its 0 as the end value. The composable returns `isBentoEntrancePending`, set to false at the end of `onMounted`, once GSAP has hidden the cards (or straight away under reduced motion). `.first-use-state` has `overflow-x: clip`, so cards starting outside never scroll the page sideways.
- Loading: a visually hidden "Departures" `<h2>` (the results' heading) and "Loading departures…", plus `TimetableResultsSkeleton` and `TimetableResultsKeySkeleton` (the Key under the results: a heading bar and three symbol lines), so nothing jumps when results arrive. The table skeleton uses the results table's own classes (`timetable-table timetable-table-departures`, `departure-*` cells, `timetable-table-row`), so it can't drift from it; only its bar shapes are its own. Both are `UTable`/`USkeleton` and `aria-hidden` (USkeleton marks each block `role="alert"`). The section's padding and the Key placeholder's top margin match the results' and the Key's spacing.
- Results: `TimetableResults` is a `UTable` (user's choice) with a screen-reader `caption` and `<th scope="col">` headers; cells are drawn by `#<column>-cell` slots (with `TimetableResultStationTime` and `TimetableResultInfo`), backgrounds, dividers and the outer rounded corners sit on the cells (a row can't take a radius), row classes (e.g. `has-service-alert`) go through the table's `meta.class.tr`. The table's look (`.timetable-table*` classes) lives in the non-scoped `assets/css/timetable-table.css`, shared with the journey's stops; the departures layout (column widths, `departure-*` cell alignment, the mobile card layout) is there too, under `.timetable-table-departures`, shared with the skeleton (its mobile overrides come after the base corner and divider rules, at least as specific). Only the row hover, the row's containing block and the icons' z-index stay scoped in `TimetableResults`, whose section wraps a `UContainer` (the section stays the element GSAP and the click hand-off use). UTable's body cells are always `<td>`, so the origin is not a row header, and it can't take explicit table roles (kept by the old table for the mobile `display` changes).
- Journey: each row is clickable through `TimetableResultJourneyButton`, a stretched `<button aria-haspopup="dialog">` in the origin cell (visually hidden "Journey details: Haworth 10:22 to Keighley 10:43"; its `::after` covers the row, the row is `position: relative`, and the focus ring sits inset on the `::after`). Not UTable's `@select`: that makes each `<tr tabindex="0">` with no role. On hover the row's cells take a darker background (`--colour-surface-alt-hover` / `--colour-surface-alert-hover`), the text untouched and no colour transition; never opacity on the cells (it would stack them above the hit area). The symbol icons sit above the hit area (`z-index: 1`) so their tooltips work; a click on one is handed to the row's button in script. The button opens `TimetableJourneyModal` (`UModal`): title "Haworth to Keighley", description "Departs … · 4 stops", a stops `UTable` (Station / Time, same classes as the results) from the boarding station to the end of the line (each result carries `calls`, with a "Request stop" text tag from the key's `x` and the station's symbols), then "About this journey" (only that train's symbols, plus the request-stop wording with its tag stacked above it). `TimetableResults` keeps the selected service after close (no empty leave transition) and returns focus to the row's button via `content.onCloseAutoFocus` (Safari doesn't focus buttons on click).
- Entrance: `useResultRowsEntranceMotion` slides the body rows up into place, barely noticeable (one GSAP timeline, two `from` tweens at position 0: y 8 and scale 0.9 (coming from the back), 0.25s, `sine.out`, 0.075s stagger, `clearProps: 'transform'`), with a subtle fade alongside (opacity 0, 0.15s, same ease and stagger, `clearProps: 'opacity'`: shorter than the rise, so the rise from below still shows; on the rows, never the cells) under `(prefers-reduced-motion: no-preference)` only. Never put a CSS `transition` on a property GSAP animates (it lags every frame); it replays on each new result set because the results state remounts `TimetableResults`.
- Last train: `getTrainServicesByCriteria` marks the latest departure from the searched station each way (per journey) `isLastTrain` and puts the key's `last-train` symbol first in its `notes` (the response doesn't mark it; the symbol's path, label and wording come from the key). Its row gets `is-last-train` (`--colour-surface-last-train`, the burgundy tint for now, and a darker shade on hover, `--colour-surface-last-train-hover`); an alert's tint wins on a row that is both. The symbol keeps it from being colour alone; the row's button adds ", last train" and the modal's description "· Last train". The Key and "About this journey" list it like any symbol.
- Day hint: when the search is for a day other than today, `TimetableResultsDayHint` puts "* These trains are not for today" (14px, `--font-size-xs`, the asterisk `aria-hidden`) above the table, in the results and in the loading state (so the table doesn't shift when results replace the skeleton). Today is read from the user's clock in `onMounted` (`isDepartingAfterOnDate`).
- Symbols: the Info cell shows each result's `notes` as 24px icons whose alt text is the note's `label`; `TimetableResultsKey` (under the table, in `TimetableResultsState`) lists the symbols those results use, each once, with the key's `description` and a decorative icon (`alt=""`), through `TimetableNoteList` (also used by the journey modal). The skeleton's info cell has a placeholder for the icon row.
- Error: `TimetableErrorState` is a decorative derailed-train illustration (`alt=""`, `useImage()` srcset up to its 960px original), the `<h2>` "Sorry, we couldn’t load the timetable", a short "try again" paragraph and a "Take me home please" `UButton` (`.button-primary`, the 404's wording), centred on the cream band like the first-use state. The button is a button, not a link (we're already on `/`): it emits `return-home`, and the page calls `resetTimetableSearch()` (back to first use) then the form's exposed `focusSearchForm` (focus on the station field, as the button is gone). The live region says "Sorry, we couldn’t load the timetable." The illustration's white was made transparent by colour-to-alpha (`alpha = 255 − min(R,G,B)`, black colour), so its light-grey fills tint with the band. It shows only when the endpoint fails (an external API failure → our 502); to see it in dev, set `SIMULATE_TIMETABLE_API_ERROR` in `server/utils/timetableApi.ts`.
- Latest search wins: `useTimetableSearch` only writes an outcome if the state is still loading with the same criteria object (`searchState` is a `shallowRef`, so that's the raw object, not a proxy).
- Same search, no new call: `useTimetableSearch` skips a search with the same station and `departingAfter` as the one loading or shown (`isSameSearchCriteria`); after an error it runs again, as the retry.
- Substates belong in their variant of the union (e.g. an error `kind`), not in extra flags.
- The `aria-live="polite"` summary (`.results-summary`) stays rendered in every state. Its text comes from the state: empty on first use, "Searching for departures from Haworth…" while loading, the count with results.

## Error page
- `app/error.vue` handles every error (Nuxt renders it instead of `app.vue`, hence the shared `SiteFrame`). It copies kwvr.co.uk's 404 structure (e.g. https://kwvr.co.uk/esdsa): a section with a `<header>` + `<h1>` "Oops! That page can’t be found.", the paragraph "It looks like nothing was found at this location." (their "Maybe try a search?" dropped) and, instead of their search form, a "Take me home please" `UButton` (`.button-primary`). Other errors get "Sorry, something went wrong." / "Please try again in a moment.". Title: "Page not found — Keighley & Worth Valley Railway".
- The button is a real link (`to="/"`, works before hydration, opens a tab on middle/modifier click); a plain click calls `clearError({ redirect: '/' })` instead, because a router push to the route the error happened on wouldn't clear it.

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
- Result tables use semantic markup: `<table>`, `<caption>`, `<thead>`/`<tbody>`, `<th scope="col">` (and `<th scope="row">` where the markup is ours; the results are a UTable, see Page states). No div-tables.
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
- Mock the external API — tests never hit the network. Mock our endpoint with `registerEndpoint` (`@nuxt/test-utils/runtime`); registrations for one URL pile up and the latest wins, so use `once: true` or call the returned unregister function (once only).
