import { useMemo, useState } from 'react';
import { getCoverageStats, listAllCriteria, type CriterionDetail } from '@/lib/rgaa/referential-ui';
import { RGAA_THEMES } from '@/lib/rgaa/criteria';
import type { ScanResult } from '@/lib/types';
import { useI18n } from '@/lib/i18n/useI18n';
import { CriterionDrawer } from './CriterionDrawer';

interface CoveragePanelProps {
  result: ScanResult | null;
}

export function CoveragePanel({ result }: CoveragePanelProps) {
  const { t } = useI18n();
  const stats = useMemo(() => getCoverageStats(), []);
  const [selected, setSelected] = useState<CriterionDetail | null>(null);

  const criteriaWithFindings = useMemo(() => {
    if (!result) return new Set<string>();
    const ids = new Set<string>();
    for (const issue of result.accessibilityIssues) {
      for (const ref of issue.rgaa) ids.add(ref.criterion);
    }
    return ids;
  }, [result]);

  const allCriteria = useMemo(() => listAllCriteria(), []);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-sm font-semibold">{t('coverage.title')}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {t('coverage.summary', {
            automated: stats.automatedPercent,
            withAi: stats.automatedPlusAiPercent,
            manual: stats.manualPercent,
          })}
        </p>
        {result && (
          <p className="mt-2 text-xs font-medium text-brand-700 dark:text-brand-300">
            {t('coverage.criteriaInScan', { count: criteriaWithFindings.size })}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {Object.entries(stats.byTheme)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([themeNum, themeStats]) => (
            <div key={themeNum} className="card p-3">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {t('coverage.theme', {
                  num: themeNum,
                  name: RGAA_THEMES[Number(themeNum)] ?? '',
                })}
              </p>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(themeStats.automated / themeStats.total) * 100}%` }}
                  title={t('coverage.automated')}
                />
                <div
                  className="bg-amber-400"
                  style={{ width: `${(themeStats.ai / themeStats.total) * 100}%` }}
                  title={t('coverage.aiAlso')}
                />
                <div
                  className="bg-slate-300 dark:bg-slate-600"
                  style={{ width: `${(themeStats.manual / themeStats.total) * 100}%` }}
                  title={t('coverage.manual')}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                {themeStats.automated} {t('coverage.automated').toLowerCase()} · {themeStats.ai}{' '}
                {t('coverage.aiAlso')} · {themeStats.manual} {t('coverage.manual').toLowerCase()}
              </p>
            </div>
          ))}
      </div>

      <div className="card max-h-64 overflow-y-auto p-2">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {allCriteria.map((criterion) => {
            const hasFinding = criteriaWithFindings.has(criterion.id);
            return (
              <li key={criterion.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => setSelected(criterion)}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      hasFinding ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {criterion.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-slate-500">{criterion.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <CriterionDrawer criterion={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
