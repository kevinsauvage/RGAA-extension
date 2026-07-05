import { useEffect, useMemo, useState } from 'react';
import type { IssueSource, KnownIssueRef, Severity } from '@/lib/types';
import {
  getActiveTab,
  getPageHtmlFromTab,
  isScannable,
  runScanOnActiveTab,
  verifySelectorsOnTab,
} from '@/lib/utils';
import { getSettings, getScanHistory, pushScanHistory, type ScanHistoryEntry } from '@/lib/storage';
import { canUseProFeature } from '@/lib/scan-limits';
import { runDeepScan } from '@/lib/ai/deep-scan';
import { encodeDeepScanError } from '@/lib/ai/openai-errors';
import { formatProtectedPageError, formatScanError } from '@/lib/scan-errors';
import { useI18n } from '@/lib/i18n/useI18n';
import { Logo } from '@/components/Logo';
import { useQuota } from '@/hooks/useQuota';
import { usePanelStore } from './store';
import { SummaryCards } from './components/SummaryCards';
import { IssueCard } from './components/IssueCard';
import { PerformancePanel } from './components/PerformancePanel';
import { CoveragePanel } from './components/CoveragePanel';
import { OnboardingBanner } from './components/OnboardingBanner';
import { ScanHistoryList } from './components/ScanHistoryList';
import { ExportMenu } from './components/ExportMenu';
import {
  DeepScanProgress,
  IssueFilters,
  ScanToolbar,
} from './components/ScanToolbar';

