import referential from './referential.json';

const HTML_TAG_RE = /<[^>]+>/g;

function cleanTestTitle(title: string): string {
  return title.replace(HTML_TAG_RE, '').replace(/\s+/g, ' ').trim();
}

/** Condensed official RGAA test methodology for a criterion (from referential.json). */
export function officialMethodologyHint(criterionId: string, maxTests = 2): string {
  const entry = referential.criteria.find((criterion) => criterion.id === criterionId);
  if (!entry?.tests.length) return '';

  return entry.tests
    .slice(0, maxTests)
    .map((test) => cleanTestTitle(test.title))
    .join(' | ');
}

/** Merge AI scan hint with official RGAA test wording. */
export function enrichDeepScanHint(criterionId: string, baseHint: string): string {
  const official = officialMethodologyHint(criterionId);
  if (!official) return baseHint;
  return `${baseHint}\nOfficial RGAA checks: ${official}`;
}
