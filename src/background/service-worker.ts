import type { ContentResponse, RuntimeMessage } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import { ensureContentScript } from '@/lib/content-script-inject';
import {
  getSettings,
  getUsage,
  incrementUsage,
  pushHistory,
} from '@/lib/storage';
import { evaluateQuota } from '@/lib/scan-limits';

type BgResponse =
  | { ok: true; result: ScanResult }
  | { ok: true; html: string }
  | { ok: true; selectors: Record<string, boolean> }
  | { ok: true }
  | { ok: false; error: string; reason?: 'quota' | 'runtime' };

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch(() => undefined);
});

async function messageTab<T extends ContentResponse>(
  tabId: number,
  message: unknown,
): Promise<T> {
  await ensureContentScript(tabId);
  return (await chrome.tabs.sendMessage(tabId, message)) as T;
}

function toError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
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
    const response = await messageTab<ContentResponse>(tabId, { type: 'RUN_SCAN' });

    if (!response.ok || !('result' in response)) {
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
      error: toError(error, 'Unable to scan this page (it may be a protected browser page).'),
    };
  }
}

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (r: BgResponse) => void) => {
    switch (message.type) {
      case 'RUN_SCAN':
        runScan(message.tabId).then(sendResponse);
        return true;
      case 'GET_PAGE_HTML':
        messageTab<ContentResponse>(message.tabId, { type: 'GET_PAGE_HTML' })
          .then((response) => sendResponse(response as BgResponse))
          .catch((error: unknown) =>
            sendResponse({
              ok: false,
              reason: 'runtime',
              error: toError(error, 'Unable to read this page.'),
            }),
          );
        return true;
      case 'VERIFY_SELECTORS':
        messageTab<ContentResponse>(message.tabId, {
          type: 'VERIFY_SELECTORS',
          selectors: message.selectors,
        })
          .then((response) => sendResponse(response as BgResponse))
          .catch((error: unknown) =>
            sendResponse({
              ok: false,
              reason: 'runtime',
              error: toError(error, 'Selector verification failed.'),
            }),
          );
        return true;
      case 'HIGHLIGHT_NODE':
        messageTab<ContentResponse>(message.tabId, {
          type: 'HIGHLIGHT_NODE',
          target: message.target,
          targets: message.targets,
          persist: message.persist,
        })
          .then((response) => sendResponse(response.ok ? { ok: true } : response))
          .catch((error: unknown) =>
            sendResponse({ ok: false, error: toError(error, 'Highlight failed.') }),
          );
        return true;
      case 'CLEAR_HIGHLIGHT':
        messageTab<ContentResponse>(message.tabId, {
          type: 'CLEAR_HIGHLIGHT',
          pinned: message.pinned,
        })
          .then(() => sendResponse({ ok: true }))
          .catch(() => sendResponse({ ok: true }));
        return true;
      case 'OPEN_SIDE_PANEL':
        chrome.sidePanel
          .open({ tabId: message.tabId })
          .then(() => sendResponse({ ok: true }))
          .catch((error: unknown) =>
            sendResponse({ ok: false, error: toError(error, 'Could not open side panel.') }),
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
