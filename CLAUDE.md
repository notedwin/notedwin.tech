@AGENTS.md

# notedwin.tech

Personality: **quiet, deliberate.** Reject anything that contradicts it.

## Direction (approved brief)

- Audience: engineers and curious readers who find a post through search or a link.
- Tone: quiet, deliberate. Ash is structure, ember is signal.
- Signature moment: the header flame loops (every page); the home cube tumbles (hidden below 768px). Nothing else moves on its own.
- Type: Instrument Sans (prose) · Commit Mono (name, nav, titles, meta, code) · Departure Mono (technical labels only, at 11/22/33px).
- Accent: ember, sparingly: the commit square, the ★ start-here entry, the highlighted series in a post's figures.

## Site decisions (override the design system where they differ)

- Header is the flame (home link), nav and theme toggle on one row at every width; no wordmark text, no commit line.
- Home is one screen at 390×844 and 1280×800: header, intro (lede + the commit line under it), workbench. No field photos or log on home. Phones hide the cube and the project plates and descriptions.
- The log (`/blog`) is a plain row list like `/projects` (date · domain · status, title, summary), not the trail layout.
- Dithered photos draw at 90% opacity for slightly softer contrast.

## Design system (source of truth)

- The notedwin design system artifact: <https://claude.ai/artifact/12mNGtWDgTVCRqkLiALDyB> (README, layout-and-modes, motion, voice, data-viz, components).
- Vendored copies: `design-system/tokens.json`, `design-system/bundle.css`. Re-sync: replace both, run `pnpm tokens`.
- `app/styles/{tokens,theme,bundle}.css` are generated. Never edit them; site rules live in `app/global.css`.
- Token changes are their own commit, never part of a feature task.
- Where the field guide's defaults conflict with the system (fonts, radius, breakpoints), the system wins.

## Tokens you may use (nothing else)

- Color: `ground` `ground-raised` `ground-sunk` `ink` `ink-muted` `ink-faint` `rule` · domains `infra` `data` `play` (+ `-ink` `-wash` `on-`) · `ember` `ember-strong` `ember-ink` `ember-wash` · `signal-live|warn|error` · `link` · `kraft` `paper` (props only).
- Space: `space-1 2 3 4 6 8 12 16 24 32` (4px base). Radius: `radius-0` (default), `radius-sm` (inputs, tags), `radius-pill` (status dots).
- Type: `.t-*` classes or the Tailwind `text-*` of the same names. Breakpoints: 480 / 768 / 1024 / 1280.
- Widths: `column` 880px (site), `rail` 200px (≥1024), `measure` 66ch (prose).

## Forbidden

- Raw hex, rgb or named colors outside generated files (the cube's fixed graphite ink is the one documented exception).
- Tailwind arbitrary values (`p-[13px]`), `dark:` variants (tokens already switch themes), radius on cells or images, shadows on resting surfaces.
- Ember as text on a fill, as a link color, or more than once per screen outside the budget above.
- Departure Mono at sizes other than 11/22/33px, or for names, nav, buttons, titles, paragraphs.
- Emoji, hype words, exclamation marks in the interface. Chrome is lowercase; prose is sentence case.
- `"use client"` above leaf components. Animating anything but transform and opacity.

## Content

- Posts: `content/*.mdx` with frontmatter `title publishedAt summary tags domain status` (+ `updated`, `start: true` for the one start-here post). A file with no frontmatter is a draft and is skipped.
- `domain`: infra | data | play. `status`: seed | growing | settled | live.
- Projects: `app/projects/project-data.tsx`; photos: `app/photos/photo-data.ts`.
- Bump `SITE_VERSION` in `app/components/footer.tsx` on every redesign.

## Definition of done (per change)

1. `pnpm typecheck` and `pnpm build` pass.
2. Screenshots at 375, 768 and 1440px in graphite and smoke; no horizontal scroll, no console errors.
3. `pnpm test:ui`: axe reports zero violations on every route in both themes.
4. Keyboard pass: every control reachable, focus ring visible.
5. Lighthouse (`lighthouserc.js`) budgets hold on the production build; on a miss, find the cause first.
6. Loading, empty, error and long-content states exist for anything new.

## Browser checks

- Browser checks use the local playwright-cli via `pnpm exec playwright-cli` (with `PLAYWRIGHT_BROWSERS_PATH=0` and `--config=playwright-cli.json` on `open`); never the claude-in-chrome tools or a Playwright MCP server.
- Dev server URL: http://localhost:3000 (`pnpm dev`).
- After each UI change: open, snapshot, screenshot at 375, 768 and 1440px in both themes, check console errors, report what changed visually.

## Environment: macOS / BSD tools

- The local machine is macOS. `sed -i` needs `''` as an argument, `grep` does not support `\b` (use `grep -E` with `[[:<:]]`/`[[:>:]]` or use `rg`), and GNU-only flags will fail.
- Prefer `rg`, `fd`, `bat`,or Python/uv scripts over clever sed and grep pipelines. Any user-facing shell script must be POSIX/BSD compatible.
