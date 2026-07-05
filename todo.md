# A11yFix AI — project backlog

Living task list for the RGAA/WCAG Chrome extension. Regenerate coverage stats with `npm run docs`.

**Last reviewed:** 2026-07-05

## Snapshot

| Area | Status |
|------|--------|
| Version | `0.1.0` |
| RGAA criteria | 106 (RGAA 4.1.2) |
| Deterministic coverage | **64 / 106** (~60%) — axe-core + 37 custom rules |
| + AI deep scan | **74 / 106** (~70%) — needs-review findings |
| Manual only | **32 / 106** (~30%) |
| Unit tests | 168+ passing (Vitest + happy-dom); coverage gate on rules |
| CI | typecheck, test, lint, format, build, docs drift, 400 KB gzip content-script budget |
| Pro tier | Preview toggle in Settings — **no billing wired up** |
| Browsers | Chrome MV3 only |

### Audit architecture (current)

```
Classic scan (automatic, free tier quota)
├── axe-core          → top document only, WCAG-tagged rules → RGAA mapping
└── rules/ (30)       → same-origin iframes via getAuditableDocuments()

Deep scan (on demand, Pro preview)
└── OpenAI + pruned HTML → subjective / markup criteria (evidence + selector validation)

Side panel
├── Issue list + filters (auto / AI)
├── Element highlighting
├── AI fix generation (Pro + API key)
├── Core Web Vitals panel
└── PDF export (Pro)
```

---

## P0 — Launch readiness

- [ ] **Chrome Web Store submission pack** — listing copy (FR + EN), screenshots, promo tile, category, single-purpose justification
- [ ] **Privacy policy page** — document what leaves the browser (OpenAI API calls, no other telemetry); link from store listing and Options
- [ ] **Decide monetization path** — ship as free + BYOK only, or integrate billing before public Pro launch
- [ ] **Production build checklist** — verify `npm run build` output, load unpacked in Chrome, smoke-test scan → highlight → AI fix → PDF on 2–3 real sites
- [ ] **Remove or gate dev-only Pro toggle** — replace preview toggle with real entitlement once billing exists, or document BYOK-only launch clearly in UI

---

## P1 — Audit engine & RGAA coverage

### Gaps in current engine

- [x] **Run axe-core inside same-origin iframes** — `axe-runner.ts` runs on every document from `getAuditableDocuments()`
- [x] **Recursive iframe traversal** — `getAuditableDocuments()` walks nested same-origin frames
- [x] **Shadow DOM / Web Components** — `auditQueryAll()` pierces open shadow roots; all custom rules migrated
- [x] **Cross-origin iframe UX** — scan warnings surfaced in side panel when frames are skipped
- [x] **Sync `docs/coverage.md` roadmap** — replaced stale roadmap with engine capabilities section (`npm run docs`)

### High-value new deterministic rules

Prioritize criteria that are automatable on a single rendered page but still manual-only:

- [x] **4.7 / 4.8** — `rgaa-media-identification`, `rgaa-media-alternative` (object/embed/animated SVG)
- [x] **7.2** — `rgaa-script-widget-alt` (ARIA widgets without accessible name)
- [x] **10.5** — `rgaa-bg-image-contrast` (text contrast when background-image is ignored)
- [x] **11.4** — `rgaa-label-proximity` (visual label without programmatic association)
- [x] **12.11** — `rgaa-tooltip-keyboard` (title/aria-describedby on non-focusable elements)
- [x] **13.7** — `rgaa-flash-content` (rapid CSS animation heuristic)

### Themes with lowest automation (manual-heavy)

| Theme | Manual only | Notes |
|-------|------------:|-------|
| Multimédia (4) | 9 | Playback, transcript quality, AT compatibility |
| Navigation (12) | 6 | Site-wide consistency, sitemap, search |
| Consultation (13) | 7 | Gestures, pointer cancellation, motion actuation |
| Images (1) | 4 | CAPTCHA, text-as-image |

Multi-page / interaction criteria (12.1–12.5, 11.3, 11.12) require a **site crawl mode** (see P2) — not solvable on a single tab scan alone.

---

## P2 — Product & UX

- [x] **Coverage dashboard in side panel** — RGAA coverage tab with theme breakdown and per-criterion list
- [x] **Criterion detail drawer** — official tests, method badges, RGAA link from coverage list
- [x] **Scan history** — last 10 scan summaries in `chrome.storage`; shown in popup and empty state
- [x] **Export formats** — JSON / CSV in addition to PDF via export menu
- [x] **Full UI i18n** — FR/EN message catalog; side panel, popup, and scan toolbar follow `settings.language`
- [x] **Accessibility of the extension itself** — `aria-live` scan status, `role="alert"` errors, progressbar, tab roles, focus on drawer close, `sr-only` live region
- [x] **Onboarding flow** — first-run banner with API key / Pro / privacy hints; dismiss persists in Settings
- [x] **Error states** — classified messages for quota, protected pages, injection failures, worker errors

