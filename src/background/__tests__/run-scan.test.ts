import { beforeEach, describe, expect, it, vi } from 'vitest';
import { installChromeMock } from '@/test/chrome-mock';
import { runScanForTab } from '../run-scan';
import type { ScanResult } from '@/lib/types';

vi.mock('@/lib/tab-messaging', () => ({
  sendToTab: vi.fn(),
  toError: (_error: unknown, fallback: string) => fallback,
}));

vi.mock('@/lib/storage', () => ({
  getSettings: vi.fn(),
  getUsage: vi.fn(),
  incrementUsage: vi.fn(),
}));

import { sendToTab } from '@/lib/tab-messaging';
import { getSettings, getUsage, incrementUsage } from '@/lib/storage';

const sampleResult: ScanResult = {
  id: 'scan-1',
  url: 'https://example.com',
  title: 'Example',
  timestamp: Date.now(),
  durationMs: 100,
  summary: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0, score: 100 },
  accessibilityIssues: [],
  performanceIssues: [],
  webVitals: { lcp: null, cls: null, ttfb: null, fcp: null },
};

describe('runScanForTab', () => {
  installChromeMock();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSettings).mockResolvedValue({
      openaiApiKey: '',
      model: 'gpt-4o-mini',
      language: 'en',
      plan: 'free',
    });
    vi.mocked(getUsage).mockResolvedValue({ monthKey: '2026-07', scans: 0 });
    vi.mocked(incrementUsage).mockResolvedValue({ monthKey: '2026-07', scans: 1 });
  });

  it('blocks scan when free-tier quota is exhausted', async () => {
    vi.mocked(getUsage).mockResolvedValue({ monthKey: '2026-07', scans: 10 });

    const response = await runScanForTab(42);
    expect(response).toEqual({
      ok: false,
      reason: 'quota',
      error: expect.stringContaining('Free tier limit reached'),
    });
    expect(sendToTab).not.toHaveBeenCalled();
  });

  it('allows unlimited scans for Pro users', async () => {
    vi.mocked(getSettings).mockResolvedValue({
      openaiApiKey: '',
      model: 'gpt-4o-mini',
      language: 'en',
      plan: 'pro',
    });
    vi.mocked(getUsage).mockResolvedValue({ monthKey: '2026-07', scans: 99 });
    vi.mocked(sendToTab).mockResolvedValue({ ok: true, result: sampleResult });

    const response = await runScanForTab(7);
    expect(response.ok).toBe(true);
    expect(incrementUsage).toHaveBeenCalled();
  });

  it('relays content-script failures', async () => {
    vi.mocked(sendToTab).mockResolvedValue({ ok: false, error: 'Injection failed.' });

    const response = await runScanForTab(3);
    expect(response).toEqual({ ok: false, reason: 'runtime', error: 'Injection failed.' });
    expect(incrementUsage).not.toHaveBeenCalled();
  });

  it('rejects unscannable extension pages before scanning', async () => {
    vi.mocked(chrome.tabs.get).mockResolvedValueOnce({
      id: 99,
      url: 'chrome-extension://abc/src/options/index.html',
    } as chrome.tabs.Tab);

    const response = await runScanForTab(99);
    expect(response).toEqual({
      ok: false,
      reason: 'runtime',
      error: expect.stringContaining('cannot be scanned'),
    });
    expect(sendToTab).not.toHaveBeenCalled();
  });
});
