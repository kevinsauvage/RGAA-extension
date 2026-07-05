# A11yFix AI — Project TODO

Living backlog for the RGAA Chrome extension. Update this file when closing items or shifting priorities.

**Current baseline** (see [docs/coverage.md](docs/coverage.md)):

| Metric                               |          Value |
| ------------------------------------ | -------------: |
| RGAA 4.1.2 criteria                  |            106 |
| Deterministic coverage (axe + rules) | **53.8%** (57) |
| + AI deep scan                       | **63.2%** (67) |
| Manual only                          |     36.8% (39) |
| Deterministic rules implemented      |             30 |
| Rule unit tests                      |            136 |

---

## Architecture decisions

Decisions to **document** (in code comments or `docs/architecture.md`) and **enforce** in refactors.

### ADR-1 — Three-layer audit pipeline (keep)

```
Classic scan (automatic, free-tier counted)
├── axe-core          → WCAG violations, mapped to RGAA (confidence: certain)
└── rules/            → deterministic RGAA on live DOM (confidence: likely)

Deep scan (on demand, OpenAI)
└── deep-scan.ts      → pruned HTML + criterion hints (confidence: needs-review)
```

- **Do not** merge layers into one score without labeling confidence.
- **Do not** present AI findings as confirmed violations.

### ADR-2 — Single source of truth for coverage (implemented)

Today coverage is split across three hand-maintained files:

| File                                | Role                                                |
| ----------------------------------- | --------------------------------------------------- |
| `src/lib/rgaa/coverage.ts`          | Per-criterion method map (axe / rule / ai / manual) |
| `src/content/audit/rgaa-mapping.ts` | axe rule id → RGAA criterion                        |
| `src/lib/rgaa/criteria.ts`          | AI deep-scan criterion hints                        |

**Decision:** `coverage.ts` is authoritative. CI test in `src/lib/rgaa/coverage.test.ts` validates:

- Every `rules[]` in coverage exists in `rules/index.ts`
- Every implemented rule is declared in coverage
- Every `axeRules[]` entry exists in `AXE_TO_RGAA`
- Every `methods: ['ai']` criterion has a `DEEP_SCAN_CRITERIA` entry (and vice versa for AI-only)

### ADR-3 — Rule registry (implemented)

Replace the manual `RULE_CHECKS[]` array in `rules/index.ts` and the hardcoded list in `rules/__tests__/index.test.ts` with a registry:

```ts
interface RgaaRule {
  id: string; // e.g. 'rgaa-skip-link'
  criterion: string; // e.g. '12.7'
  check: () => RuleFinding | null;
}
```

`runRgaaRules()` iterates the registry. Tests derive the rule list from it.

### ADR-4 — Content script injection strategy (implemented)

**Current:** On-demand injection via `ensureContentScript()`; manifest uses a non-matching URL so the content script is never auto-injected. axe-core is lazy-loaded in a separate chunk (~158 KB gzip).

### ADR-5 — Where OpenAI calls run (to decide)

**Current:** Side panel calls OpenAI directly (deep scan + AI fixes). API key stored in `chrome.storage.local`.

**Options:**

- Keep in side panel (simple, user sees errors inline)
- Move to service worker (single network owner, easier rate limiting)
- Optional backend proxy (hide key, enable Pro billing) — needed for real monetization

**Recommendation:** Service worker for API calls before public launch; backend proxy when Pro billing ships.

### ADR-6 — Scoring model (to document)

`scan-summary.ts` uses a penalty heuristic (`100 - penalty * 1.5`). Document that:

- Score reflects **automated** findings only
- AI `needs-review` items must not affect score until confirmed
- Full RGAA compliance always requires manual audit

---

## P0 — Release blockers

- [x] **CI pipeline** — GitHub Actions: `npm ci` → `typecheck` → `test` → `docs` (fail if drift) → `lint` → `format:check` → `build` → content-script gzip budget (400 KB)
- [x] **Lint tooling** — ESLint + Prettier configs, devDependencies, violations fixed
- [x] **Coverage sync test** — `src/lib/rgaa/coverage.test.ts` validates coverage ↔ rules ↔ axe mapping ↔ deep-scan criteria (ADR-2)
- [x] **Pro tier honesty** — Pro is a preview toggle in Settings; no $12/mo claims; README updated
- [x] **Quota consistency** — Pro gates for deep scan, AI fixes, and PDF; classic scan 10/month free
  - [x] Classic scan: 10/month free
  - [x] Deep scan: Pro preview gate
  - [x] AI fix generation: Pro preview gate
  - [x] PDF export: Pro preview gate
- [x] **Bundle size** — content script ~10 KB gzip (axe lazy-loaded in separate chunk); on-demand injection (ADR-4)
- [x] **Real icons** — accessibility silhouette on brand blue via `scripts/generate-icons.mjs`

---

## P1 — RGAA coverage (deterministic rules)

