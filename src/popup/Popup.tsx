import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { useQuota } from '@/hooks/useQuota';
import { getSettings, getScanHistory, type ScanHistoryEntry } from '@/lib/storage';
import { t } from '@/lib/i18n/messages';
import { getActiveTab, isScannable, openSidePanelForTab } from '@/lib/utils';
import { formatProtectedPageError } from '@/lib/scan-errors';

export function Popup() {
  const { quota, hasApiKey } = useQuota();
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>();
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    void (async () => {
      const [activeTab, settings, scanHistory] = await Promise.all([
        getActiveTab(),
        getSettings(),
        getScanHistory(),
      ]);
      setTab(activeTab);
      setLanguage(settings.language);
      setHistory(scanHistory);
      document.documentElement.lang = settings.language;
    })();
  }, []);

  const tr = (key: string, vars?: Record<string, string | number>) => t(language, key, vars);

  const openPanel = async () => {
    if (!tab?.id) return;
    await openSidePanelForTab(tab.id);
    window.close();
  };

  const scannable = isScannable(tab?.url);

  return (
    <div className="w-80 bg-slate-50 p-4 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-2">
        <Logo size={32} />
        <div>
          <h1 className="text-sm font-bold">{tr('app.title')}</h1>
          <p className="text-[10px] text-slate-400">{tr('app.subtitle')}</p>
        </div>
      </div>

      <div className="card mb-3 p-3">
        <p className="truncate text-xs text-slate-500" title={tab?.url}>
          {tab?.url ?? tr('scan.noPage')}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          {quota?.unlimited
            ? tr('app.proUnlimited')
            : quota
              ? tr('app.scansLeft', { remaining: quota.remaining, limit: quota.limit })
              : '…'}
        </p>
      </div>

      <button
        type="button"
        className="btn-primary w-full"
        onClick={openPanel}
        disabled={!scannable}
      >
        {tr('scan.openPanel')}
      </button>
      {!scannable && (
        <p role="status" className="mt-2 text-center text-[11px] text-slate-400">
          {formatProtectedPageError(language)}
        </p>
      )}

      {!hasApiKey && (
        <p className="mt-3 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          {tr('popup.apiKeyHint')}
        </p>
      )}

      {history.length > 0 && (
        <div className="mt-3">
          <h2 className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
            {tr('scan.history')}
          </h2>
          <ul className="space-y-1" aria-label={tr('scan.history')}>
            {history.slice(0, 3).map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"
              >
                <span className="block truncate font-medium">{entry.title || entry.url}</span>
                <span className="text-slate-400">
                  {tr('scan.score', { score: entry.score })} · {entry.issueCount}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="btn-ghost mt-2 w-full text-xs"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        {tr('app.settings')}
      </button>
    </div>
  );
}
