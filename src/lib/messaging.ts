import type { ScanResult } from './types';

/**
 * Strongly-typed message contract passed between the popup / side panel,
 * the background service worker and the content script.
 */

/** Messages the side panel / popup send to the background worker. */
export type RuntimeMessage =
  | { type: 'RUN_SCAN'; tabId: number }
  | { type: 'GET_PAGE_HTML'; tabId: number }
  | { type: 'VERIFY_SELECTORS'; tabId: number; selectors: string[] }
  | { type: 'HIGHLIGHT_NODE'; tabId: number; target: string; targets?: string[]; persist?: boolean }
  | { type: 'CLEAR_HIGHLIGHT'; tabId: number; pinned?: boolean }
  | { type: 'OPEN_SIDE_PANEL'; tabId: number };

/** Messages the content script understands (dispatched via tabs.sendMessage). */
export type ContentMessage =
  | { type: 'PING' }
  | { type: 'RUN_SCAN' }
  | { type: 'GET_PAGE_HTML' }
  | { type: 'VERIFY_SELECTORS'; selectors: string[] }
  | { type: 'HIGHLIGHT_NODE'; target: string; targets?: string[]; persist?: boolean }
  | { type: 'CLEAR_HIGHLIGHT'; pinned?: boolean };

export type ContentResponse =
  | { ok: true; result: ScanResult }
  | { ok: true; html: string }
  | { ok: true; selectors: Record<string, boolean> }
  | { ok: false; error: string }
  | { ok: true };
