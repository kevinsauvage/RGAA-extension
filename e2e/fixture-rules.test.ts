import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkSkipLink } from '@/content/audit/rules/navigation';
import { checkSvgInformative } from '@/content/audit/rules/images';
import { checkLabelProximity } from '@/content/audit/rules/forms';
import { expectNoFinding, expectRule, setBodyHtml } from '@/content/audit/rules/__tests__/setup';

const FIXTURES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

function loadFixtureBody(name: string): string {
  const html = fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8');
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match?.[1]?.trim() ?? html;
}

describe('fixture HTML pages', () => {
  it('skip-link-missing.html fails RGAA 12.7', () => {
    setBodyHtml(loadFixtureBody('skip-link-missing.html'));
    expectRule(checkSkipLink(), 'rgaa-skip-link');
  });

  it('skip-link-present.html passes RGAA 12.7', () => {
    setBodyHtml(loadFixtureBody('skip-link-present.html'));
    expectNoFinding(checkSkipLink());
  });

  it('svg-informative-missing.html fails RGAA 1.1', () => {
    setBodyHtml(loadFixtureBody('svg-informative-missing.html'));
    expectRule(checkSvgInformative(), 'rgaa-svg-informative');
  });

  it('svg-informative-present.html passes RGAA 1.1', () => {
    setBodyHtml(loadFixtureBody('svg-informative-present.html'));
    expectNoFinding(checkSvgInformative());
  });

  it('form-label-proximity-missing.html fails RGAA 11.4', () => {
    setBodyHtml(loadFixtureBody('form-label-proximity-missing.html'));
    expectRule(checkLabelProximity(), 'rgaa-label-proximity');
  });

  it('form-label-proximity-present.html passes RGAA 11.4', () => {
    setBodyHtml(loadFixtureBody('form-label-proximity-present.html'));
    expectNoFinding(checkLabelProximity());
  });
});
