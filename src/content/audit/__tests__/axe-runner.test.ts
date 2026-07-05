import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setBodyHtml } from '../rules/__tests__/setup';
import { getAuditableDocuments } from '../audit-context';

const axeRun = vi.fn();

vi.mock('axe-core', () => ({
  default: { run: (...args: unknown[]) => axeRun(...args) },
}));

import { runAxeAudit } from '../axe-runner';

describe('runAxeAudit iframe integration', () => {
  beforeEach(() => {
    axeRun.mockReset();
    axeRun.mockResolvedValue({ violations: [] });
  });

  it('runs axe on every same-origin auditable document', async () => {
    setBodyHtml('<main>Top</main>');
    const outer = document.createElement('iframe');
    document.body.appendChild(outer);
    const inner = outer.contentDocument!.createElement('iframe');
    outer.contentDocument!.body.appendChild(inner);
    inner.contentDocument!.body.innerHTML = '<main>Nested</main>';

    const documents = getAuditableDocuments();
    expect(documents).toHaveLength(3);

    await runAxeAudit();

    expect(axeRun).toHaveBeenCalledTimes(3);
    expect(axeRun.mock.calls[0]?.[0]).toBe(documents[0]);
    expect(axeRun.mock.calls[1]?.[0]).toBe(documents[1]);
    expect(axeRun.mock.calls[2]?.[0]).toBe(documents[2]);
  });

  it('tags iframe violations with a frame suffix id', async () => {
    setBodyHtml('');
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.contentDocument!.body.innerHTML = '<html lang=""></html>';

    axeRun
      .mockResolvedValueOnce({ violations: [] })
      .mockResolvedValueOnce({
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
    expect(issues[0]?.id).toBe('a11y-html-has-lang-frame1');
    expect(issues[0]?.source).toBe('axe');
  });
});
