import type { ContentResponse } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import {
  getSettings,
  getUsage,
  incrementUsage,
  pushHistory,
} from '@/lib/storage';
import { evaluateQuota } from '@/lib/scan-limits';

/** Messages the side panel / popup send to the background worker. */
type BgRequest =
  | { type: 'RUN_SCAN'; tabId: number }
  | { type: 'OPEN_SIDE_PANEL'; tabId: number };

type BgResponse =
  | { ok: true; result: ScanResult }
  | { ok: true }
  | { ok: false; error: string; reason?: 'quota' | 'runtime' };

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch(() => undefined);
});

/** Ensure the content script is present before messaging it. */
async function ensureContentScript(tabId: number): Promise<void> {
  try {
    const res = (await chrome.tabs.sendMessage(tabId, { type: 'PING' })) as
      | ContentResponse
      | undefined;
    if (res && 'ok' in res && res.ok) return;
  } catch {
    // Not injected yet — fall through and inject programmatically.
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['src/content/content-script.ts'],
  });
}

async function runScan(tabId: number): Promise<BgResponse> {
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
    await ensureContentScript(tabId);
    const response = (await chrome.tabs.sendMessage(tabId, {
      type: 'RUN_SCAN',
    })) as ContentResponse;

    if (!('ok' in response) || !response.ok || !('result' in response)) {
      const error = 'error' in response ? response.error : 'Scan failed.';
      return { ok: false, reason: 'runtime', error };
    }

    await incrementUsage();
    await pushHistory(response.result);
    return { ok: true, result: response.result };
  } catch (error) {
    return {
      ok: false,
      reason: 'runtime',
      error:
        error instanceof Error
          ? error.message
          : 'Unable to scan this page (it may be a protected browser page).',
    };
  }
}

chrome.runtime.onMessage.addListener(
  (message: BgRequest, _sender, sendResponse: (r: BgResponse) => void) => {
    switch (message.type) {
      case 'RUN_SCAN':
        runScan(message.tabId).then(sendResponse);
        return true;
      case 'OPEN_SIDE_PANEL':
        chrome.sidePanel
          .open({ tabId: message.tabId })
          .then(() => sendResponse({ ok: true }))
          .catch((error: unknown) =>
            sendResponse({
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        return true;
      default: {
        const _exhaustive: never = message;
        void _exhaustive;
        return false;
      }
    }
  },
);
