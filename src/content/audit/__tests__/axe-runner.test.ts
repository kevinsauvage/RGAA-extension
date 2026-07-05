import { beforeEach, describe, expect, it, vi } from 'vitest';

const axeRun = vi.fn();

vi.mock('axe-core', () => ({
  default: { run: (...args: unknown[]) => axeRun(...args) },
}));

import { runAxeAudit } from '../axe-runner';

describe('runAxeAudit', () => {
  beforeEach(() => {
    axeRun.mockReset();
    axeRun.mockResolvedValue({ violations: [] });
  });

  it('runs axe once on the top document (axe audits same-origin iframes internally)', async () => {
    await runAxeAudit();

    expect(axeRun).toHaveBeenCalledOnce();
    expect(axeRun.mock.calls[0]?.[0]).toBe(document);
    expect(axeRun.mock.calls[0]?.[1]).toMatchObject({
      resultTypes: ['violations'],
      runOnly: { type: 'tag' },
    });
  });

  it('maps axe violations to accessibility issues', async () => {
    axeRun.mockResolvedValue({
      violations: [
        {
          id: 'html-has-lang',
          impact: 'serious',
          help: 'Page must have a lang attribute',
          description: 'Missing lang',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/html-has-lang',
          nodes: [{ target: ['html'], html: '<html></html>', failureSummary: 'Fix lang' }],
        },
      ],
    });

    const issues = await runAxeAudit();
    expect(issues).toHaveLength(1);
    expect(issues[0]?.id).toBe('a11y-html-has-lang');
    expect(issues[0]?.source).toBe('axe');
  });
});
