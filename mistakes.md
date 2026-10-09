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
