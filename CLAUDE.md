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
- The home intro is Edwin's own words, kept verbatim: "Hey, I’m Edwin, currently doing data and ML things at McD 🍟" / "In my free time, I’m either cycling or building pet projects on my personal cloud." The 🍟 is the one allowed emoji.
- Home is one screen at 390×844 and 1280×800: header, intro (lede + the commit line under it), then a `blog` grid of the six newest posts with images (5:2 dithered header plates, date, title). Three columns on desktop; two columns and four posts on phones, where the cube is hidden.
- The section and nav item are called "blog", never "log" or "workbench". `/blog` is the same card grid as home (`PostCard`: plate, date, title; no domain or status marks on either), every post; posts without an image get a seeded data plate (`FieldPlate`). Domain and status stay on the post page rail.
- Dithered photos use `--dither-ink` at `--dither-opacity`: sage (`flame-body`) at 90% on graphite, `ember` at 65% on smoke, so the orange stays subdued.
- The cube splits evenly on opposite faces: two `ash-300`, two `flame-shadow` mixed 35% toward the graphite base, and two in the page `ground` (repaints with the theme).

## Design system (source of truth)

- The notedwin design system artifact: <https://claude.ai/artifact/12mNGtWDgTVCRqkLiALDyB> (README, layout-and-modes, motion, voice, data-viz, components).
- In code it's the `@notedwin/design` package in `design/` (a pnpm workspace package and a git subtree of the private `notedwin/design` repo on gitea.notedwin.com, checked out at `~/notedwin/projects/design`; sync with `pnpm design:push` / `pnpm design:pull`, see `design/README.md`). Tokens, CSS, fonts, `Flame`, `DitherPhoto`, `ThemeToggle`, `Tag`/`Status`/`Meta`/`SectionHead` and the Perspective theme live there; the site imports them and keeps only its own parts (cube, post cards, page heads, layouts).
- Edit tokens in `design/src/tokens.json` only, then `pnpm design generate` and `pnpm design check`. `design/css/` and the Python data are generated; never edit them. Site rules live in `app/global.css`.
- Anything another project could use goes in `design/`, not `app/`. Token and package changes are their own commit, never part of a feature task.
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

- Posts: `content/*.mdx` with frontmatter `title publishedAt summary tags domain status` (+ `updated`, `start: true` for the one start-here post, `cover` for the home card image when the first image prints flat). A file with no frontmatter is a draft and is skipped; keep drafts out of git (add them to `.gitignore`).
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
