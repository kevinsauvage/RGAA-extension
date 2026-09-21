import { FREE_TIER_MONTHLY_SCANS } from './scan-limits';
import { t, type Language } from './i18n/messages';

export type ScanErrorReason = 'protected' | 'no_tab' | 'quota' | 'injection' | 'worker' | 'unknown';

export function classifyScanError(error: string, reason?: string): ScanErrorReason {
  if (reason === 'quota') return 'quota';
  const lower = error.toLowerCase();
  if (/chrome:\/\/|edge:\/\/|chrome-extension:\/\/|protected|cannot be scanned|cannot access contents|extension manifest must request permission|unsupported url/i.test(
    lower,
  )) {
    return 'protected';
  }
  if (/inject|content script|could not find|receiving end does not exist/i.test(lower)) {
    return 'injection';
  }
  if (/background worker|extension context invalidated/i.test(lower)) {
    return 'worker';
  }
  if (/no active tab/i.test(lower)) return 'no_tab';
  return 'unknown';
}

export function formatScanError(lang: Language, error: string, reason?: string): string {
  switch (classifyScanError(error, reason)) {
    case 'protected':
      return t(lang, 'errors.protectedPage');
    case 'no_tab':
      return t(lang, 'errors.noTab');
    case 'quota':
      return t(lang, 'errors.quota', { limit: FREE_TIER_MONTHLY_SCANS });
    case 'injection':
      return t(lang, 'errors.injection');
    case 'worker':
      return t(lang, 'errors.worker');
    default:
      return t(lang, 'errors.generic', { message: error });
  }
}

export function formatProtectedPageError(lang: Language): string {
  return t(lang, 'errors.protectedPage');
}
