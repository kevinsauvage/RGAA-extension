# AGENTS.md — RGAA-extension (A11yFix AI)

Single source of truth for AI coding agents. Tool-specific files (`CLAUDE.md`) import this file; do not
duplicate rules there. Human-facing overview: [`README.md`](README.md). Backlog: [`todo.md`](todo.md).

## What this is

A Chrome extension (Manifest V3, Chrome 116+) that audits the current page against RGAA 4.1.2 / WCAG 2.1 AA
and samples Core Web Vitals. Three audit layers, from most to least certain:

1. **axe-core** on the live DOM, mapped to RGAA criteria (`confidence: certain`).
2. **Deterministic rules** in `src/content/audit/rules/` (`confidence: likely`).
3. **AI deep scan** through the user's own OpenAI key (`confidence: needs-review`).

## Stack

Node 24 (`.nvmrc`), npm, TypeScript strict, Vite + `@crxjs/vite-plugin`, React 19, Tailwind CSS 3, Zustand,
axe-core, jsPDF. Tests: Vitest + happy-dom (unit), Playwright (e2e against the built extension). Path alias
`@/*` → `src/*`.

## Commands (use these exactly)

```sh
npm ci
npm run dev             # Vite dev server with extension HMR
npm run typecheck       # tsc --noEmit
npm run lint            # ESLint
npm run format:check    # Prettier (npm run format to fix)
npm test                # Vitest, all unit tests
npx vitest run <path>   # one test file
npm run test:coverage   # coverage gate on src/content/audit/rules/**
npm run build           # icons + type-check + bundle into dist/
npm run test:e2e        # Playwright; needs dist/ (run build first) and a display
npm run docs            # regenerate docs/ and src/lib/rgaa/referential.json
```

Use `npm`, never `yarn`/`pnpm`/`bun`.

## Architecture

- `src/background/service-worker.ts` — orchestrates scans, quota, side panel. The only place that talks to
  both the UIs and the content script.
- `src/content/` — the content script. It is **never auto-injected**: the manifest lists a dummy match and
  `src/lib/content-script-inject.ts` injects it on demand through the scripting API. Keep it that way.
- `src/content/audit/` — axe runner, RGAA mapping, deterministic rules, DOM helpers, performance sampling.
  `audit-context.ts` makes rules run on the top document and same-origin iframes.
- `src/lib/messaging.ts` — the typed message contract (`RuntimeMessage`, `ContentMessage`). Every message
  between UI, background and content script is declared there; add a variant before sending a new one.
- `src/lib/ai/` — OpenAI transport, prompts, deep scan and fix generation. `src/lib/rgaa/` — coverage map and
  referential. `src/lib/storage.ts` — the only wrapper around `chrome.storage`.
- `src/sidepanel/`, `src/popup/`, `src/options/` — the three React UIs. UI strings live in
  `src/lib/i18n/messages.ts`.

## Adding or changing a deterministic rule

1. Write the check in the matching theme file under `src/content/audit/rules/` (it returns a `RuleFinding`
   or `null`; use `multiNodeFinding` from `shared.ts`).
2. Register it in `RGAA_RULE_REGISTRY` in `rules/index.ts` with an `rgaa-…` id.
3. Declare it in `src/lib/rgaa/coverage.ts` (`CRITERION_COVERAGE`), the single source of truth for coverage.
4. Add a unit test in `rules/__tests__/`, and for a rule that depends on real layout a pair of
   `e2e/fixtures/<rule>-present.html` / `-missing.html`.
5. Run `npm run docs` and commit the regenerated files. CI fails on drift.

Never edit `docs/coverage.md`, `docs/rgaa-criteria.md` or `src/lib/rgaa/referential.json` by hand: they are
generated.

## Conventions

- Rules read the **rendered** page (computed styles, visibility), not just markup. A rule must not report
  what axe-core already reports for the same criterion.
- AI findings are always `needs-review`. Never present them as certain, and validate the selectors the model
  returns against the page before showing them.
- No secrets at build time. The OpenAI key is entered by the user in Settings, stored in
  `chrome.storage.local`, and sent only to the OpenAI API. Do not add analytics or any other network call.
- Keep new permissions out of `src/manifest.config.ts` unless the feature cannot work without them.
- The content script has a 400 KB gzip budget enforced in CI: do not import UI code or large libraries into
  `src/content/`.
- Tests mock `chrome.*` with `src/test/chrome-mock.ts`.

## Definition of done

`npm run typecheck`, `npm run lint`, `npm run format:check`, the focused test, then `npm run test:coverage`
(thresholds: statements 80, branches 65, functions 95, lines 90 on the rules — never lower them) and
`npm run build`. Run `npm run docs` when coverage or the referential changed.

## Boundaries

- **Ask first:** new runtime dependencies, new manifest permissions or host permissions, changes to the
  message contract that break existing messages, billing or licensing work for the Pro tier.
- **Never:** commit an API key, send page content anywhere but the OpenAI API, hand-edit generated files,
  lower coverage thresholds, bypass the bundle budget.
