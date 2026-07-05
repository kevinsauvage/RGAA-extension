import { useEffect, useMemo, useState } from 'react';
import type { IssueSource, KnownIssueRef, ScanResult, Severity } from '@/lib/types';
import { getActiveTab, getPageHtmlFromTab, isScannable, verifySelectorsOnTab } from '@/lib/utils';
import { getSettings, getUsage } from '@/lib/storage';
import { evaluateQuota, canUseProFeature, proFeatureMessage } from '@/lib/scan-limits';
import { exportReportPdf } from '@/lib/report/pdf';
import { runDeepScan } from '@/lib/ai/deep-scan';
import { usePanelStore } from './store';
import { SummaryCards } from './components/SummaryCards';
import { IssueCard } from './components/IssueCard';
import { PerformancePanel } from './components/PerformancePanel';
import { SparkleIcon } from './components/icons';

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
    quota,
    aiAuditStatus,
    aiAuditProgress,
    aiAuditError,
    aiAuditInfo,
    setStatus,
    setResult,
    setError,
    setQuota,
    setLanguage,
    setAiAuditStatus,
    setAiAuditProgress,
    setAiAuditError,
    setAiAuditInfo,
    mergeAiIssues,
  } = usePanelStore();
  const [tab, setTab] = useState<Tab>('accessibility');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [pageUrl, setPageUrl] = useState<string | undefined>();
  const [isPro, setIsPro] = useState(false);

  const refreshQuota = async () => {
    const [settings, usage] = await Promise.all([getSettings(), getUsage()]);
    setQuota(evaluateQuota(settings, usage));
    setLanguage(settings.language);
    setIsPro(settings.plan === 'pro');
  };

  useEffect(() => {
    // Hydrate quota and language from extension storage on panel open.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async storage read on mount
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
    setSourceFilter('all');
    const response = (await chrome.runtime.sendMessage({
      type: 'RUN_SCAN',
      tabId: activeTab.id,
    })) as { ok: true; result: ScanResult } | { ok: false; error: string };

    if (response.ok) {
      setResult(response.result);
      setPageUrl(response.result.url);
    } else {
      setError(response.error);
    }
    void refreshQuota();
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

      <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <p className="truncate text-xs text-slate-400" title={pageUrl}>
          {pageUrl ?? 'No page selected'}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={scan}
            disabled={status === 'scanning' || quota?.allowed === false}
          >
            {status === 'scanning' ? (
              <>
                <Spinner light />
                Scanning…
              </>
            ) : (
              'Scan this page'
            )}
          </button>
          {result && (
            <button
              type="button"
              className="btn-ghost flex-1 border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:text-brand-300 dark:hover:bg-brand-950/40"
              onClick={() => void runAiDeepScan()}
              disabled={aiAuditStatus === 'running' || !isPro}
              title={
                isPro
                  ? 'Full-page AI analysis against the RGAA criteria list — findings need manual review'
                  : proFeatureMessage('deep_scan')
              }
            >
              {aiAuditStatus === 'running' ? (
                <>
                  <Spinner />
                  Scanning…
                </>
              ) : (
                <>
                  <SparkleIcon />
                  Deep scan
                </>
              )}
            </button>
          )}
        </div>

        {aiAuditProgress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-300">
              <span>{aiAuditProgress.checkLabel}</span>
              <span>
                {aiAuditProgress.current}/{aiAuditProgress.total}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{
                  width: `${(aiAuditProgress.current / aiAuditProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
        {aiAuditStatus === 'done' && aiAuditInfo && (
          <p className="text-[11px] text-lime-600 dark:text-lime-400">
            Deep scan complete — {aiAuditInfo.found} finding
            {aiAuditInfo.found === 1 ? '' : 's'} to review across {aiAuditInfo.criteriaChecked} RGAA
            criteria
            {aiAuditInfo.rejected > 0
              ? ` (${aiAuditInfo.rejected} unverified AI suggestion${aiAuditInfo.rejected === 1 ? '' : 's'} dropped)`
              : ''}
            .
          </p>
        )}
        {aiAuditError && <p className="text-[11px] text-red-500">{aiAuditError}</p>}
        {quota?.allowed === false && (
          <p className="text-center text-[11px] text-red-500">
            Monthly free scan limit reached — enable Pro (preview) in Settings for unlimited scans.
          </p>
        )}
        {result && !isPro && (
          <p className="text-center text-[11px] text-slate-500">
            Deep scan, AI fixes, and PDF export require Pro (preview) in Settings.
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
                  exportReportPdf(result);
                }}
                title={isPro ? 'Export a client-ready PDF report' : proFeatureMessage('pdf_export')}
              >
                PDF
              </button>
            </div>

            {tab === 'accessibility' ? (
              <>
                {counts.all > 0 && (
                  <div className="flex gap-1">
                    <FilterChip
                      active={sourceFilter === 'all'}
                      onClick={() => setSourceFilter('all')}
                      label={`All (${counts.all})`}
                    />
                    <FilterChip
                      active={sourceFilter === 'auto'}
                      onClick={() => setSourceFilter('auto')}
                      label={`Automated (${counts.auto})`}
                    />
                    <FilterChip
                      active={sourceFilter === 'ai'}
                      onClick={() => setSourceFilter('ai')}
                      label={`AI (${counts.ai})`}
                    />
                  </div>
                )}

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

function FilterChip({
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
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
          : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
        light ? 'border-white/60' : 'border-brand-400'
      }`}
    />
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
