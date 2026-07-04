import type { KnownIssueRef, PageCandidates, ScanResult } from './types';

/**
 * Strongly-typed message contract passed between the popup / side panel,
 * the background service worker and the content script.
 */

/** Messages the side panel / popup send to the background worker. */
export type RuntimeMessage =
  | { type: 'RUN_SCAN'; tabId: number }
  | { type: 'COLLECT_CANDIDATES'; tabId: number; knownIssues?: KnownIssueRef[] }
  | { type: 'HIGHLIGHT_NODE'; tabId: number; target: string; targets?: string[]; persist?: boolean }
  | { type: 'CLEAR_HIGHLIGHT'; tabId: number; pinned?: boolean }
  | { type: 'OPEN_SIDE_PANEL'; tabId: number };

/** Messages the content script understands (dispatched via tabs.sendMessage). */
export type ContentMessage =
  | { type: 'PING' }
  | { type: 'RUN_SCAN' }
  | { type: 'COLLECT_CANDIDATES'; knownIssues?: KnownIssueRef[] }
  | { type: 'HIGHLIGHT_NODE'; target: string; targets?: string[]; persist?: boolean }
  | { type: 'CLEAR_HIGHLIGHT'; pinned?: boolean };

export type ContentResponse =
  | { ok: true; result: ScanResult }
  | { ok: true; candidates: PageCandidates }
  | { ok: false; error: string }
  | { ok: true };
