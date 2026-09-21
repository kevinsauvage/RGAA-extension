import { clsx, type ClassValue } from 'clsx';
import type { ContentResponse } from './messaging';
import { getAuditTab } from './audit-tab';
import { sendRuntimeMessage } from './tab-messaging';

export { isScannable } from './scannable-url';
export { getAuditTab, setAuditTab } from './audit-tab';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export async function getPageHtmlFromTab(): Promise<{ html: string; styleSnippets: string }> {
  const tab = await getAuditTab();
  if (!tab?.id) throw new Error('No scannable tab.');
  const response = await sendRuntimeMessage<
    { ok: true; html: string; styleSnippets: string } | { ok: false; error: string }
  >({
    type: 'GET_PAGE_HTML',
    tabId: tab.id,
  });

  if (!response.ok || !('html' in response)) {
    throw new Error('error' in response ? response.error : 'Failed to read the page HTML.');
  }
  return { html: response.html, styleSnippets: response.styleSnippets ?? '' };
}

export async function verifySelectorsOnTab(selectors: string[]): Promise<Record<string, boolean>> {
  if (selectors.length === 0) return {};
  const tab = await getAuditTab();
  if (!tab?.id) throw new Error('No scannable tab.');
  const response = await sendRuntimeMessage<
    { ok: true; selectors: Record<string, boolean> } | { ok: false; error: string }
  >({
    type: 'VERIFY_SELECTORS',
    tabId: tab.id,
    selectors,
  });

  if (!response.ok || !('selectors' in response)) {
    throw new Error('error' in response ? response.error : 'Selector verification failed.');
  }
  return response.selectors;
}

export async function focusIssueOnPage(
  target: string,
  options: { targets?: string[]; persist?: boolean } = {},
): Promise<boolean> {
  const tab = await getAuditTab();
  if (!tab?.id) return false;
  const response = await sendRuntimeMessage<{ ok: true } | { ok: false; error: string }>({
    type: 'HIGHLIGHT_NODE',
    tabId: tab.id,
    target,
    targets: options.targets,
    persist: options.persist ?? true,
  });
  return response.ok;
}

export async function highlightOnPage(target: string, targets?: string[]): Promise<void> {
  await focusIssueOnPage(target, { targets, persist: false });
}

export async function clearHighlightOnPage(pinned = false): Promise<void> {
  const tab = await getAuditTab();
  if (!tab?.id) return;
  try {
    await sendRuntimeMessage({
      type: 'CLEAR_HIGHLIGHT',
      tabId: tab.id,
      pinned,
    });
  } catch {
    // ignore
  }
}

export async function openSidePanelForTab(tabId: number): Promise<void> {
  await sendRuntimeMessage({ type: 'OPEN_SIDE_PANEL', tabId });
}

export async function runScanOnActiveTab(): Promise<ContentResponse> {
  const tab = await getAuditTab();
  if (!tab?.id) {
    return { ok: false, error: 'No scannable tab found. Focus a normal web page and try again.' };
  }
  try {
    return await sendRuntimeMessage<ContentResponse>({ type: 'RUN_SCAN', tabId: tab.id });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unable to reach the extension background worker. Reload the extension and try again.',
    };
  }
}
