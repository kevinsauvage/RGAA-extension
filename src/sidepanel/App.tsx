import { useEffect, useState } from 'react';
import { getActiveTab, isScannable } from '@/lib/utils';
import { getSettings, getUsage } from '@/lib/storage';
import { evaluateQuota } from '@/lib/scan-limits';
import { exportReportPdf } from '@/lib/report/pdf';
import { usePanelStore } from './store';
import { SummaryCards } from './components/SummaryCards';
import { IssueCard } from './components/IssueCard';
import { PerformancePanel } from './components/PerformancePanel';

type Tab = 'accessibility' | 'performance';

export function App() {
  const {
    status,
    result,
    error,
    quota,
    setStatus,
    setResult,
    setError,
    setQuota,
  } = usePanelStore();
  const [tab, setTab] = useState<Tab>('accessibility');
  const [pageUrl, setPageUrl] = useState<string | undefined>();

  const refreshQuota = async () => {
    const [settings, usage] = await Promise.all([getSettings(), getUsage()]);
    setQuota(evaluateQuota(settings, usage));
  };

  useEffect(() => {
    void refreshQuota();
    void getActiveTab().then((t) => setPageUrl(t?.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scan = async () => {
    const activeTab = await getActiveTab();
    if (!activeTab?.id || !isScannable(activeTab.url)) {
      setError('This page cannot be scanned (browser-internal or unsupported URL).');
      return;
    }
    setStatus('scanning');
    setError(null);
    const response = (await chrome.runtime.sendMessage({
      type: 'RUN_SCAN',
      tabId: activeTab.id,
    })) as
      | { ok: true; result: import('@/lib/types').ScanResult }
      | { ok: false; error: string };

    if (response.ok) {
      setResult(response.result);
      setPageUrl(response.result.url);
    } else {
      setError(response.error);
    }
    void refreshQuota();
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Logo />
          <div>
            <h1 className="text-sm font-bold leading-tight">A11yFix AI</h1>
            <p className="text-[10px] text-slate-400">
              {quota?.unlimited
                ? 'Pro · unlimited scans'
                : quota
                  ? `${quota.remaining}/${quota.limit} scans left`
                  : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </button>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-2 truncate text-xs text-slate-400" title={pageUrl}>
          {pageUrl ?? 'No page selected'}
        </p>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={scan}
          disabled={status === 'scanning' || quota?.allowed === false}
        >
          {status === 'scanning' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
              Scanning…
            </>
          ) : (
            'Scan this page'
          )}
        </button>
        {quota?.allowed === false && (
          <p className="mt-2 text-center text-[11px] text-red-500">
            Monthly free limit reached — upgrade to Pro in Settings.
          </p>
        )}
      </div>

      <main className="flex-1 space-y-3 overflow-y-auto p-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {!result && status !== 'scanning' && !error && <EmptyState />}

        {result && (
          <>
            <SummaryCards result={result} />

            <div className="flex items-center justify-between">
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <TabButton
                  active={tab === 'accessibility'}
                  onClick={() => setTab('accessibility')}
                  label={`Accessibility (${result.accessibilityIssues.length})`}
                />
                <TabButton
                  active={tab === 'performance'}
                  onClick={() => setTab('performance')}
                  label={`Performance (${result.performanceIssues.length})`}
                />
              </div>
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() => exportReportPdf(result)}
                title="Export a client-ready PDF report"
              >
                Export PDF
              </button>
            </div>

            {tab === 'accessibility' ? (
              result.accessibilityIssues.length === 0 ? (
                <p className="rounded-lg bg-lime-50 px-3 py-4 text-center text-sm text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
                  No automated accessibility violations found. Manual RGAA
                  verification is still recommended.
                </p>
              ) : (
                result.accessibilityIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              )
            ) : (
              <PerformancePanel
                webVitals={result.webVitals}
                issues={result.performanceIssues}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white'
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Logo size={48} />
      <h2 className="mt-4 text-base font-semibold">Ready to audit</h2>
      <p className="mt-1 max-w-xs text-xs text-slate-500">
        Run a real-time RGAA/WCAG accessibility and Core Web Vitals scan on the
        current page, then get AI-powered fixes.
      </p>
    </div>
  );
}

function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-brand-600 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden="true"
    >
      A
    </div>
  );
}
