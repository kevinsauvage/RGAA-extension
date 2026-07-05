import type { ContentResponse } from '@/lib/messaging';

/** Built JS paths from the manifest (works in dev and production builds). */
export function getContentScriptFiles(): string[] {
  const entries = chrome.runtime.getManifest().content_scripts ?? [];
  return entries.flatMap((entry) => entry.js ?? []);
}

const PING_TIMEOUT_MS = 10_000;
const PING_INTERVAL_MS = 50;

async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    const res = (await chrome.tabs.sendMessage(tabId, { type: 'PING' })) as
      | ContentResponse
      | undefined;
    return !!(res && 'ok' in res && res.ok);
  } catch {
    return false;
  }
}

/** Wait until the CRXJS loader finishes importing the content script bundle. */
async function waitForContentScript(tabId: number): Promise<void> {
  const deadline = Date.now() + PING_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await pingContentScript(tabId)) return;
    await new Promise((resolve) => setTimeout(resolve, PING_INTERVAL_MS));
  }
  throw new Error(
    'The audit script did not start in time. Reload the page and try again.',
  );
}

/** Inject the bundled content script when a tab was opened before the extension loaded. */
export async function ensureContentScript(tabId: number): Promise<void> {
  if (await pingContentScript(tabId)) return;

  const files = getContentScriptFiles();
  if (files.length === 0) {
    throw new Error('No content script registered in the extension manifest.');
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to inject the audit script on this page.';
    throw new Error(message, { cause: error });
  }

  await waitForContentScript(tabId);
}
