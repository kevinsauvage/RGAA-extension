import { isScannable } from './scannable-url';

const SESSION_KEY = 'auditTab';

export interface AuditTabRef {
  tabId: number;
  url: string;
}

/** Remember which browser tab the side panel is auditing (survives Options/settings focus changes). */
export async function setAuditTab(tab: Pick<chrome.tabs.Tab, 'id' | 'url'>): Promise<void> {
  if (!tab.id) return;
  await chrome.storage.session.set({
    [SESSION_KEY]: { tabId: tab.id, url: tab.url ?? '' } satisfies AuditTabRef,
  });
}

export async function getAuditTabRef(): Promise<AuditTabRef | undefined> {
  const stored = await chrome.storage.session.get(SESSION_KEY);
  return stored[SESSION_KEY] as AuditTabRef | undefined;
}

/** Resolve the tab to audit — pinned session tab first, then active scannable tab. */
export async function getAuditTab(): Promise<chrome.tabs.Tab | undefined> {
  const ref = await getAuditTabRef();
  if (ref?.tabId) {
    try {
      const tab = await chrome.tabs.get(ref.tabId);
      if (tab.id && isScannable(tab.url)) {
        if (tab.url !== ref.url) {
          await setAuditTab(tab);
        }
        return tab;
      }
    } catch {
      // Tab was closed — fall through.
    }
  }

  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (active?.id && isScannable(active.url)) {
    await setAuditTab(active);
    return active;
  }

  return undefined;
}
