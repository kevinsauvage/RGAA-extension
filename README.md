# A11yFix AI

A Chrome extension (Manifest V3, Chrome 116+) that audits the page you're on for RGAA 4.1.2 and WCAG 2.1 AA issues and samples its Core Web Vitals. Findings come from [axe-core](https://github.com/dequelabs/axe-core) plus a set of custom RGAA checks, and each one is mapped to its RGAA criterion and WCAG success criterion. With an OpenAI key, it can also explain an issue in plain language and suggest a fix for the actual markup.

What it does:

- Audits with axe-core and custom RGAA rules (images, forms, navigation, focus, hidden content and more)
- Samples LCP, CLS, FCP, TTFB and INP
- Explains issues and suggests fixes through the OpenAI API
- Exports the audit as a PDF
- Has Free and Pro tiers. Free allows 10 scans a month; Pro is a preview and billing isn't built yet.

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
├── manifest.config.ts     # MV3 manifest (typed, version read from package.json)
├── background/            # service worker: scan orchestration, quota, side panel
├── content/
│   ├── content-script.ts  # runs the audit in the page (injected on demand)
│   ├── highlight.ts       # on-page element highlighting
│   └── audit/
│       ├── axe-runner.ts, axe-config.ts   # axe-core run and scoring
│       ├── rgaa-mapping.ts                # axe rule → RGAA/WCAG criteria
│       ├── audit-context.ts               # top document + same-origin iframes
│       ├── rules/                         # deterministic RGAA checks, registered in index.ts
│       ├── page-html.ts                   # pruned HTML serializer for the deep scan
│       └── performance.ts                 # Core Web Vitals collection
├── lib/
│   ├── types.ts, messaging.ts, tab-messaging.ts   # domain types and typed message contracts
│   ├── storage.ts, scan-limits.ts                 # chrome.storage wrapper, free/pro quota
│   ├── ai/                # OpenAI transport, prompts, deep scan, fix generation
│   ├── rgaa/              # coverage map, criteria hints, parsed referential (referential.json)
│   ├── i18n/              # UI messages
│   └── report/pdf.ts      # PDF export
├── sidepanel/, popup/, options/   # the three React UIs
├── components/, hooks/, styles/   # shared UI
└── test/chrome-mock.ts    # chrome.* mock for unit tests
e2e/                       # Playwright: loads dist/ in Chromium, HTML fixtures per rule
scripts/                   # icon generation, RGAA referential parser, docs generator
docs/                      # generated coverage tracker and criteria list
```

## Getting started

Requires Node 24 (`.nvmrc`) and npm.

```bash
npm ci
npm run dev        # Vite dev server with HMR
```

Then load the extension:

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `dist/` folder (`npm run build` creates it; `npm run dev` keeps it
   updated).
3. Open the extension **Settings** and paste your OpenAI API key to enable AI fixes and the deep scan.

There is no build-time configuration: `.env.example` documents that no secret is read from the environment.

## Commands

| Command                 | What it does                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run dev`           | Vite dev server with extension HMR                                          |
| `npm run build`         | Generate icons, type-check, bundle into `dist/`                             |
| `npm run typecheck`     | `tsc --noEmit`                                                              |
| `npm run lint`          | ESLint                                                                      |
| `npm run format:check`  | Prettier check (`npm run format` to fix)                                    |
| `npm test`              | Unit tests (Vitest + happy-dom)                                             |
| `npm run test:coverage` | Unit tests with the coverage gate                                           |
| `npm run test:e2e`      | Playwright against the built extension; run `npm run build` first           |
| `npm run docs`          | Re-parse the RGAA referential and regenerate `docs/` and `referential.json` |

CI (`.github/workflows/ci.yml`) runs all of the above on every push and pull request, fails if `npm run docs`
changes a committed file, and enforces a 400 KB gzip budget on the content script.

The e2e tests open a real (headed) Chromium with the extension loaded, so on a machine without a display they
need a virtual one (`xvfb-run -a npm run test:e2e`).

To publish, tag a version (`npm version patch && git push --follow-tags`): the release workflow builds the
extension and attaches the zip for the Chrome Web Store to a GitHub release.

See **[todo.md](todo.md)** for the backlog and **[AGENTS.md](AGENTS.md)** for the conventions AI coding agents
follow in this repository.

## How the audit works

The audit has three layers, from most to least deterministic:

1. **axe-core** — runs against the live DOM; every violation is mapped to its
   **RGAA criterion** via `rgaa-mapping.ts` and scored 0–100.
2. **Deterministic RGAA rules** (`src/content/audit/rules/`) — checks on the
   **rendered page** using computed styles, visibility and DOM structure: text
   scaling, focus indicators, keyboard reachability, skip links, media captions,
   fieldset legends, etc. Run with the classic scan, no AI.
3. **AI deep scan** (`deep-scan.ts`) — sends pruned rendered HTML plus subjective
   RGAA criteria (alt relevance, vague links, fake lists…) to the model.
   Findings are **needs-review** only.

See **[docs/coverage.md](docs/coverage.md)** for the generated coverage tracker
(64 of 106 criteria deterministic, about 70% reachable with the AI deep scan, on a single page) and
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
No audit data is sent anywhere else. The full account, including what the deep scan sends, is in
[docs/privacy.md](docs/privacy.md).

## Notes

- Automated checks cover about 60% of RGAA criteria deterministically on a single
  page, about 70% with the AI deep scan (which needs manual confirmation). The exact
  figures are in [docs/coverage.md](docs/coverage.md). Full compliance always requires a manual audit.
- The `public/icons/*` PNGs are generated by `npm run icons` (accessibility-themed mark on brand blue).

## License

All rights reserved. The code is published for viewing only. See [LICENSE](./LICENSE).
