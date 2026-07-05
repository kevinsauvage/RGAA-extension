import { useCallback, useEffect, useState } from 'react';
import { getSettings, getUsage } from '@/lib/storage';
import { evaluateQuota, type QuotaStatus } from '@/lib/scan-limits';

export function useQuota() {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const refresh = useCallback(async () => {
    const [settings, usage] = await Promise.all([getSettings(), getUsage()]);
    setQuota(evaluateQuota(settings, usage));
    setIsPro(settings.plan === 'pro');
    setHasApiKey(Boolean(settings.openaiApiKey));
    return settings;
  }, []);

  useEffect(() => {
    // Hydrate quota from extension storage on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async storage read on mount
    void refresh();
  }, [refresh]);

  return { quota, isPro, hasApiKey, refresh };
}
