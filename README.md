# A11yFix AI — Accessibility & Performance Copilot

A Chrome extension (Manifest V3) that audits any webpage for **RGAA 4.1 / WCAG 2.1 AA**
accessibility violations and **Core Web Vitals** performance issues, then uses AI to
explain the real user impact and generate ready-to-paste code fixes.

- 🔍 **Classic audit** — DOM-level detection powered by [axe-core](https://github.com/dequelabs/axe-core), with every finding mapped to its RGAA criterion and WCAG success criteria.
- 🤖 **AI copilot** — one-click, markup-aware fixes and plain-language impact explanations via the OpenAI API.
- ⚡ **Performance insights** — LCP, CLS, FCP and TTFB sampling with prioritized findings.
- 📊 **Client-ready reports** — export a polished PDF audit in seconds.
- 🎯 **Free / Pro tiers** — Free: 10 classic scans/month. Pro (preview): unlimited scans, deep scan, AI fixes, PDF export (billing not yet available).

## Tech stack

| Concern      | Choice                                |
| ------------ | ------------------------------------- |
| Bundler      | Vite + `@crxjs/vite-plugin` (MV3 HMR) |
| UI           | React 19 + TypeScript + Tailwind CSS  |
| State        | Zustand                               |
| Audit engine | axe-core + custom RGAA mapping        |
| AI           | OpenAI Chat Completions (JSON mode)   |
| Reports      | jsPDF                                 |

## Project structure

```
src/
├── manifest.config.ts          # MV3 manifest (typed)
├── background/
│   └── service-worker.ts       # scan orchestration, quota, side panel
├── content/
│   ├── content-script.ts       # runs the audit in the page
│   ├── highlight.ts            # on-page element highlighting
│   └── audit/
│       ├── axe-runner.ts       # axe-core runner + scoring
│       ├── rgaa-mapping.ts     # axe rule → RGAA/WCAG criteria
│       ├── rules/              # deterministic RGAA checks (registry in index.ts)
│       │   ├── images.ts       # SVG, canvas alternatives
│       │   ├── presentation.ts # text scaling, focus, hidden content
│       │   ├── navigation.ts   # skip links, keyboard traps
│       │   ├── consultation.ts # new-window warnings, popups
│       │   ├── forms.ts        # fieldsets, required fields
│       │   └── …
│       ├── page-html.ts        # pruned HTML serializer for deep scan
│       ├── accessible-name.ts  # lightweight AccName computation
│       ├── dom-utils.ts        # selectors, visibility, context helpers
│       ├── user-impact.ts      # human-readable impact strings
│       └── performance.ts      # Core Web Vitals collection
├── components/
│   ├── Logo.tsx                # shared extension mark
│   └── Spinner.tsx             # loading indicator
├── hooks/
│   └── useQuota.ts             # quota + Pro status for popup/panel
├── lib/
│   ├── types.ts                # shared domain types
│   ├── messaging.ts            # typed message contracts
│   ├── tab-messaging.ts        # background ↔ content script dispatch
│   ├── content-script-inject.ts # on-demand content script injection
│   ├── storage.ts              # chrome.storage wrapper (settings/usage)
│   ├── scan-limits.ts          # free/pro quota logic
│   ├── utils.ts                # tab helpers (scan, highlight, side panel)
│   ├── ai/
│   │   ├── openai.ts           # OpenAI Chat Completions transport
│   │   ├── deep-scan.ts        # full-page AI scan (needs-review findings)
│   │   ├── models.ts           # curated model list for Settings
│   │   └── client.ts           # AI fix generation
│   ├── rgaa/
│   │   ├── criteria.ts        # deep-scan criteria hints
│   │   ├── coverage.ts        # per-criterion check method map
│   │   └── referential.json   # parsed official RGAA tests
│   └── report/pdf.ts           # PDF export
├── sidepanel/                  # main results UI (React)
├── popup/                      # toolbar popup
├── options/                    # settings page
└── styles/globals.css          # Tailwind entry
```

## Getting started

```bash
npm install
npm run dev        # Vite dev server with HMR
```

Then load the extension:

1. Open `chrome://extensions`, enable **Developer mode**.
2. Click **Load unpacked** and select the `dist/` folder (run `npm run build` first) — or the Vite `dev` output.
3. Open the extension **Settings** and paste your OpenAI API key to enable AI fixes.

### Build for production

```bash
npm run build      # generates icons, type-checks, and bundles into dist/
npm test           # run deterministic rule tests (Vitest)
npm run test:watch # watch mode
```

Load the generated `dist/` folder as an unpacked extension, or zip it for the
Chrome Web Store.

See **[todo.md](todo.md)** for the project backlog (architecture, coverage, features, testing).

## How the audit works

The audit has three layers, from most to least deterministic:

1. **axe-core** — runs against the live DOM; every violation is mapped to its
   **RGAA criterion** via `rgaa-mapping.ts` and scored 0–100.
2. **Deterministic RGAA rules** (`src/content/audit/rules/`) — 30 checks on the
   **rendered page** using computed styles, visibility and DOM structure: text
   scaling, focus indicators, keyboard reachability, skip links, media captions,
   fieldset legends, etc. Run with the classic scan, no AI.
3. **AI deep scan** (`deep-scan.ts`) — sends pruned rendered HTML plus subjective
   RGAA criteria (alt relevance, vague links, fake lists…) to the model.
   Findings are **needs-review** only.

See **[docs/coverage.md](docs/coverage.md)** for the live coverage tracker
(currently **~54% deterministic**, **~56% with AI** on a single page) and
**[docs/rgaa-criteria.md](docs/rgaa-criteria.md)** for the full official test list.

Regenerate docs after changing `src/lib/rgaa/coverage.ts`:

```bash
npm run docs
```

Clicking **Generate AI fix** on any issue sends only the offending markup to
OpenAI and returns a ready-to-paste fix, cached locally. Criteria link to the
official [RGAA 4.1.2 referential](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/).

## Privacy

The OpenAI API key is entered per-user in Settings and stored in
`chrome.storage.local`. It is only sent in direct requests to the OpenAI API.
No audit data is sent anywhere else.

## Notes

- Automated tools cover **~54% of RGAA criteria deterministically** on a single
  page; **~56%** with the AI deep scan (needs manual confirmation). See
  [docs/coverage.md](docs/coverage.md). Full compliance always requires manual audit.
- The `public/icons/*` PNGs are generated by `npm run icons` (accessibility-themed mark on brand blue).
