import type { ContentMessage, ContentResponse, RuntimeMessage } from './messaging';
import { ensureContentScript } from './content-script-inject';

function toError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Send a message to a tab's content script (injects the script if needed). */
export async function sendToTab<T extends ContentResponse>(
  tabId: number,
  message: ContentMessage,
): Promise<T> {
  await ensureContentScript(tabId);
  return (await chrome.tabs.sendMessage(tabId, message)) as T;
}

/** Send a message to the background service worker from a UI context. */
export async function sendRuntimeMessage<T>(message: RuntimeMessage): Promise<T> {
  return (await chrome.runtime.sendMessage(message)) as T;
}

export { toError };
