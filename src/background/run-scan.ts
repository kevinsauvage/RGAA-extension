import type { ContentResponse } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import { sendToTab, toError } from '@/lib/tab-messaging';
import { getSettings, getUsage, incrementUsage } from '@/lib/storage';
import { evaluateQuota } from '@/lib/scan-limits';

export type ScanRunResponse =
  | { ok: true; result: ScanResult }
  | { ok: false; error: string; reason?: 'quota' | 'runtime' };

/** Run a classic scan on a tab, enforcing free-tier quota. */
export async function runScanForTab(tabId: number): Promise<ScanRunResponse> {
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
