const BLOCKED_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'chrome-untrusted://',
  'chrome-error://',
  'edge://',
  'extension://',
  'about:',
  'view-source:',
  'devtools://',
] as const;

/** Whether the URL can receive a content-script audit (normal web pages only). */
export function isScannable(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (BLOCKED_PREFIXES.some((prefix) => lower.startsWith(prefix))) return false;
  return /^https?:\/\//i.test(url) || url.startsWith('file://');
}
