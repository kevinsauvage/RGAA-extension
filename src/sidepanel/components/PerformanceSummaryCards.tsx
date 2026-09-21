import type { ScanResult } from '@/lib/types';
import { useI18n } from '@/lib/i18n/useI18n';
import { summarizeIssues } from '@/lib/scan-summary';
import { ScoreRing } from './ScoreRing';

const CELLS = [
  { key: 'critical', labelKey: 'summary.critical' },
  { key: 'serious', labelKey: 'summary.serious' },
  { key: 'moderate', labelKey: 'summary.moderate' },
  { key: 'minor', labelKey: 'summary.minor' },
] as const;

export function PerformanceSummaryCards({ result }: { result: ScanResult }) {
  const { t } = useI18n();
  const summary = summarizeIssues(
    result.performanceIssues.map((issue) => ({ severity: issue.severity })),
  );

  if (result.performanceIssues.length === 0) {
    return null;
  }

  return (
    <div className="card flex items-center gap-4 p-4">
      <ScoreRing score={summary.score} label={t('summary.performanceScore')} />
      <div className="grid flex-1 grid-cols-2 gap-2">
        {CELLS.map((cell) => (
          <div key={cell.key} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
            <div className={`text-xl font-bold ${SEVERITY_CLASS[cell.key]}`}>
              {summary[cell.key]}
            </div>
            <div className="text-xs text-slate-500">{t(cell.labelKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEVERITY_CLASS = {
  critical: 'text-red-600',
  serious: 'text-orange-600',
  moderate: 'text-amber-600',
  minor: 'text-lime-600',
} as const;
