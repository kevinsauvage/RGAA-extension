import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installChromeMock } from '@/test/chrome-mock';
import {
  cacheFix,
  currentMonthKey,
  getCachedFix,
  getScanHistory,
  getSettings,
  getUsage,
  incrementUsage,
  pushScanHistory,
  saveSettings,
} from '../storage';
import type { ScanResult } from '../types';

describe('storage', () => {
  const chromeMock = installChromeMock();

  beforeEach(() => {
    chromeMock.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('merges settings with defaults', async () => {
    await saveSettings({ language: 'en' });
    const settings = await getSettings();
    expect(settings.language).toBe('en');
    expect(settings.plan).toBe('free');
  });

  it('resets usage counter on month rollover', async () => {
    chromeMock.sync.usage = { monthKey: '2026-06', scans: 9 };
    const usage = await getUsage();
    expect(usage).toEqual({ monthKey: '2026-07', scans: 0 });
  });

  it('increments usage within the same month', async () => {
    chromeMock.sync.usage = { monthKey: currentMonthKey(), scans: 2 };
    const next = await incrementUsage();
    expect(next.scans).toBe(3);
    expect(next.monthKey).toBe('2026-07');
  });

  it('caches and retrieves AI fixes', async () => {
    const fix = {
      issueId: 'issue-1',
      explanation: 'Add alt text',
      codeFix: '<img alt="Logo">',
      rationale: ['Screen readers need a label'],
      model: 'gpt-4o-mini',
      createdAt: Date.now(),
    };
    await cacheFix(fix);
    expect(await getCachedFix('issue-1')).toEqual(fix);
  });

  it('stores scan history capped at 10 entries', async () => {
    const makeResult = (id: string): ScanResult => ({
      id,
      url: `https://example.com/${id}`,
      title: id,
      timestamp: Date.now(),
      durationMs: 50,
      summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0, score: 100 },
      accessibilityIssues: [],
      performanceIssues: [],
      webVitals: { lcp: null, cls: null, ttfb: null, fcp: null },
    });

    for (let index = 0; index < 12; index += 1) {
      await pushScanHistory(makeResult(`scan-${index}`));
    }

    const history = await getScanHistory();
    expect(history).toHaveLength(10);
    expect(history[0]?.id).toBe('scan-11');
  });
});
