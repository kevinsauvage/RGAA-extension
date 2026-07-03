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
│       ├── user-impact.ts      # human-readable impact strings
│       └── performance.ts      # Core Web Vitals collection
├── lib/
│   ├── types.ts                # shared domain types
│   ├── messaging.ts            # typed message contracts
│   ├── storage.ts              # chrome.storage wrapper (settings/usage/history)
│   ├── scan-limits.ts          # free/pro quota logic
│   ├── utils.ts                # tab/highlight helpers
│   ├── ai/                     # OpenAI client + prompts
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

1. The **content script** runs axe-core against the live DOM and samples Core Web Vitals.
2. Each axe violation is mapped to its **RGAA criterion** and WCAG success criteria via `rgaa-mapping.ts`, and assigned a normalized severity and a composite 0–100 score.
3. Results stream to the **side panel**, where hovering a finding highlights the element on the page.
4. Clicking **Generate AI fix** sends only the offending markup to OpenAI and returns a JSON fix (explanation + code + rationale), cached locally.

## Privacy

The OpenAI API key is entered per-user in Settings and stored in
`chrome.storage.local`. It is only sent in direct requests to the OpenAI API.
No audit data is sent anywhere else.

## Notes

- Automated tools catch ~30–40% of accessibility issues. A11yFix flags what it
  can detect and always recommends manual RGAA verification for full compliance.
- The `public/icons/*` PNGs are generated placeholders (`npm run icons`). Replace
  them with real branding before publishing.
