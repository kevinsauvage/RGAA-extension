import type { ContentResponse, RuntimeMessage } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import { sendToTab, toError } from '@/lib/tab-messaging';
import { runScanForTab } from './run-scan';

type BgResponse =
  | { ok: true; result: ScanResult }
  | { ok: true; html: string; styleSnippets: string }
  | { ok: true; selectors: Record<string, boolean> }
  | { ok: true }
  | { ok: false; error: string; reason?: 'quota' | 'runtime' };

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => undefined);
});

async function runScan(tabId: number): Promise<BgResponse> {
  return runScanForTab(tabId);
}

function relayTabMessage(
  tabId: number,
  message: Parameters<typeof sendToTab>[1],
  fallback: string,
  sendResponse: (r: BgResponse) => void,
): void {
  sendToTab<ContentResponse>(tabId, message)
    .then((response) => sendResponse(response as BgResponse))
    .catch((error: unknown) =>
      sendResponse({ ok: false, reason: 'runtime', error: toError(error, fallback) }),
    );
}

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (r: BgResponse) => void) => {
    switch (message.type) {
      case 'RUN_SCAN':
        runScan(message.tabId).then(sendResponse);
        return true;
      case 'GET_PAGE_HTML':
        relayTabMessage(message.tabId, { type: 'GET_PAGE_HTML' }, 'Unable to read this page.', sendResponse);
        return true;
      case 'VERIFY_SELECTORS':
        relayTabMessage(
          message.tabId,
          { type: 'VERIFY_SELECTORS', selectors: message.selectors },
          'Selector verification failed.',
          sendResponse,
        );
        return true;
      case 'HIGHLIGHT_NODE':
        sendToTab<ContentResponse>(message.tabId, {
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
        sendToTab<ContentResponse>(message.tabId, {
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
