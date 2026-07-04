# A11yFix AI — Accessibility & Performance Copilot

A Chrome extension (Manifest V3) that audits any webpage for **RGAA 4.1 / WCAG 2.1 AA**
accessibility violations and **Core Web Vitals** performance issues, then uses AI to
explain the real user impact and generate ready-to-paste code fixes.

- 🔍 **Classic audit** — DOM-level detection powered by [axe-core](https://github.com/dequelabs/axe-core), with every finding mapped to its RGAA criterion and WCAG success criteria.
- 🤖 **AI copilot** — one-click, markup-aware fixes and plain-language impact explanations via the OpenAI API.
- ⚡ **Performance insights** — LCP, CLS, FCP and TTFB sampling with prioritized findings.
- 📊 **Client-ready reports** — export a polished PDF audit in seconds.
- 🎯 **Free / Pro tiers** — 10 scans/month free; unlimited on Pro.

## Tech stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Bundler        | Vite + `@crxjs/vite-plugin` (MV3 HMR)    |
| UI             | React 19 + TypeScript + Tailwind CSS     |
| State          | Zustand                                  |
| Audit engine   | axe-core + custom RGAA mapping           |
| AI             | OpenAI Chat Completions (JSON mode)      |
| Reports        | jsPDF                                    |

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
│       ├── rgaa-rules.ts       # deterministic RGAA rules axe misses
│       ├── candidates.ts       # extracts elements for AI verification
│       ├── accessible-name.ts  # lightweight AccName computation
│       ├── dom-utils.ts        # selectors, visibility, context helpers
│       ├── user-impact.ts      # human-readable impact strings
│       └── performance.ts      # Core Web Vitals collection
├── lib/
│   ├── types.ts                # shared domain types
│   ├── messaging.ts            # typed message contracts
│   ├── storage.ts              # chrome.storage wrapper (settings/usage/history)
│   ├── scan-limits.ts          # free/pro quota logic
│   ├── utils.ts                # tab/highlight helpers
│   ├── ai/
│   │   ├── checks.ts           # AI verification checks (question + few-shot)
│   │   ├── audit-client.ts     # classification pipeline (OpenAI)
│   │   └── client.ts           # AI fix generation
│   ├── rgaa/criteria.ts        # RGAA themes + helper links
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
```

Load the generated `dist/` folder as an unpacked extension, or zip it for the
Chrome Web Store.

## How the audit works

The audit has three layers, from most to least deterministic:

1. **axe-core** — runs against the live DOM; every violation is mapped to its
   **RGAA criterion** via `rgaa-mapping.ts` and scored 0–100.
2. **Deterministic RGAA rules** (`rgaa-rules.ts`) — checks axe misses: missing
   skip link, `target="_blank"` without warning, document links without format
   indication, ungrouped radio buttons. Run with the classic scan, no AI.
3. **AI checks** (verification, not detection) — code extracts *candidates*
   (images with alt, links, buttons, form fields, page title) and the AI only
   answers one narrow question per check ("is this alt text relevant?") with a
   pass / fail / uncertain verdict. Few-shot examples anchor each judgment;
   only clear fails become issues. The AI never picks elements, criteria or
   severities — this keeps hallucinations structurally impossible.

Clicking **Generate AI fix** on any issue sends only the offending markup to
OpenAI and returns a ready-to-paste fix, cached locally. Criteria link to the
official [RGAA 4.1.2 referential](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/).

## Privacy

The OpenAI API key is entered per-user in Settings and stored in
`chrome.storage.local`. It is only sent in direct requests to the OpenAI API.
No audit data is sent anywhere else.

## Notes

- Automated tools catch ~30–40% of accessibility issues. A11yFix flags what it
  can detect and always recommends manual RGAA verification for full compliance.
- The `public/icons/*` PNGs are generated placeholders (`npm run icons`). Replace
  them with real branding before publishing.
