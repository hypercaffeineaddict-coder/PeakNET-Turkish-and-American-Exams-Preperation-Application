# DESIGN.md — PeakNET "Summit"

Design language locked here. All tokens live in `src/app/globals.css` (Tailwind v4 `@theme`). Do not hardcode hex; use the tokens or Tailwind palette utilities for semantic colors.

## Theme
Dark-first. Deep violet-tinted ink, not pure black. Light mode is warm near-white tinted toward the brand hue. Both must be first-class — students use light by day, dark by night.

## Color strategy: Committed
Signature **iris** primary carries identity and action; warm **ember** carries energy, streaks, urgency. Tinted neutrals lean violet. Never `#000`/`#fff`.

OKLCH roles (see globals.css for exact values):
- `primary` (iris): brand + primary actions, active nav, links, XP/level.
- `accent` / ember (amber-orange): streaks, countdown, momentum, "hot" states.
- Semantics: emerald = correct/success, rose = wrong/danger, sky = info/neutral stat.
- Neutrals: `background`, `card`, `muted`, `border`, `foreground`, `muted-foreground` — all violet-tinted (chroma ~0.01).

Each semantic color owns its meaning; do not use emerald for decoration. The hero/landing may go further (committed surfaces, glows) since it is the brand register.

## Typography
- Body/UI: Geist Sans (`--font-sans`).
- Display (headings, big numbers, hero): **Space Grotesk** (`--font-display`) — geometric, energetic, distinctive. Use `font-display` utility on h1/h2, stat values, countdowns.
- Mono: Geist Mono for code/tokens only.
- Scale: contrast ≥1.25 between steps. Hero up to text-6xl. Tabular numerics (`tabular-nums`) on every stat, net, countdown, XP.
- Body line length 65–75ch max.

## Elevation
Soft, tinted shadows (shadow color carries the brand hue at low alpha), never harsh black. Use `shadow-soft` / `shadow-pop` utilities. Cards sit on `card` over `background` with a 1px `border`. No nested cards. Most content does not need a card at all.

## Radius
`--radius` = 0.875rem base. Cards `rounded-2xl`, controls `rounded-xl`/`rounded-lg`, pills `rounded-full`.

## Motion
- Ease-out only: `--ease-out-expo`, `--ease-out-quart`. No bounce/elastic.
- Never animate layout props; animate transform/opacity.
- Perpetual micro-motion is reserved for "alive" elements: streak flame, XP shimmer, hero glow. Everything else animates on interaction/enter only.
- Respect `prefers-reduced-motion`.

## Component conventions
- **Nav (sidebar):** grouped into labeled sections, not a flat list of 21. Active item = filled pill (`bg-primary/12`, primary text + icon) with a small leading indicator dot — never a left border stripe.
- **Stat tiles:** break the identical grid. Vary size/treatment; lead with the number in display font + tabular-nums; the most important stat (streak) gets ember treatment and motion.
- **Buttons:** primary = solid iris with soft iris shadow; secondary = bordered on card; ghost = muted hover. Clear focus-visible ring (`ring-2 ring-primary/50`).
- **Inputs:** `bg-background`, 1px border, focus → primary border + ring.
- **Empty states:** never a bare "no data"; short encouraging line + a CTA.

## Hard bans (impeccable)
No gradient text (`background-clip:text`), no decorative glassmorphism, no side-stripe borders, no hero-metric template clones, no identical card grids, no em dashes in copy, no `#000`/`#fff`.