type Tab = 'accessibility' | 'performance' | 'coverage';
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
  const { t, language } = useI18n();
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
  const { quota, isPro, hasApiKey, refresh: refreshQuota } = useQuota();
  const [tab, setTab] = useState<Tab>('accessibility');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [pageUrl, setPageUrl] = useState<string | undefined>();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    void (async () => {
      const [activeTab, settings, history] = await Promise.all([
        getActiveTab(),
        getSettings(),
        getScanHistory(),
      ]);
      setPageUrl(activeTab?.url);
      setLanguage(settings.language);
      setShowOnboarding(!settings.onboardingDismissed);
      setScanHistory(history);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scan = async () => {
    const activeTab = await getActiveTab();
    if (!activeTab?.id || !isScannable(activeTab.url)) {
      setError(formatProtectedPageError(language));
      return;
    }
    setStatus('scanning');
    setError(null);
    setSourceFilter('all');
    const response = await runScanOnActiveTab();

    if (response.ok && 'result' in response) {
      setResult(response.result);
      setPageUrl(response.result.url);
      void pushScanHistory(response.result).then(() => getScanHistory().then(setScanHistory));
    } else {
      const errMsg = 'error' in response ? response.error : 'Scan failed.';
      const reason = 'reason' in response ? response.reason : undefined;
      setError(formatScanError(language, errMsg, reason));
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
      setAiAuditError(t('errors.deepScanPro'));
      setAiAuditStatus('error');
      return;
    }
    if (!settings.openaiApiKey) {
      setAiAuditError(t('deepScan.noApiKey'));
      setAiAuditStatus('error');
      return;
    }

    setAiAuditStatus('running');
    setAiAuditError(null);
    setAiAuditInfo(null);

    try {
      const { html, styleSnippets } = await getPageHtmlFromTab();
      const scanResult = await runDeepScan(
        html,
        knownIssueRefs(),
        settings,
        verifySelectorsOnTab,
        setAiAuditProgress,
        styleSnippets,
      );
      mergeAiIssues(scanResult.issues);
      setAiAuditInfo({
        criteriaChecked: scanResult.criteriaChecked,
        found: scanResult.issues.length,
        rejected: scanResult.rejected,
      });
      setAiAuditStatus('done');
    } catch (err) {
      setAiAuditError(encodeDeepScanError(err));
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

  const statusMessage =
    status === 'scanning'
      ? t('scan.scanning')
      : aiAuditStatus === 'running'
        ? aiAuditProgress?.checkLabel ?? t('scan.scanning')
        : '';

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Logo />
          <div>
            <h1 className="text-sm font-bold leading-tight">{t('app.title')}</h1>
            <p className="text-[10px] text-slate-400">
              {quota?.unlimited
                ? t('app.proUnlimited')
                : quota
                  ? t('app.scansLeft', { remaining: quota.remaining, limit: quota.limit })
                  : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          {t('app.settings')}
        </button>
      </header>

      <ScanToolbar
        pageUrl={pageUrl}
        status={status}
        quotaAllowed={quota?.allowed !== false}
        isPro={isPro}
        hasResult={Boolean(result)}
        aiAuditStatus={aiAuditStatus}
        onScan={() => void scan()}
        onDeepScan={() => void runAiDeepScan()}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <DeepScanProgress
        progress={aiAuditProgress}
        status={aiAuditStatus}
        info={aiAuditInfo}
        error={aiAuditError}
        quotaBlocked={quota?.allowed === false}
        proRequired={Boolean(result && !isPro)}
        onOpenSettings={() => chrome.runtime.openOptionsPage()}
      />

      <main id="main-content" className="flex-1 space-y-3 overflow-y-auto p-4" tabIndex={-1}>
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {showOnboarding && !result && (
          <OnboardingBanner
            hasApiKey={hasApiKey}
            onOpenSettings={() => chrome.runtime.openOptionsPage()}
            onDismissed={() => setShowOnboarding(false)}
          />
        )}

        {!result && status !== 'scanning' && !error && (
          <EmptyState history={scanHistory} />
        )}

        {result && (
          <>
            <SummaryCards result={result} />

            {result.warnings && result.warnings.length > 0 && (
              <div
                role="status"
                className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
              >
                {result.warnings.map((warning) => (
                  <p key={warning.code}>{warning.message}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <div
                className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
                role="tablist"
                aria-label={t('tabs.accessibility')}
              >
                <TabButton
                  active={tab === 'accessibility'}
                  onClick={() => setTab('accessibility')}
                  label={`${t('tabs.accessibility')} (${result.accessibilityIssues.length})`}
                />
                <TabButton
                  active={tab === 'performance'}
                  onClick={() => setTab('performance')}
                  label={`${t('tabs.performance')} (${result.performanceIssues.length})`}
                />
                <TabButton
                  active={tab === 'coverage'}
                  onClick={() => setTab('coverage')}
                  label={t('tabs.coverage')}
                />
              </div>
              <ExportMenu result={result} isPro={isPro} onError={setError} />
            </div>

            {tab === 'accessibility' ? (
              <>
                <IssueFilters sourceFilter={sourceFilter} counts={counts} onChange={setSourceFilter} />

                {visibleIssues.length === 0 ? (
                  <p className="rounded-lg bg-lime-50 px-3 py-4 text-center text-sm text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
                    {result.accessibilityIssues.length === 0
                      ? t('issues.noneAuto')
                      : t('issues.noneFilter')}
                  </p>
                ) : (
                  visibleIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
                )}
              </>
            ) : tab === 'performance' ? (
              <PerformancePanel webVitals={result.webVitals} issues={result.performanceIssues} />
            ) : (
              <CoveragePanel result={result} />
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
      role="tab"
      aria-selected={active}
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

function EmptyState({ history }: { history: ScanHistoryEntry[] }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Logo size={48} />
      <h2 className="mt-4 text-base font-semibold">{t('scan.readyTitle')}</h2>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{t('scan.readyBody')}</p>
      {history.length > 0 && (
        <div className="mt-6 w-full max-w-sm text-left">
          <h3 className="mb-2 text-xs font-semibold text-slate-500">{t('scan.history')}</h3>
          <ScanHistoryList entries={history} compact />
        </div>
      )}
    </div>
  );
}
