# CloseRouterUI

A Vue 3 console starter with a design token system worth stealing.
Violet in light mode, lime in dark — and **zero `dark:` variants** in the component code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883)](https://vuejs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)

**[Live demo](https://closerouter-ui.vercel.app)** · [中文文档](README.zh-CN.md)

![Activity page, dark](docs/screenshots/activity-dark.png)

> **Not affiliated with OpenRouter.** This is an independent open-source project whose
> visual language references [OpenRouter](https://openrouter.ai/). Design token values were
> read from their production stylesheet — color values are facts, not creative work — but the
> code, components and branding here are original. No endorsement is implied.

---

## Why this exists

Most Vue admin templates hand you a component library and a color picker. This one hands you a
**token system** — the part that actually makes an interface feel designed rather than assembled.

Three structural ideas do most of the work:

### 1. `accent` is derived from `primary`, so light/dark costs nothing

```css
--accent:            hsl(<primary> / 0.078);   /* selected background */
--accent-foreground: hsl(<primary>);           /* selected text       */
--accent-subtle:     hsl(<primary> / 0.031);   /* hover background    */
```

A selected nav item is just `bg-accent text-accent-foreground`. The token layer absorbs the
difference between violet and lime, so **the component code contains no `dark:` variants at all**.

### 2. `border` and `muted` are the foreground color at low alpha

```css
--border:           hsl(<foreground> / 0.078);
--muted-foreground: hsl(<foreground> / 0.69);
```

Not a separate gray ramp. Dividers automatically carry the color temperature of the active
theme, which is why nothing ever looks slightly "off" after a theme switch.

### 3. Cards are brighter than the page — in both themes

| | Accent | Page | Card |
|---|---|---|---|
| Light | `#7624F4` | `#FCFCFE` | `#FFFFFF` |
| Dark | `#C8FF00` | `hsl(197 54% 2.5%)` | `hsl(197 30% 4.5%)` |

Surfaces lift off the background without a single box-shadow.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Vue 3.5 + Vite 8 + TypeScript 6 | `<script setup>`, Composition API |
| Styling | Tailwind CSS v4 | `@theme inline`, no `tailwind.config.js` |
| Primitives | [Reka UI](https://reka-ui.com/) | Headless — **ships zero CSS**, behavior and a11y only |
| Icons | `@lucide/vue` | Not the deprecated `lucide-vue-next` |
| Fonts | Fontsource (self-hosted) | Outfit · Plus Jakarta Sans · Geist Mono |
| Charts | Hand-written SVG | No chart library. Colors read CSS tokens directly |

**Reka UI is not Element Plus or Ant Design Vue.** It provides keyboard navigation, focus
management and ARIA semantics — and no appearance whatsoever. That is precisely why the token
layer works cleanly: there is nothing to override.

---

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # vue-tsc typecheck + production build
```

Requires Node ≥ 20.19 (see `.nvmrc`).

---

## Screenshots

| Light | Dark |
|---|---|
| ![Activity light](docs/screenshots/activity-light.png) | ![Activity dark](docs/screenshots/activity-dark.png) |
| ![Models light](docs/screenshots/models-light.png) | ![Models dark](docs/screenshots/models-dark.png) |
| ![Logs light](docs/screenshots/logs-light.png) | ![Logs dark](docs/screenshots/logs-dark.png) |

---

## Pages

| Route | What it demonstrates |
|---|---|
| `/activity` | 5 stat tiles, top-N rank lists, stacked usage chart, working metric tabs |
| `/models` | Dense catalog with live filtering (search / modality / vendor) and 3 sort orders |
| `/logs` | Collapsible histogram over an 11-column dense table |
| `/keys` | Quota progress bars, masked secrets, hover-revealed actions |
| `/credits` | Balance, top-up presets, transaction ledger |
| `/settings` | Form sections and a destructive-action zone |
| `/chat` | Empty-state composer |

---

## Project structure

```
src/
├── assets/styles/index.css   # ← the only file you need to touch to re-skin
├── components/
│   ├── ui/                   # shadcn-vue layout: button/ badge/ card/ tabs/
│   ├── layout/               # AppShell · AppTopNav · AppSidebar · ThemeToggle
│   ├── charts/               # UsageChart · StackedBars · BarSeries · Sparkline
│   └── console/              # PageHeader · StatCard · RankList
├── composables/useTheme.ts   # light | dark | system — three distinct states
├── lib/{utils,format,curve}.ts
├── data/mock.ts              # replace this file when wiring a real API
├── views/
└── router/index.ts
```

### Re-skinning

Change `--primary` in `:root` and `.dark` inside `src/assets/styles/index.css`, then keep
`--accent` / `--accent-subtle` / `--secondary` / `--ring` on the same hue at the same alphas.
Nothing else needs to change.

---

## Status — read before adopting

**Complete as a style foundation.** Six pages with real content, both themes, zero type errors,
green build.

**Not a production app.** Known gaps:

- **18 of 26 buttons are presentational** (refresh, filter, copy, save, account menu…)
- No data layer — `data/mock.ts` is a synchronous constant, no fetch/retry
- No state management (Pinia not installed), no auth, no route guards
- No ESLint / Prettier / Vitest
- Loading and error states largely missing
- Mixed Chinese/English strings, no i18n
- Breakpoints written but not verified on real devices

Suggested order to close the gaps: **wire the buttons → extract a data layer → add
loading/error states → add lint & tests.**

---

## Documentation

| Document | For |
|---|---|
| [AGENTS.md](AGENTS.md) | AI agents and new contributors — invariants, architecture, how to extend |
| [docs/INTEGRATION.md](docs/INTEGRATION.md) | Adopting this into an existing Vue project (3 paths) |

`AGENTS.md` documents five non-obvious invariants that fail **silently** if violated — worth
reading before your first change.

---

## License

[MIT](LICENSE) © ZHANGCHAO
