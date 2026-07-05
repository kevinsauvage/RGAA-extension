import { useEffect, useMemo, useState } from 'react';
import type { IssueSource, KnownIssueRef, Severity } from '@/lib/types';
import {
  getActiveTab,
  getPageHtmlFromTab,
  isScannable,
  runScanOnActiveTab,
  verifySelectorsOnTab,
} from '@/lib/utils';
import { getSettings } from '@/lib/storage';
import { canUseProFeature, proFeatureMessage } from '@/lib/scan-limits';
import { exportReportPdf } from '@/lib/report/pdf';
import { runDeepScan } from '@/lib/ai/deep-scan';
import { Logo } from '@/components/Logo';
import { useQuota } from '@/hooks/useQuota';
import { usePanelStore } from './store';
import { SummaryCards } from './components/SummaryCards';
import { IssueCard } from './components/IssueCard';
import { PerformancePanel } from './components/PerformancePanel';
import {
  DeepScanProgress,
  IssueFilters,
  ScanToolbar,
} from './components/ScanToolbar';

type Tab = 'accessibility' | 'performance';
type SourceFilter = 'all' | 'auto' | 'ai';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

function matchesFilter(source: IssueSource, filter: SourceFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'auto':
      return source === 'axe' || source === 'rule';
    case 'ai':
      return source === 'ai';
    default: {
      const _exhaustive: never = filter;
      void _exhaustive;
      return true;
    }
  }
}

export function App() {
  const {
    status,
    result,
    error,
    aiAuditStatus,
    aiAuditProgress,
    aiAuditError,
    aiAuditInfo,
    setStatus,
    setResult,
    setError,
    setLanguage,
    setAiAuditStatus,
    setAiAuditProgress,
    setAiAuditError,
    setAiAuditInfo,
    mergeAiIssues,
  } = usePanelStore();
  const { quota, isPro, refresh: refreshQuota } = useQuota();
  const [tab, setTab] = useState<Tab>('accessibility');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [pageUrl, setPageUrl] = useState<string | undefined>();

  useEffect(() => {
    void getActiveTab().then((t) => setPageUrl(t?.url));
    void refreshQuota().then((settings) => setLanguage(settings.language));
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
    setSourceFilter('all');
    const response = await runScanOnActiveTab();

    if (response.ok && 'result' in response) {
      setResult(response.result);
      setPageUrl(response.result.url);
    } else {
      setError('error' in response ? response.error : 'Scan failed.');
    }
    const settings = await refreshQuota();
    setLanguage(settings.language);
  };

  const knownIssueRefs = (): KnownIssueRef[] =>
    (result?.accessibilityIssues ?? []).flatMap((issue) =>
      issue.nodes.map((node) => ({
        ruleId: issue.ruleId,
        selector: node.target,
        title: issue.title,
      })),
    );

  const runAiDeepScan = async () => {
    if (!result) return;
    const settings = await getSettings();
    if (!canUseProFeature(settings, 'deep_scan')) {
      setAiAuditError(proFeatureMessage('deep_scan'));
      setAiAuditStatus('error');
      return;
    }
    if (!settings.openaiApiKey) {
      setAiAuditError('Add an OpenAI API key in Settings to run the deep scan.');
      setAiAuditStatus('error');
      return;
    }

    setAiAuditStatus('running');
    setAiAuditError(null);
    setAiAuditInfo(null);

    try {
      const { html, styleSnippets } = await getPageHtmlFromTab();
      const scan = await runDeepScan(
        html,
        knownIssueRefs(),
        settings,
        verifySelectorsOnTab,
        setAiAuditProgress,
        styleSnippets,
      );
      mergeAiIssues(scan.issues);
      setAiAuditInfo({
        criteriaChecked: scan.criteriaChecked,
        found: scan.issues.length,
        rejected: scan.rejected,
      });
      setAiAuditStatus('done');
    } catch (err) {
      setAiAuditError(err instanceof Error ? err.message : String(err));
      setAiAuditStatus('error');
    } finally {
      setAiAuditProgress(null);
    }
  };

  const visibleIssues = useMemo(() => {
    if (!result) return [];
    return result.accessibilityIssues
      .filter((issue) => matchesFilter(issue.source, sourceFilter))
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [result, sourceFilter]);

  const counts = useMemo(() => {
    const issues = result?.accessibilityIssues ?? [];
    return {
      all: issues.length,
      auto: issues.filter((i) => i.source !== 'ai').length,
      ai: issues.filter((i) => i.source === 'ai').length,
    };
  }, [result]);

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

      <ScanToolbar
        pageUrl={pageUrl}
        status={status}
        quotaAllowed={quota?.allowed !== false}
        isPro={isPro}
        hasResult={Boolean(result)}
        aiAuditStatus={aiAuditStatus}
        deepScanTitle={
          isPro
            ? 'Full-page AI analysis against the RGAA criteria list — findings need manual review'
            : proFeatureMessage('deep_scan')
        }
        onScan={() => void scan()}
        onDeepScan={() => void runAiDeepScan()}
      />

      <DeepScanProgress
        progress={aiAuditProgress}
        status={aiAuditStatus}
        info={aiAuditInfo}
        error={aiAuditError}
        quotaBlocked={quota?.allowed === false}
        proRequired={Boolean(result && !isPro)}
      />

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

            {result.warnings && result.warnings.length > 0 && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {result.warnings.map((warning) => (
                  <p key={warning.code}>{warning.message}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <TabButton
                  active={tab === 'accessibility'}
                  onClick={() => setTab('accessibility')}
                  label={`Accessibility (${result.accessibilityIssues.length})`}
                />
                <TabButton
                  active={tab === 'performance'}
                  onClick={() => setTab('performance')}
                  label={`Perf (${result.performanceIssues.length})`}
                />
              </div>
              <button
                type="button"
                className="btn-ghost text-xs"
                disabled={!isPro}
                onClick={async () => {
                  const settings = await getSettings();
                  if (!canUseProFeature(settings, 'pdf_export')) {
                    setError(proFeatureMessage('pdf_export'));
                    return;
                  }
                  await exportReportPdf(result);
                }}
                title={isPro ? 'Export a client-ready PDF report' : proFeatureMessage('pdf_export')}
              >
                PDF
              </button>
            </div>

            {tab === 'accessibility' ? (
              <>
                <IssueFilters sourceFilter={sourceFilter} counts={counts} onChange={setSourceFilter} />

                {visibleIssues.length === 0 ? (
                  <p className="rounded-lg bg-lime-50 px-3 py-4 text-center text-sm text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
                    {result.accessibilityIssues.length === 0
                      ? 'No automated violations found. Run Deep scan for AI-assisted RGAA review.'
                      : 'No issues match this filter.'}
                  </p>
                ) : (
                  visibleIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
                )}
              </>
            ) : (
              <PerformancePanel webVitals={result.webVitals} issues={result.performanceIssues} />
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
        Run a real-time RGAA/WCAG accessibility and Core Web Vitals scan, then use Deep scan for
        AI-assisted RGAA review.
      </p>
    </div>
  );
}
