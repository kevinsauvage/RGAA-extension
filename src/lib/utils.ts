import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export async function getPageHtmlFromTab(): Promise<string> {
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error('No active tab.');
  const response = (await chrome.runtime.sendMessage({
    type: 'GET_PAGE_HTML',
    tabId: tab.id,
  })) as { ok: true; html: string } | { ok: false; error: string };

  if (!response.ok || !('html' in response)) {
    throw new Error('error' in response ? response.error : 'Failed to read the page HTML.');
  }
  return response.html;
}

export async function verifySelectorsOnTab(
  selectors: string[],
): Promise<Record<string, boolean>> {
  if (selectors.length === 0) return {};
  const tab = await getActiveTab();
  if (!tab?.id) throw new Error('No active tab.');
  const response = (await chrome.runtime.sendMessage({
    type: 'VERIFY_SELECTORS',
    tabId: tab.id,
    selectors,
  })) as { ok: true; selectors: Record<string, boolean> } | { ok: false; error: string };

  if (!response.ok || !('selectors' in response)) {
    throw new Error('error' in response ? response.error : 'Selector verification failed.');
  }
  return response.selectors;
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