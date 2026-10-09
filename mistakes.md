# Mistakes log

Mistakes in reasoning or approach, so they aren't repeated.

## 2026-10-07
- `nuxi init --gitInit false` was ignored and a git repo was created anyway. Removed the empty `.git`. Next time verify the flag syntax (`--no-gitInit` / `--gitInit=false`) or check for `.git` after init.
- `pnpm add -D typescript` installed TypeScript 7, which typescript-eslint (via `@nuxt/eslint`) doesn't support (`<6.1`). Pinned to `~6.0`. Check peer ranges before taking the latest major of core tooling.

## 2026-10-08
- While planning, I tried to pixel-sample colours from the design PNGs when the brand guidelines PDF already defines the palette. Read the source-of-truth documents (brand PDF, Figma) before reverse-engineering values from exports.
- I asked how the design would be shared before checking `Downloads` for exports that were already there. Look for local files first, then ask.
- While implementing, a `cd` into `node_modules` inside a Bash call changed the session's working directory. Use absolute paths or subshells, `(cd … && …)`, for one-off lookups.
- Wrote static `src="/images/…"` for images that didn't exist yet. Vue's compiler turns static asset URLs into Vite imports, so a missing `public/` file 500s SSR (Vite resolves `/images/logo.svg` from the drive root). Bind `:src` for public assets that may be missing, or make sure the file exists first.
- Left the empty state reachable only by editing placeholder data. When a design has more than one state, give the user a way to view each one in the browser (e.g. a query-param preview) from the start.
- Defaulted the page to placeholder results, then patched it with a `?preview=empty` query switch. With no API or search yet, the honest default is the empty state, and results should appear only after a search. Choose the default from the real user flow, not from what's handy to demo.
- Repeated the `cd` mistake: a Bash call that `cd`'d into `node_modules/@nuxt/ui/...` moved the session's working directory. Start every Bash call with `cd <project root>` or use absolute paths/subshells.
- The plan assumed our scoped classes would reach Nuxt UI components. They don't when the component renders several root nodes (USelect → reka `SelectRoot` renders the trigger plus a hidden bubble `<select>`), because Vue only adds the parent's scope attribute to a single root. Check a third-party component's render root before styling it with scoped CSS; use `:deep()` under a scoped ancestor.
- The plan said preflight only needed the `a` underline neutralised. Reading `tailwindcss/preflight.css` showed it also restyles the native datetime input's internals and the mobile tap highlight. Read the actual reset rather than trusting a summary when the goal is "zero visual change".

## 2026-10-09
- Added a fourth control to the search row without checking the width it lives in: the hero card was capped at 36rem, so the date wrapped onto two lines. When adding a column to a row layout, check the container's max width and the breakpoint maths first.
- Used the pasted image as-is: Claude Code saves pastes as PNG, so a 68 KB WebP became a 1 MB PNG in `public/`. The original was sitting in `Downloads`. This repeats the 2026-10-08 lesson: for any asset the user shares, look for the original file in `Downloads` first and keep its format; treat a pasted image as a preview only.
- In a spec I passed a hand-made object (`{ hour, minute, compare, toString }`) as a `Time` and only caught it on review. Use the real `@internationalized/date` classes (`new Time(9, 0)`) in tests; a fake can pass checks the real class would fail, or the other way round.
- Made the search quietly move a past time up to now and search anyway, and let the blur do the same when focus went to Search. Clicking Search moves focus first, so the clamp-on-blur ran before every click, and a search went out for a time the user never chose. Fixing a value on the way out of a field is fine; at submit, refuse a wrong value with an error. And remember that a click on a button blurs the field before the submit runs.
- Edited files with Python's text mode on Windows, which writes `\r\n`. Fourteen files went from LF to CRLF, against `.editorconfig` (`end_of_line = lf`). When scripting edits here, open files with `newline=''` (or use `sed`/the Edit tool), and check `git ls-files --eol` afterwards.
- Moved a `.vue` file's second `<style>` block into another component while the user's dev server was running. The open page still asked for `?type=style&index=1`, Vite fed the whole SFC to Tailwind as CSS, and it failed with "Invalid declaration". After removing or reordering `<style>` blocks, tell the user to restart `pnpm dev` and hard-reload the page.
- When I added the time field's `aria-live="polite"` notice (prompt 8), I didn't update the index page spec, which found the live region with `find('[aria-live="polite"]')`. The time field's region comes first in the DOM, so the spec was checking the wrong element (and would have failed). When adding a live region, grep the specs for `aria-live` selectors, and target a specific region by class, not by role/attribute alone.
- Wrote a root-level `<!-- … -->` comment in `TimetableFirstUseState` straight after noting, in the previous task, that a comment at the root makes a component a fragment in dev (breaking attribute fallthrough). Caught it before finishing. Comments in a template go inside the root element.
