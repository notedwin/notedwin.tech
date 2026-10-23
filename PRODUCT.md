# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: engineers and curious readers who land on one post from search or a shared link. They came for a specific answer (Thunderbolt networking, DeDRM, DuckDB in Spark, a homelab build) and decide within a few seconds whether the post has it.

Secondary: recruiters and peers checking Edwin's work, and Edwin, who uses the site as a record of what got built and how the thinking behind it changed. Friends and family read too, without knowing Edwin's day-to-day work.

## Product Purpose

notedwin.com is Edwin Zamudio's personal site: notes on running a homelab, data engineering and ML, covering what got built, what it cost and what broke.

Success means three things:

- A visitor who landed on one post goes on to read a second (the ★ start-here post, the home grid, `/blog`).
- The site works as proof of work: real projects with real numbers, readable by someone hiring.
- It stays a durable personal archive. Traffic is a side effect, not the goal.

## Positioning

First-hand build logs with exact costs, counts and failures, written by the person who ran the hardware: 166,272 login attempts on a Raspberry Pi, a $20 NAT gateway bill, a random forest that caught 16% of goals. Posts lead with the finding and a number, and keep dated hindsight ("Looking back") instead of silently rewriting old views.

## Operating Context

- Next.js 16 on Vercel, MDX posts in `content/*.mdx`, deployed from `main`.
- Visual system comes from the `@notedwin/design` package in `design/` (git subtree of the private `notedwin/design` repo). The site keeps only its own parts.
- Readers arrive on post pages more often than on home. Home and `/blog` are the routes onward.
- Edwin writes and edits posts with the `notedwin-writing` skill.

## Capabilities and Constraints

- Routes: home, `/blog` (card grid, BM25 search, newest/oldest sort), post pages, `/projects`, `/photos`, RSS feed, OG images, `llms.txt`, sitemap.
- Post frontmatter: `title publishedAt summary tags domain status`, plus optional `updated`, `start: true` (one post only), `cover`. A file without frontmatter is a draft and is skipped.
- `domain` is `infra | data | play`. `status` is `seed | growing | settled | live`.
- Terminology: the section is "blog", never "log" or "workbench".
- Definition of done covers typecheck, build, screenshots at 375/768/1440 in both themes, axe with zero violations, a keyboard pass, and loading/empty/error/long-content states.

## Brand Commitments

- Name: notedwin. Personality: quiet, deliberate. Anything that contradicts it is rejected.
- The home intro is Edwin's own words, kept verbatim: "Hey, I’m Edwin, currently doing data and ML things at McD 🍟" / "In my free time, I’m either cycling or building pet projects on my personal cloud."
- Voice: concise and dense, Edwin's own slang kept, no hype words, no exclamation marks in the interface. Chrome is lowercase; prose is sentence case.
- Design authority lives in the design system artifact and `CLAUDE.md`, not here.

## Evidence on Hand

- 16 posts in `content/`, including the attack map (Edwin's proudest project), HaxML, homelab 2024/2025/2026, Thunderbolt networking, AWS/Terraform, health data.
- Projects in `app/projects/project-data.tsx`; photos in `app/photos/photo-data.ts`.
- Social links in `app/config.ts` (GitHub, LinkedIn, Substack, Are.na, Spotify).
- There are no testimonials, client logos, follower counts or traffic figures. Never invent them.

## Product Principles

1. The post is the product. Chrome exists to get a reader into one post and on to the next.
2. Real numbers over adjectives. Every claim the site makes about Edwin's work is backed by a post.
3. Honest about failure. What broke and what it cost is part of the value.
4. Built to last as an archive: old posts stay readable, with dated hindsight rather than rewrites.

## Accessibility & Inclusion

WCAG AA in both themes, enforced by axe on every route (`pnpm test:ui`). Every control is keyboard-reachable with a visible focus ring. The site works without JavaScript for photos and the flame.
