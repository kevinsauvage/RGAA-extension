/**
 * Generates docs/rgaa-criteria.md and docs/coverage.md from referential.json
 * and src/lib/rgaa/coverage.ts.
 *
 * Usage: npx tsx scripts/generate-rgaa-docs.ts
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CRITERION_COVERAGE,
  computeCoverageStats,
  type CheckMethod,
} from '../src/lib/rgaa/coverage.ts';
import { RGAA_SOURCE_URL, RGAA_THEMES } from '../src/lib/rgaa/criteria.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

interface ReferentialCriterion {
  id: string;
  title: string;
  theme: number;
  tests: Array<{ id: string; title: string }>;
}

interface Referential {
  source: string;
  version: string;
  criteria: ReferentialCriterion[];
}

const referential = JSON.parse(
  readFileSync(resolve(root, 'src/lib/rgaa/referential.json'), 'utf8'),
) as Referential;

const stats = computeCoverageStats();

const METHOD_LABEL: Record<CheckMethod, string> = {
  axe: 'axe-core (certain)',
  rule: 'Deterministic rule (likely)',
  ai: 'AI deep scan (needs review)',
  manual: 'Manual audit',
};

function methodsFor(id: string): CheckMethod[] {
  return CRITERION_COVERAGE[id]?.methods ?? ['manual'];
}

function methodBadge(methods: CheckMethod[]): string {
  return methods.map((m) => METHOD_LABEL[m]).join(' · ');
}

// ── docs/rgaa-criteria.md ───────────────────────────────────────────────────

const criteriaLines: string[] = [
  '# RGAA 4.1.2 — Critères et tests',
  '',
  `Source officielle : [Critères et tests](${RGAA_SOURCE_URL})`,
  '',
  `> Généré automatiquement à partir du référentiel officiel (${referential.criteria.length} critères, ${referential.version}).`,
  `> Ne pas éditer manuellement — lancer \`npm run docs\` pour régénérer.`,
  '',
];

let currentTheme = 0;
for (const criterion of referential.criteria) {
  if (criterion.theme !== currentTheme) {
    currentTheme = criterion.theme;
    criteriaLines.push(`## ${currentTheme}. ${RGAA_THEMES[currentTheme] ?? 'Autre'}`, '');
  }
  const coverage = CRITERION_COVERAGE[criterion.id];
  const methods = methodsFor(criterion.id);
  criteriaLines.push(`### ${criterion.id} — ${criterion.title}`, '');
  criteriaLines.push(`**Couverture extension :** ${methodBadge(methods)}`, '');
  if (coverage?.rules?.length) {
    criteriaLines.push(`**Règles :** ${coverage.rules.join(', ')}`, '');
  }
  if (coverage?.axeRules?.length) {
    criteriaLines.push(`**Règles axe :** ${coverage.axeRules.join(', ')}`, '');
  }
  if (coverage?.note) {
    criteriaLines.push(`> ${coverage.note}`, '');
  }
  criteriaLines.push('**Tests :**', '');
  for (const test of criterion.tests) {
    criteriaLines.push(`- **${test.id}** — ${test.title}`);
  }
  criteriaLines.push('');
}

writeFileSync(resolve(root, 'docs/rgaa-criteria.md'), criteriaLines.join('\n'));

// ── docs/coverage.md ────────────────────────────────────────────────────────

const coverageLines: string[] = [
  '# RGAA coverage tracker',
  '',
  'How A11yFix AI checks each RGAA 4.1.2 criterion on a **single rendered page**.',
  '',
  `> Généré automatiquement — lancer \`npm run docs\` pour régénérer.`,
  '',
  '## Summary',
  '',
  '| Metric | Count | % |',
  '|--------|------:|--:|',
  `| Total criteria | ${stats.total} | 100% |`,
  `| Deterministic (axe + rules) | ${stats.automated} | ${stats.automatedPercent}% |`,
  `| + AI deep scan (needs review) | ${stats.aiAssisted} criteria also | — |`,
  `| Automated + AI reachable | ${Math.round(stats.automatedPlusAiPercent)} criteria | ${stats.automatedPlusAiPercent}% |`,
  `| Manual only | ${stats.manualOnly} | ${stats.manualPercent}% |`,
  '',
  '### How to read this',
  '',
  '- **axe-core** runs on the live DOM with computed styles (contrast, viewport, ARIA…). Findings are **certain**. Same-origin iframes are included.',
  '- **Deterministic rules** (`src/content/audit/rules/`) use the rendered page — visibility, computed CSS, keyboard reachability, open shadow roots, same-origin iframes. Findings are **likely**.',
  '- **AI deep scan** sends pruned HTML + criterion hints to the model. Findings are **needs-review** and require human confirmation.',
  '- **Manual** criteria need a human auditor, multi-page review, media playback, or interaction tests we do not automate yet.',
  '',
  '## By theme',
  '',
  '| Theme | Total | Automated | AI also | Manual only |',
  '|-------|------:|----------:|--------:|------------:|',
];

for (const [themeNum, themeStats] of Object.entries(stats.byTheme).sort(
  (a, b) => Number(a[0]) - Number(b[0]),
)) {
  const name = RGAA_THEMES[Number(themeNum)] ?? 'Autre';
  coverageLines.push(
    `| ${themeNum}. ${name} | ${themeStats.total} | ${themeStats.automated} | ${themeStats.ai} | ${themeStats.manual} |`,
  );
}

coverageLines.push('', '## Per-criterion matrix', '');
coverageLines.push(
  '| Criterion | Theme | Methods | Rules / axe | Note |',
  '|-----------|-------|---------|-------------|------|',
);

for (const criterion of referential.criteria) {
  const cov = CRITERION_COVERAGE[criterion.id];
  const methods = methodsFor(criterion.id).join(', ');
  const engines = [...(cov?.rules ?? []), ...(cov?.axeRules?.slice(0, 2) ?? [])].join(', ');
  const note = cov?.note?.slice(0, 60) ?? '';
  coverageLines.push(
    `| ${criterion.id} | ${RGAA_THEMES[criterion.theme] ?? ''} | ${methods} | ${engines} | ${note} |`,
  );
}

coverageLines.push(
  '',
  '## Architecture',
  '',
  '```',
  'Classic scan (automatic)',
  '├── axe-core          → WCAG/RGAA mapped violations (top doc + same-origin frames)',
  '└── rules/            → deterministic RGAA checks (open shadow roots + same-origin frames)',
  '',
  'Deep scan (on demand)',
  '└── AI + pruned HTML  → subjective / markup criteria',
  '```',
  '',
  '## Engine capabilities',
  '',
  '- **Same-origin iframes** — axe and custom rules recurse into nested frames.',
  '- **Open shadow DOM** — custom rules query through open shadow roots (Web Components).',
  '- **Cross-origin frames** — skipped with a scan warning in the side panel (RGAA theme 2).',
  '',
  'See **[todo.md](../todo.md)** for the full backlog.',
  '',
);

writeFileSync(resolve(root, 'docs/coverage.md'), coverageLines.join('\n'));

console.log('Generated docs/rgaa-criteria.md');
console.log('Generated docs/coverage.md');
console.log(
  `Coverage: ${stats.automatedPercent}% deterministic, ${stats.automatedPlusAiPercent}% with AI, ${stats.manualPercent}% manual-only`,
);
