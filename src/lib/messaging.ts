import type { AiFix, ScanResult } from './types';

/**
 * Strongly-typed message contract passed between the popup / side panel,
 * the background service worker and the content script.
 */

export type RuntimeMessage =
  | { type: 'PING' }
  | { type: 'RUN_SCAN'; tabId: number }
  | { type: 'SCAN_STARTED'; tabId: number }
  | { type: 'SCAN_COMPLETE'; tabId: number; result: ScanResult }
  | { type: 'SCAN_FAILED'; tabId: number; error: string }
  | { type: 'HIGHLIGHT_NODE'; tabId: number; target: string }
  | { type: 'CLEAR_HIGHLIGHT'; tabId: number }
  | { type: 'REQUEST_AI_FIX'; issueId: string }
  | { type: 'AI_FIX_READY'; issueId: string; fix: AiFix }
  | { type: 'OPEN_SIDE_PANEL'; tabId: number };

/** Messages the content script understands (dispatched via tabs.sendMessage). */
export type ContentMessage =
  | { type: 'PING' }
  | { type: 'RUN_SCAN' }
  | { type: 'HIGHLIGHT_NODE'; target: string }
  | { type: 'CLEAR_HIGHLIGHT' };

export type ContentResponse =
  | { ok: true; result: ScanResult }
  | { ok: false; error: string }
  | { ok: true };

export function isRuntimeMessage(value: unknown): value is RuntimeMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as { type: unknown }).type === 'string'
  );
}
