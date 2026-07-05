import type { Settings } from './storage';

export const FREE_TIER_MONTHLY_SCANS = 10;

export type ProFeature = 'deep_scan' | 'ai_fix' | 'pdf_export';

export interface QuotaStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  unlimited: boolean;
}

const PRO_FEATURE_MESSAGES: Record<ProFeature, string> = {
  deep_scan:
    'The AI deep scan is a Pro feature. Enable Pro (preview) in Settings — billing will be added before public launch.',
  ai_fix:
    'AI fix generation is a Pro feature. Enable Pro (preview) in Settings — billing will be added before public launch.',
  pdf_export:
    'PDF export is a Pro feature. Enable Pro (preview) in Settings — billing will be added before public launch.',
};

export function isPro(settings: Settings): boolean {
  return settings.plan === 'pro';
}

export function canUseProFeature(settings: Settings, _feature: ProFeature): boolean {
  return isPro(settings);
}

export function proFeatureMessage(feature: ProFeature): string {
  return PRO_FEATURE_MESSAGES[feature];
}

export function evaluateQuota(settings: Settings, usage: { scans: number }): QuotaStatus {
  if (isPro(settings)) {
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
