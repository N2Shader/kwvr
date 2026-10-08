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
