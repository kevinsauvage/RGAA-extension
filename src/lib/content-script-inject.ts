import type { ContentResponse } from '@/lib/messaging';

/** Built JS paths from the manifest (works in dev and production builds). */
export function getContentScriptFiles(): string[] {
  const entries = chrome.runtime.getManifest().content_scripts ?? [];
  return entries.flatMap((entry) => entry.js ?? []);
}

/** Inject the bundled content script when a tab was opened before the extension loaded. */
export async function ensureContentScript(tabId: number): Promise<void> {
  try {
    const res = (await chrome.tabs.sendMessage(tabId, { type: 'PING' })) as
      | ContentResponse
      | undefined;
    if (res && 'ok' in res && res.ok) return;
  } catch {
    // Not injected yet — inject the built bundle from the manifest.
  }

  const files = getContentScriptFiles();
  if (files.length === 0) {
    throw new Error('No content script registered in the extension manifest.');
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files,
  });
}
