# @notedwin/design

The notedwin ash & ember design system as code: one `tokens.json`, generated into every target a
project needs. This repo is the source of truth. The brand book, the design-system artifact at
<https://claude.ai/artifact/12mNGtWDgTVCRqkLiALDyB>, is published from its `book` branch and is read-only.

| target | path | for |
|---|---|---|
| CSS variables + `.t-*` type classes | `css/tokens.css` | any page; graphite by default, smoke via `prefers-color-scheme` or `data-theme="light"` on `<html>` |
| Tailwind v4 theme | `css/theme.css` | `@import` after `tailwindcss`; utilities like `bg-ground`, `text-ink-muted`, `text-label` |
| component CSS (`ne-*`) | `css/components.css` | the artifact's components plus the React parts below |
| fonts | `css/fonts.css`, `fonts/` | pages without `next/font`; Commit Mono and Departure Mono self-hosted, Instrument Sans from Google Fonts |
| Perspective 5.5 themes | `css/perspective.css` | `notedwin graphite` and `notedwin smoke`; load after the viewer's base theme CSS |
| React, server-safe | `@notedwin/design/react` | `Tag`, `StatusMark`, `DomainMark`, `Meta`, `SectionHead`, `themeScript` |
| React, client | `@notedwin/design/client` | `Flame`, `DitherPhoto`, `ThemeToggle`, `usePerspectiveTheme`, dither helpers |
| theme plumbing | `@notedwin/design/theme` | `THEME_KEY`, `themeScript`, `PERSPECTIVE_THEMES`, `currentTheme`, `onThemeChange` |
| Python | `python/` → `notedwin-design` | `color()`, data-viz `palette` functions, the Perspective theme for perspective-python |

## Install

Nothing is published. The repo is `notedwin/design` on gitea.notedwin.com, checked out at
`~/notedwin/projects/design`, and projects use the folder directly, so an edit shows up on the
next build.

- **Local-only projects** link the checkout: `"@notedwin/design": "link:../design"` and
  `uv add --editable ../design/python`. Run `pnpm build` in the checkout after changing `src/`
  (CSS and fonts need no build). With Next, let Turbopack follow the link:
  `experimental.turbopackAdditionalRoots: { design: { path: "../design" } }` in `next.config.ts`.
- **Projects that build elsewhere** (notedwin.tech on Vercel, which can't reach the LAN-only
  Gitea) keep a committed copy as a git subtree at `design/`, listed in `pnpm-workspace.yaml` and
  depended on as `"@notedwin/design": "workspace:*"`. Change this repo first, push it, then pull
  a squashed copy into the site (one commit per pull, none of this repo's history):

  ```sh
  git subtree pull --squash --prefix=design https://gitea.notedwin.com/notedwin/design.git main
  ```

  Never edit the site's `design/` first or `subtree push` from it: the site's repo is public and
  this one is not.

## Use

**Next.js + Tailwind v4** (`app/globals.css`):

```css
@import "tailwindcss";
@import "@notedwin/design/css/tokens.css";
@import "@notedwin/design/css/theme.css";
@import "@notedwin/design/css/components.css" layer(components);
```

```tsx
// app/layout.tsx: apply a saved theme before paint; load the faces with next/font
import { themeScript } from "@notedwin/design/react";
<html suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
```

`next/font/local` takes the font files from `node_modules/@notedwin/design/fonts/` and exposes them
as `--nf-sans`, `--nf-mono` and `--nf-pixel`; `tokens.css` uses those when present.

**DitherPhoto** draws from a plain `<img>` by default. With Next, pass `next/image` so the
dither and the hover color share one optimized download:

```tsx
"use client";
import Image from "next/image";
import { DitherPhoto } from "@notedwin/design/client";
<DitherPhoto src="/photos/1.png" alt="pollock" className="aspect-3/2"
  renderImage={(p) => <Image {...p} fill sizes="260px" />} />
```

**Perspective in a web app**:

```tsx
import "@perspective-dev/viewer/dist/css/pro.css";
import "@notedwin/design/css/perspective.css";
import { usePerspectiveTheme } from "@notedwin/design/client";
<perspective-viewer theme={usePerspectiveTheme()} />   // follows the page theme
```

**perspective-python**:

```python
from notedwin_design import perspective, palette
perspective.jupyter()                                   # once per notebook
PerspectiveWidget(table, theme=perspective.theme_name("dark"))
perspective.write_css("static/")                        # servers: link it after the base theme
palette.series(5, "light"); palette.highlight(4, 2); palette.diverging()
```

## Rules the generated targets follow

From the artifact's `data-viz.md`, enforced by `pnpm check`:

- Series: infra (ash), data (ember), play (ink); more series fall back to `ink-muted` and
  `ink-faint`, and should be labelled directly. (`data-viz.md` names `ash-500`, but that fixed
  brand color is 2.8:1 on smoke, under the 3:1 marks need.)
- Diverging: `infra-ink` → `rule` → `ember-ink`. Datagrid cells stay quiet: positive `ink`,
  negative `infra-ink`; the sign carries direction.
- Text 4.5:1 and marks 3:1 on their surface in both themes; the three domain series stay at least
  ΔE2000 20 apart under protan, deutan and tritan simulation.

## Change it

1. Edit the design system artifact; copy its `tokens.json` (and `components/bundle.css` if
   components changed) into `src/`.
2. `pnpm generate`, then `pnpm check` (drift, contrast, colour-vision) and
   `pnpm check:perspective` (renders Perspective in both themes; screenshots in `checks/out/`).
3. Commit and push. The Gitea workflow runs the same checks on every push.

Never edit `css/` or `python/src/notedwin_design/data/` by hand: they're generated, and
`pnpm check` fails when they drift.

## Publishing, if it's ever needed

`publishConfig` already points at the Gitea npm registry. A project that can neither link nor
vendor the folder can be served by a tagged `pnpm publish` and `uv publish` to
`gitea.notedwin.com/api/packages/notedwin/{npm,pypi}` with a `write:package` token. Until then
nothing is released, and `version` stays at 0.1.0.

## Brand book

The artifact's prose, component guides and previews live on the private `book` branch, never on
`main`, because `main` is vendored into public repos. Check it out beside this repo with
`git worktree add ../design-book book`; its `build/book.mjs` stages the book with this checkout's
tokens, stylesheet and fonts and publishes it to the artifact, and its `checks/book.mjs` warns when
the artifact is behind.