Official roadmap from [docs/coverage.md](docs/coverage.md). Implement on **live rendered DOM** with Vitest tests for each.

### High impact (single-page, interaction)

- [x] **12.9** — keyboard trap detection (programmatic tab through focusables, detect cycles)
- [x] **10.12** — text spacing override resistance (`letter-spacing`, `line-height`, `word-spacing` blocked by `!important`)
- [x] **10.13** — hover/focus overlay dismissibility (simulate focus/hover, check ESC, pointer leave)
- [x] **Same-origin iframes** — recurse into accessible frames in content script (`all_frames` or manual traversal)

### Medium impact (markup / computed style)

- [x] **11.8** — `<select>` options grouped with `<optgroup>` when visually grouped
- [x] **7.5** (partial) — dynamic status messages: detect updates without `role="status"` / `aria-live`
- [x] **11.11** (partial) — error fields with `aria-invalid` but no correction hint nearby
- [x] **13.2** (extend) — popup-on-load patterns beyond `target="_blank"` warning
- [x] **10.14** (partial) — CSS-only interactive content keyboard reachability
- [x] **4.11** (partial) — media player control focusability (not full playback test)
- [x] **1.2** (deterministic partial) — decorative images with non-empty `alt` / missing `aria-hidden`

### axe tuning

- [ ] Review `best-practice` tag in `axe-runner.ts` — may add non-RGAA noise
- [ ] Expand `user-impact.ts` beyond ~12 rules (or generate from coverage metadata)

### AI deep scan improvements

- [ ] Surface `rejected` count from `runDeepScan()` in UI (hallucinations dropped)
- [ ] Improve hints in `criteria.ts` using official test methodologies from `docs/rgaa-criteria.md`
- [ ] Batch sizing / token budget telemetry when HTML is large
- [ ] Optional: send computed-style snippets for criteria AI struggles with (contrast adjacency, not full contrast calc)

---

## P1 — Code quality & DRY

### Refactors

- [ ] **Rule registry** — implement ADR-3; remove `rgaa-rules.ts` deprecated shim
- [ ] **Split `rules/forms.ts`** — move 12.7, 13.2, 13.3 to `rules/navigation.ts` and `rules/consultation.ts`
- [ ] **Shared OpenAI transport** — merge duplicate fetch/parse in `deep-scan.ts` and `client.ts` via `lib/ai/openai-fetch.ts`
- [ ] **Shared UI components** — extract `Logo` from `App.tsx` / `Popup.tsx` / `Options.tsx` → `src/components/Logo.tsx`
- [ ] **Shared quota hook** — `useQuota()` for `App.tsx` and `Popup.tsx`
- [ ] **Messaging helper** — DRY tab message dispatch in `service-worker.ts` and `utils.ts`
- [ ] **Split `App.tsx`** — extract `ScanToolbar`, `IssueFilters`, `DeepScanProgress` as components when adding features

### Dead / incomplete code

- [ ] **Scan history** — `pushHistory()` stores 20 scans in `storage.ts` but no UI; build history panel or remove writes
- [ ] **`computeCoverageStats()`** — only used by doc generation; expose in side panel or keep docs-only intentionally
- [ ] **INP metric** — typed in `types.ts`, always `null` in `performance.ts`; implement or remove from UI/types
- [ ] **Side panel PDF deps** — jsPDF bundle pulls `html2canvas` + `dompurify` transitively; audit `lib/report/pdf.ts` imports, dynamic-import PDF module

---

## P2 — Features

### Core audit UX

- [ ] **Coverage dashboard** in side panel — show 46%/56% stats, link to criterion docs
- [ ] **Scan history UI** — list past scans, compare scores, re-open results
- [ ] **Criterion detail panel** — on issue click, show official test methodology from referential
- [ ] **Issue grouping** — group by RGAA criterion / severity / source
- [ ] **Export JSON** — machine-readable audit report for CI integration
- [ ] **i18n** — UI strings FR/EN (settings has `language` but side panel is mostly English); PDF labels too

### AI copilot

- [ ] **AI fix for rule findings** — ensure `AIFixPanel` works for `source: 'rule'` issues
- [ ] **Deep scan cancel** — abort in-flight OpenAI requests
- [ ] **Model cost hint** — show estimated cost per deep scan in Settings
- [ ] **Cache deep scan results** per URL hash to avoid re-spend

### Performance audit

- [ ] **Actionable perf fixes** — link perf issues to MDN/fix suggestions (like accessibility AI fixes)
- [ ] **Resource waterfall summary** — top N heavy assets from Performance API
- [ ] **Lab vs field note** — clarify extension metrics are lab-style, not CrUX

### Pro / monetization (when ready)

- [ ] Stripe or Chrome Web Store subscription integration
- [ ] License key validation (or backend token)
- [ ] Team/agency mode — client name on PDF, white-label logo

### Developer experience

