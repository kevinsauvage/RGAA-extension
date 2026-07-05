import type { AiFix, ScanResult } from './types';
import { DEFAULT_OPENAI_MODEL } from './ai/models';

/**
 * Thin typed wrapper over chrome.storage. Settings (including the API key),
 * and the fix cache live in `local`; the monthly usage counter lives in `sync`.
 */

export interface Settings {
  openaiApiKey: string;
  model: string;
  language: 'fr' | 'en';
  plan: 'free' | 'pro';
  /** First-run onboarding banner dismissed. */
  onboardingDismissed?: boolean;
}

/** Lightweight scan summary for history (no full issue payloads). */
export interface ScanHistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  score: number;
  issueCount: number;
}

export interface UsageState {
  /** Month key like "2026-07" used to reset the free-tier counter. */
  monthKey: string;
  scans: number;
}

export const DEFAULT_SETTINGS: Settings = {
  openaiApiKey: '',
  model: DEFAULT_OPENAI_MODEL,
  language: 'fr',
  plan: 'free',
};

const SETTINGS_KEY = 'settings';
const USAGE_KEY = 'usage';
const FIX_CACHE_KEY = 'aiFixes';
const SCAN_HISTORY_KEY = 'scanHistory';
const MAX_SCAN_HISTORY = 10;

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] as Partial<Settings>) };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function getUsage(): Promise<UsageState> {
  const stored = await chrome.storage.sync.get(USAGE_KEY);
  const usage = stored[USAGE_KEY] as UsageState | undefined;
  const monthKey = currentMonthKey();
  if (!usage || usage.monthKey !== monthKey) {
    return { monthKey, scans: 0 };
  }
  return usage;
}

export async function incrementUsage(): Promise<UsageState> {
  const usage = await getUsage();
  const next: UsageState = { ...usage, scans: usage.scans + 1 };
  await chrome.storage.sync.set({ [USAGE_KEY]: next });
  return next;
}

export async function getCachedFix(issueId: string): Promise<AiFix | undefined> {
  const stored = await chrome.storage.local.get(FIX_CACHE_KEY);
  const cache = (stored[FIX_CACHE_KEY] as Record<string, AiFix>) ?? {};
  return cache[issueId];
}

export async function cacheFix(fix: AiFix): Promise<void> {
  const stored = await chrome.storage.local.get(FIX_CACHE_KEY);
  const cache = (stored[FIX_CACHE_KEY] as Record<string, AiFix>) ?? {};
  cache[fix.issueId] = fix;
  await chrome.storage.local.set({ [FIX_CACHE_KEY]: cache });
}

export async function getScanHistory(): Promise<ScanHistoryEntry[]> {
  const stored = await chrome.storage.local.get(SCAN_HISTORY_KEY);
  return (stored[SCAN_HISTORY_KEY] as ScanHistoryEntry[] | undefined) ?? [];
}

export async function pushScanHistory(result: ScanResult): Promise<void> {
  const entry: ScanHistoryEntry = {
    id: result.id,
    url: result.url,
    title: result.title,
    timestamp: result.timestamp,
    score: result.summary.score,
    issueCount: result.accessibilityIssues.length,
  };
  const history = await getScanHistory();
  const next = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, MAX_SCAN_HISTORY);
  await chrome.storage.local.set({ [SCAN_HISTORY_KEY]: next });
}

export async function dismissOnboarding(): Promise<void> {
  await saveSettings({ onboardingDismissed: true });
}
