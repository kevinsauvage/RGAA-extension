import { useEffect, useState } from 'react';
import { getSettings, getUsage } from '@/lib/storage';
import { evaluateQuota, type QuotaStatus } from '@/lib/scan-limits';
import { getActiveTab, isScannable } from '@/lib/utils';

export function Popup() {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>();
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    void (async () => {
      const [settings, usage, activeTab] = await Promise.all([
        getSettings(),
        getUsage(),
        getActiveTab(),
      ]);
      setQuota(evaluateQuota(settings, usage));
      setHasKey(Boolean(settings.openaiApiKey));
      setTab(activeTab);
    })();
  }, []);

  const openPanel = async () => {
    if (!tab?.id) return;
    await chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', tabId: tab.id });
    window.close();
  };

  const scannable = isScannable(tab?.url);

  return (
    <div className="w-80 bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold">A11yFix AI</h1>
          <p className="text-[10px] text-slate-400">Accessibility & Performance Copilot</p>
        </div>
      </div>

      <div className="card mb-3 p-3">
        <p className="truncate text-xs text-slate-500" title={tab?.url}>
          {tab?.url ?? 'No active page'}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          {quota?.unlimited
            ? 'Pro plan · unlimited scans'
            : quota
              ? `${quota.remaining} of ${quota.limit} free scans left this month`
              : 'Loading…'}
        </p>
      </div>

      <button
        type="button"
        className="btn-primary w-full"
        onClick={openPanel}
        disabled={!scannable}
      >
        Open A11yFix panel
      </button>
      {!scannable && (
        <p className="mt-2 text-center text-[11px] text-slate-400">This page can’t be scanned.</p>
      )}

      {!hasKey && (
        <p className="mt-3 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          Add an OpenAI API key in settings to unlock AI fixes.
        </p>
      )}

      <button
        type="button"
        className="btn-ghost mt-2 w-full text-xs"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        Settings
      </button>
    </div>
  );
}
