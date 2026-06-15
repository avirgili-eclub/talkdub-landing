# Parla — Landing

Landing page for **Parla**, a real-time voice translation desktop app by Veinticuatro7 Studio. You speak in your language; the other side hears you in theirs — in your own (optionally cloned) voice, through a virtual microphone into Meet, Zoom, Teams, Discord, Slack and any app with a mic.

Built with **Astro** (static, zero JS shipped by default). The visual direction is *Aurora*: dark-only, geometric-neutral type (Geist + Geist Mono), green→cyan accent.

> **Naming note:** the product is referred to as **Parla** throughout (working name from the design handoff). The repo is `talkdub-landing` / DoblyTalk. Renaming is a follow-up — most user-facing copy lives in `public/scripts/i18n.js` plus the `.name` brand spans in the components.

## Stack

- **Astro 4** — static site generation, components, zero client JS by default
- **Vanilla CSS** — single global stylesheet (`src/styles/landing.css`), ~6.4 KB gzipped
- **Vanilla JS** — two small scripts in `public/scripts/` (`i18n.js`, `app.js`), loaded as-is
- **i18n** — runtime ES/EN switch via `data-i18n` attributes (default `es`, persisted to `localStorage`)

## Project structure

```
src/
├── layouts/
│   └── Base.astro          # <head>, fonts, aurora background, script loading
├── components/
│   ├── Nav.astro           # fixed top nav + language switch
│   ├── MobileSheet.astro   # fullscreen mobile menu
│   ├── Hero.astro          # headline + live translation console (waveform canvas)
│   ├── Integrations.astro  # "works where you already work" chips
│   ├── HowItWorks.astro    # three steps
│   ├── UseCases.astro      # bento grid
│   ├── Voice.astro         # voice-clone presets
│   ├── Languages.astro     # source/target matrix
│   ├── History.astro       # session history + MCP flow + export chips
│   ├── Pricing.astro       # billing toggle, 3 plans, credits band
│   ├── FinalCTA.astro      # whitelist form
│   └── Footer.astro
├── pages/
│   └── index.astro         # composes all sections
└── styles/
    └── landing.css         # design tokens + all component styles

public/scripts/
├── i18n.js                 # ES/EN dictionary + switcher (loads first)
└── app.js                  # nav scroll, mobile menu, pricing logic,
                            # credits slider, hero waveform, typing demo
```

The two scripts are intentionally kept as plain (`is:inline`) scripts so they run untouched, exactly as designed. `i18n.js` must load before `app.js` (which reads `window.i18n`).

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:4321
npm run build    # static build to dist/
npm run preview  # preview the production build
```

## Performance

Static HTML, no framework runtime. Build output: CSS ~6.4 KB gz, HTML ~9.4 KB gz. Fonts via Google Fonts with `display=swap` and `preconnect`. Respects `prefers-reduced-motion` (waveform freezes, reveals disable, typing demo shows static text).

## Source

Recreated from a Claude Design handoff bundle (`Parla - Landing v2.html`, Aurora direction). The original prototype lives in `_design_bundle/` (gitignored, reference only).
