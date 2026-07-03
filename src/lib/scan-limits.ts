import type { Settings, UsageState } from './storage';

export const FREE_TIER_MONTHLY_SCANS = 10;

export interface QuotaStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  unlimited: boolean;
}

export function evaluateQuota(settings: Settings, usage: UsageState): QuotaStatus {
  if (settings.plan === 'pro') {
    return { allowed: true, remaining: Infinity, limit: Infinity, unlimited: true };
  }
  const remaining = Math.max(0, FREE_TIER_MONTHLY_SCANS - usage.scans);
  return {
    allowed: remaining > 0,
    remaining,
    limit: FREE_TIER_MONTHLY_SCANS,
    unlimited: false,
  };
}
