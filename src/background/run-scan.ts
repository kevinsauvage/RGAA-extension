import type { ContentResponse } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import { sendToTab, toError } from '@/lib/tab-messaging';
import { getSettings, getUsage, incrementUsage } from '@/lib/storage';
import { evaluateQuota } from '@/lib/scan-limits';
import { isScannable } from '@/lib/scannable-url';

export type ScanRunResponse =
  | { ok: true; result: ScanResult }
  | { ok: false; error: string; reason?: 'quota' | 'runtime' };

/** Run a classic scan on a tab, enforcing free-tier quota. */
export async function runScanForTab(tabId: number): Promise<ScanRunResponse> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!isScannable(tab.url)) {
      return {
        ok: false,
        reason: 'runtime',
        error: 'This page cannot be scanned. Switch to a normal website tab and try again.',
      };
    }
  } catch {
    return { ok: false, reason: 'runtime', error: 'The target tab is no longer available.' };
  }

  const [settings, usage] = await Promise.all([getSettings(), getUsage()]);
  const quota = evaluateQuota(settings, usage);
  if (!quota.allowed) {
    return {
      ok: false,
      reason: 'quota',
      error: `Free tier limit reached (${quota.limit} scans this month). Upgrade to Pro for unlimited scans.`,
    };
  }

  try {
    const response = await sendToTab<ContentResponse>(tabId, { type: 'RUN_SCAN' });

    if (!response.ok || !('result' in response)) {
      const error = 'error' in response ? response.error : 'Scan failed.';
      return { ok: false, reason: 'runtime', error };
    }

    await incrementUsage();
    return { ok: true, result: response.result };
  } catch (error) {
    return {
      ok: false,
      reason: 'runtime',
      error: toError(error, 'Unable to scan this page (it may be a protected browser page).'),
    };
  }
}
