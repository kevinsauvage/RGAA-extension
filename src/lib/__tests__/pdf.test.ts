import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScanResult } from '../types';

const textCalls: string[] = [];

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(function MockJsPDF(this: {
    internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
    setFont: ReturnType<typeof vi.fn>;
    setFontSize: ReturnType<typeof vi.fn>;
    setFillColor: ReturnType<typeof vi.fn>;
    setTextColor: ReturnType<typeof vi.fn>;
    rect: ReturnType<typeof vi.fn>;
    splitTextToSize: ReturnType<typeof vi.fn>;
    text: ReturnType<typeof vi.fn>;
    addPage: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  }) {
    this.internal = { pageSize: { getWidth: () => 595, getHeight: () => 842 } };
    this.setFont = vi.fn();
    this.setFontSize = vi.fn();
    this.setFillColor = vi.fn();
    this.setTextColor = vi.fn();
    this.rect = vi.fn();
    this.splitTextToSize = vi.fn((text: string) => [text]);
    this.text = vi.fn((text: string) => {
      textCalls.push(text);
    });
    this.addPage = vi.fn();
    this.save = vi.fn();
  }),
}));

import { exportReportPdf } from '../report/pdf';

const sampleResult: ScanResult = {
  id: 'scan-pdf',
  url: 'https://example.com/report',
  title: 'Report page',
  timestamp: Date.parse('2026-07-05T12:00:00Z'),
  durationMs: 120,
  summary: { total: 2, critical: 0, serious: 1, moderate: 1, minor: 0, score: 85 },
  accessibilityIssues: [
    {
      id: 'a11y-1',
      kind: 'accessibility',
      ruleId: 'color-contrast',
      source: 'axe',
      confidence: 'certain',
      severity: 'serious',
      title: 'Low contrast',
      description: 'Text contrast is too low.',
      userImpact: 'Hard to read for low-vision users.',
      rgaa: [{ criterion: '3.2', theme: 'Couleurs', wcag: ['1.4.3'] }],
      nodes: [{ target: 'p', html: '<p>text</p>' }],
    },
    {
      id: 'a11y-2',
      kind: 'accessibility',
      ruleId: 'ai-deep-9.3',
      source: 'ai',
      confidence: 'needs-review',
      severity: 'moderate',
      title: 'Suspicious list',
      description: 'Possible fake list.',
      userImpact: 'Screen reader list semantics may be wrong.',
      rgaa: [{ criterion: '9.3', theme: 'Structure', wcag: [] }],
      nodes: [{ target: 'ul', html: '<ul><li>A</li></ul>' }],
    },
  ],
  performanceIssues: [
    {
      id: 'perf-1',
      kind: 'performance',
      metric: 'lcp',
      severity: 'moderate',
      title: 'LCP slow',
      description: 'Largest contentful paint exceeds target.',
      value: 3.2,
      unit: 's',
      threshold: 2.5,
    },
  ],
  webVitals: { lcp: 3200, cls: 0.05, ttfb: 180, fcp: 900 },
};

describe('exportReportPdf', () => {
  afterEach(() => {
    textCalls.length = 0;
    vi.clearAllMocks();
  });

  it('generates a PDF without throwing and writes expected sections', async () => {
    await expect(exportReportPdf(sampleResult)).resolves.toBeUndefined();

    expect(textCalls.some((text) => text.includes('A11yFix AI'))).toBe(true);
    expect(textCalls.some((text) => text.includes('Accessibility score'))).toBe(true);
    expect(textCalls.some((text) => text.includes('Confidence:'))).toBe(true);
    expect(textCalls.some((text) => text.includes('Accessibility findings'))).toBe(true);
    expect(textCalls.some((text) => text.includes('Performance findings'))).toBe(true);
    expect(textCalls.some((text) => text.includes('Certain · axe-core'))).toBe(true);
    expect(textCalls.some((text) => text.includes('Needs review · AI analysis'))).toBe(true);
  });
});
