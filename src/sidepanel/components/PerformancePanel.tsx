import type { CoreWebVitals, PerformanceIssue } from '@/lib/types';
import { SeverityBadge } from './SeverityBadge';

const VITALS: Array<{ key: keyof CoreWebVitals; label: string; unit: string }> = [
  { key: 'lcp', label: 'LCP', unit: 'ms' },
  { key: 'cls', label: 'CLS', unit: '' },
  { key: 'fcp', label: 'FCP', unit: 'ms' },
  { key: 'ttfb', label: 'TTFB', unit: 'ms' },
];

export function PerformancePanel({
  webVitals,
  issues,
}: {
  webVitals: CoreWebVitals;
  issues: PerformanceIssue[];
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {VITALS.map((vital) => {
          const value = webVitals[vital.key];
          return (
            <div key={vital.key} className="card px-2 py-2 text-center">
              <div className="text-[10px] font-semibold uppercase text-slate-400">
                {vital.label}
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {value === null ? '—' : `${value}${vital.unit}`}
              </div>
            </div>
          );
        })}
      </div>

      {issues.length === 0 ? (
        <p className="rounded-lg bg-lime-50 px-3 py-2 text-xs text-lime-700 dark:bg-lime-950/30 dark:text-lime-300">
          No performance issues detected in this sample.
        </p>
      ) : (
        issues.map((issue) => (
          <div key={issue.id} className="card p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {issue.title}
              </span>
              <SeverityBadge severity={issue.severity} />
            </div>
            <p className="mb-1 text-xs text-slate-500">
              {issue.metric}: {issue.value}
              {issue.unit} (target ≤ {issue.threshold}
              {issue.unit})
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{issue.description}</p>
          </div>
        ))
      )}
    </div>
  );
}
