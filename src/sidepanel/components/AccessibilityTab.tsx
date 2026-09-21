import type { AccessibilityIssue } from '@/lib/types';
import type { ScanResult } from '@/lib/types';
import { useI18n } from '@/lib/i18n/useI18n';
import { SummaryCards } from './SummaryCards';
import { IssueCard } from './IssueCard';
import { CoveragePanel } from './CoveragePanel';
import { IssueFilters } from './ScanToolbar';

type SourceFilter = 'all' | 'auto' | 'ai';

interface AccessibilityTabProps {
  result: ScanResult;
  sourceFilter: SourceFilter;
  onSourceFilterChange: (filter: SourceFilter) => void;
  visibleIssues: AccessibilityIssue[];
  counts: { all: number; auto: number; ai: number };
}

export function AccessibilityTab({
  result,
  sourceFilter,
  onSourceFilterChange,
  visibleIssues,
  counts,
}: AccessibilityTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
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

      <section aria-labelledby="issues-heading">
        <h2 id="issues-heading" className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t('sections.findings')}
        </h2>
        <IssueFilters sourceFilter={sourceFilter} counts={counts} onChange={onSourceFilterChange} />

        {visibleIssues.length === 0 ? (
          <p className="rounded-lg bg-lime-50 px-3 py-4 text-center text-sm text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
            {result.accessibilityIssues.length === 0
              ? t('issues.noneAuto')
              : t('issues.noneFilter')}
          </p>
        ) : (
          visibleIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </section>

      <section aria-labelledby="coverage-heading">
        <h2 id="coverage-heading" className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t('sections.coverage')}
        </h2>
        <CoveragePanel result={result} />
      </section>
    </div>
  );
}