- [ ] **Fixture pages** — local HTML fixtures under `test/fixtures/` for manual + E2E testing
- [ ] **CONTRIBUTING.md** — setup, test, docs regeneration, coverage update workflow
- [ ] **CHANGELOG.md** — keep a public changelog

---

## P2 — Testing

### Unit tests (Vitest + happy-dom)

**Done:** all 20 deterministic rules (105 tests).

**Still needed:**

| Module                | File                               | Priority                                            |
| --------------------- | ---------------------------------- | --------------------------------------------------- |
| Deep scan validation  | `lib/ai/deep-scan.ts`              | High — mock fetch, test evidence/selector filtering |
| Coverage sync         | `lib/rgaa/coverage.ts`             | High — ADR-2 validator                              |
| Page HTML serializer  | `content/audit/page-html.ts`       | Medium                                              |
| Accessible name       | `content/audit/accessible-name.ts` | Medium                                              |
| DOM utils             | `content/audit/dom-utils.ts`       | Medium                                              |
| axe → RGAA mapping    | `content/audit/rgaa-mapping.ts`    | Medium                                              |
| Performance collector | `content/audit/performance.ts`     | Medium                                              |
| AI fix client         | `lib/ai/client.ts`, `prompts.ts`   | Medium                                              |
| Scan limits / quota   | `lib/scan-limits.ts`               | Low                                                 |
| PDF export            | `lib/report/pdf.ts`                | Low                                                 |

### Integration / E2E

- [ ] **Extension smoke test** — Playwright + `chrome` launcher: load unpacked `dist/`, scan fixture page, assert issue count
- [ ] **Real browser rule tests** — supplement happy-dom for `getComputedStyle` / focus behavior (especially `presentation.ts`, `10.7`)
- [ ] **Expand Vitest coverage config** — currently scoped to `rules/**` only; add thresholds per layer

---

## P3 — Tooling & DevOps

- [ ] **Pre-commit** — husky + lint-staged (typecheck + test on changed files)
- [ ] **Docs drift check in CI** — `npm run docs && git diff --exit-code docs/`
- [ ] **Bundle size budget** — fail CI if content-script > 400 KB gzipped (post lazy-load)
- [ ] **Release script** — `npm run pack` → zip `dist/` for Chrome Web Store
- [ ] **Dependabot / Renovate** — automated dependency updates
- [ ] **Sentry** (optional) — error tracking for production extension

---

## P3 — Polish & accessibility of the extension itself

- [ ] **Extension UI audit** — run A11yFix on side panel / options / popup (meta-dogfooding)
- [ ] **Keyboard navigation** in side panel issue list
- [ ] **Dark mode consistency** — verify all states (empty, error, loading)
- [ ] **Onboarding flow** — first-run tooltip: add API key, run first scan
- [ ] **Error recovery** — content script injection failure message with retry

---

## Theme priority matrix (where to invest next)

Themes with the most **manual-only** criteria — highest ROI for new rules:

| Theme            | Manual only | Suggested focus                                       |
| ---------------- | ----------: | ----------------------------------------------------- |
| 4. Multimédia    |       10/13 | Player controls, track presence (not content quality) |
| 12. Navigation   |        7/11 | Keyboard trap, skip links (done), tab order           |
| 10. Présentation |        8/14 | Text spacing, focus overlays, reflow at 320px         |
| 11. Formulaires  |        6/13 | optgroup, error hints, fieldset (partially done)      |
| 13. Consultation |        7/12 | Popup-on-load, motion (partially done)                |

**Fully automated themes** (maintain, don't over-invest): 3. Couleurs, 6. Liens, 2. Cadres.

---

## Quick reference — key files

| Area                  | Path                                 |
| --------------------- | ------------------------------------ |
| Content script entry  | `src/content/content-script.ts`      |
| Deterministic rules   | `src/content/audit/rules/`           |
| axe runner            | `src/content/audit/axe-runner.ts`    |
| RGAA axe mapping      | `src/content/audit/rgaa-mapping.ts`  |
| AI deep scan          | `src/lib/ai/deep-scan.ts`            |
| Coverage map          | `src/lib/rgaa/coverage.ts`           |
| Side panel UI         | `src/sidepanel/App.tsx`              |
| Background worker     | `src/background/service-worker.ts`   |
| Settings              | `src/options/Options.tsx`            |
| Manifest              | `src/manifest.config.ts`             |
| Coverage docs         | `docs/coverage.md`                   |
| RGAA referential docs | `docs/rgaa-criteria.md`              |
| Rule tests            | `src/content/audit/rules/__tests__/` |

---

## Workflow reminders

```bash
npm test              # run rule tests
npm run docs          # regenerate docs/coverage.md + docs/rgaa-criteria.md
npm run build         # typecheck + production bundle
```

When adding a deterministic rule:

1. Implement check in `src/content/audit/rules/`
2. Register in `rules/index.ts` (until registry exists)
3. Add Vitest cases in `rules/__tests__/`
4. Update `src/lib/rgaa/coverage.ts`
5. Run `npm run docs`