---

## P3 — AI copilot

- [ ] **Deep scan cost controls** — token estimate before run, optional batch skip, model selection impact on price
- [ ] **Deep scan tests** — mock OpenAI responses; verify evidence/selector rejection path (`deep-scan.ts`)
- [ ] **AI fix tests** — mock `generateFix` / cache behavior (`client.ts`)
- [ ] **Prompt tuning** — reduce false positives on 6.1 (vague links), 9.3 (fake lists), 11.2 (label relevance) using real-site eval set
- [ ] **Alternative providers** — abstract `openai.ts` for Anthropic / local models (Settings already has custom model id)
- [ ] **Optional backend proxy** — hide API key from extension for team/enterprise (server-side key + rate limiting)

---

## P4 — Performance module

- [ ] **INP metric** — add Interaction to Next Paint where `PerformanceObserver` supports it
- [ ] **Actionable perf hints** — tie LCP element / CLS shift sources to DOM nodes (like accessibility highlighting)
- [ ] **Perf regression baseline** — compare vitals across rescans of the same URL in history

---

## Testing & quality

### Missing test coverage

- [x] `src/lib/ai/deep-scan.ts` — batch parsing, evidence validation, selector verification
- [x] `src/lib/ai/client.ts` — fix generation and error handling
- [x] `src/lib/report/pdf.ts` — smoke test PDF generation (no throw, expected sections)
- [x] `src/background/service-worker.ts` — quota gate, message relay (via `run-scan.ts` tests)
- [x] `src/lib/storage.ts` — month rollover resets usage counter
- [x] axe + iframe integration test — axe findings from framed content once implemented

### E2E

- [x] **Playwright extension harness** — load unpacked `dist/`, open side panel, run scan on fixture HTML pages
- [x] **Fixture page suite** — static HTML files covering each custom rule (pass + fail cases) for regression

### CI enhancements

- [x] **`npm run test:coverage` gate** — enforce minimum coverage on `src/content/audit/rules/`
- [x] **Dependabot / Renovate** — automated dependency PRs (axe-core, OpenAI-related deps)

---

## DevOps & distribution

- [ ] **Release GitHub Action** — tag → build → zip `dist/` artifact for store upload
- [ ] **Version bump workflow** — sync `package.json`, manifest, store listing
- [ ] **Firefox MV3 port** — evaluate `@crxjs` compatibility or web-ext build; adjust `browser.*` polyfill if needed
- [ ] **Edge Add-ons** — usually compatible with Chrome build; verify side panel API

---

## Documentation

- [ ] Keep **`docs/coverage.md`** and **`docs/rgaa-criteria.md`** in sync (`npm run docs` — enforced in CI)
- [ ] **User guide** — how to interpret confidence levels (certain / likely / needs-review)
- [ ] **Rule authoring guide** — how to add a rule: `rules/*.ts` → `index.ts` → `coverage.ts` → tests → `npm run docs`
- [ ] **CONTRIBUTING.md** — dev setup, test commands, PR expectations

---

## Technical debt

- [x] **Content script bundle size** — axe-core split into lazy chunk; entry loads axe-runner on first scan only
- [x] **Duplicate skip-link coverage** — `dedupeAccessibilityIssues()` merges axe `bypass`/`skip-link` with `rgaa-skip-link` (12.7)
- [x] **Highlight reliability** — shared `dom-resolve.ts` queries frames + open shadow roots (highlight + verifySelectors)
- [x] **Consolidate confidence display** — `ConfidenceBadge` + `pdfConfidenceLabel` (certain / likely / needs review)

---

## Done recently ✓

- [x] 37 deterministic RGAA rules (images, colors, presentation, forms, navigation, consultation, multimedia, scripts, tables, mandatory)
- [x] Same-origin iframe support for custom rules
- [x] AI deep scan with evidence + selector validation
- [x] AI fix generation with local cache
- [x] PDF export (Pro-gated)
- [x] Core Web Vitals collection (LCP, CLS, FCP, TTFB)
- [x] Free tier quota (10 scans/month) + Pro preview toggle
- [x] CI pipeline (typecheck, test, lint, format, build, docs drift, bundle budget)
- [x] RGAA referential parsing + auto-generated coverage docs
- [x] 196 unit tests + Playwright e2e harness

---

## How to use this file

1. Pick a section by priority (P0 → P4).
2. When completing audit work: update `src/lib/rgaa/coverage.ts`, add/adjust rules, run `npm run docs`.
3. Check off items here or move them to GitHub Issues for tracking.
