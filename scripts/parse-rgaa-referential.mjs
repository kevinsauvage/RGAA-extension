/**
 * Parses the official RGAA 4.1.2 "Critères et tests" markdown export
 * into structured JSON used to generate docs/rgaa-criteria.md.
 *
 * Usage: node scripts/parse-rgaa-referential.mjs [input.md] [output.json]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const defaultInput = resolve(root, 'docs/source/criteres-et-tests.md');
const defaultOutput = resolve(root, 'src/lib/rgaa/referential.json');
const inputPath = resolve(process.argv[2] ?? defaultInput);
const outputPath = resolve(process.argv[3] ?? defaultOutput);

const md = readFileSync(inputPath, 'utf8');

const CRITERION_RE =
  /^\* ### (\d+\.\d+) (.+?)Critère \1\s/gm;

const TEST_RE = /^#### (\d+\.\d+\.\d+)\s*\n(.+?) Test \1/mg;

/** @type {Array<{ id: string; title: string; theme: number; tests: Array<{ id: string; title: string }> }>} */
const criteria = [];

for (const match of md.matchAll(CRITERION_RE)) {
  const id = match[1];
  const title = match[2].trim();
  const theme = Number(id.split('.')[0]);
  criteria.push({ id, title, theme, tests: [] });
}

// Attach tests to their parent criterion
for (const match of md.matchAll(TEST_RE)) {
  const testId = match[1];
  const testTitle = match[2].replace(/\s+/g, ' ').trim();
  const criterionId = testId.split('.').slice(0, 2).join('.');
  const criterion = criteria.find((c) => c.id === criterionId);
  if (criterion) {
    criterion.tests.push({ id: testId, title: testTitle });
  }
}

writeFileSync(
  outputPath,
  JSON.stringify(
    {
      source: 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/',
      version: '4.1.2',
      generatedFrom: inputPath,
      criteriaCount: criteria.length,
      criteria,
    },
    null,
    2,
  ),
);

console.log(`Parsed ${criteria.length} criteria → ${outputPath}`);
for (const c of criteria) {
  console.log(`  ${c.id} (${c.tests.length} tests)`);
}
