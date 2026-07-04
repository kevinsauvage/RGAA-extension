import { clsx, type ClassValue } from 'clsx';
import type { KnownIssueRef, PageCandidates } from '@/lib/types';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export async function collectCandidatesFromTab(
  knownIssues: KnownIssueRef[] = [],
): Promise<PageCandidates> {
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error('No active tab.');
  const response = (await chrome.runtime.sendMessage({
    type: 'COLLECT_CANDIDATES',
    tabId: tab.id,
    knownIssues,
  })) as
    | { ok: true; candidates: PageCandidates }
    | { ok: false; error: string };

  if (!response.ok || !('candidates' in response)) {
    throw new Error('error' in response ? response.error : 'Failed to analyze the page.');
  }
  return response.candidates;
}

export function isScannable(url: string | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url) || url.startsWith('file://');
}

export async function focusIssueOnPage(
  target: string,
  options: { targets?: string[]; persist?: boolean } = {},
): Promise<boolean> {
  const tab = await getActiveTab();
  if (!tab?.id) return false;
  const response = (await chrome.runtime.sendMessage({
    type: 'HIGHLIGHT_NODE',
    tabId: tab.id,
    target,
    targets: options.targets,
    persist: options.persist ?? true,
  })) as { ok: true } | { ok: false; error: string };
  return response.ok;
}

export async function highlightOnPage(target: string, targets?: string[]): Promise<void> {
  await focusIssueOnPage(target, { targets, persist: false });
}

export async function clearHighlightOnPage(pinned = false): Promise<void> {
  const tab = await getActiveTab();
  if (!tab?.id) return;
  try {
    await chrome.runtime.sendMessage({
      type: 'CLEAR_HIGHLIGHT',
      tabId: tab.id,
      pinned,
    });
  } catch {
    // ignore
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
