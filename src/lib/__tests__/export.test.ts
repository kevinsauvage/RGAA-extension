import { describe, expect, it, vi, afterEach } from 'vitest';
import type { ScanResult } from '../types';
import { exportReportCsv, exportReportJson } from '../report/export';

const sampleResult: ScanResult = {
  id: 'scan-1',
  url: 'https://example.com/page',
  title: 'Example',
  timestamp: Date.parse('2026-07-05T12:00:00Z'),
  durationMs: 100,
  summary: { total: 1, critical: 0, serious: 1, moderate: 0, minor: 0, score: 90 },
  accessibilityIssues: [
    {
      id: 'a11y-1',
      kind: 'accessibility',
      ruleId: 'color-contrast',
      source: 'axe',
      confidence: 'certain',
      severity: 'serious',
      title: 'Low contrast',
      description: 'desc',
      userImpact: 'impact',
      rgaa: [{ criterion: '3.2', theme: 'Couleurs', wcag: ['1.4.3'] }],
      nodes: [{ target: 'p', html: '<p>text</p>' }],
    },
  ],
  performanceIssues: [],
  webVitals: { lcp: null, cls: null, ttfb: null, fcp: null },
};

describe('exportReportJson', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers a JSON download', () => {
    const click = vi.fn();
    const anchor = { click, href: '', download: '' } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    exportReportJson(sampleResult);
    expect(click).toHaveBeenCalled();
    expect(anchor.download).toContain('.json');
  });
});

describe('exportReportCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('triggers a CSV download', () => {
    const click = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({ click } as unknown as HTMLAnchorElement);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    exportReportCsv(sampleResult);
    expect(click).toHaveBeenCalled();
  });
});
