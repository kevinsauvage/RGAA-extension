import type { AiAuditProgress } from '@/lib/types';
import { Spinner } from '@/components/Spinner';
import { useI18n } from '@/lib/i18n/useI18n';
import type { AiAuditInfo } from '../store';
import { DeepScanErrorAlert } from './DeepScanErrorAlert';
import { SparkleIcon } from './icons';

interface ScanToolbarProps {
  pageUrl?: string;
  status: 'idle' | 'scanning' | 'done' | 'error';
  quotaAllowed: boolean;
  isPro: boolean;
  hasResult: boolean;
  aiAuditStatus: 'idle' | 'running' | 'done' | 'error';
  onScan: () => void;
  onDeepScan: () => void;
}

export function ScanToolbar({
  pageUrl,
  status,
  quotaAllowed,
  isPro,
  hasResult,
  aiAuditStatus,
  onScan,
  onDeepScan,
}: ScanToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="truncate text-xs text-slate-400" title={pageUrl}>
        {pageUrl ?? t('scan.noPage')}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={onScan}
          disabled={status === 'scanning' || !quotaAllowed}
          aria-busy={status === 'scanning'}
        >
          {status === 'scanning' ? (
            <>
              <Spinner light />
              {t('scan.scanning')}
            </>
          ) : (
            t('scan.scanPage')
          )}
        </button>
        {hasResult && (
          <button
            type="button"
            className="btn-ghost flex-1 border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:text-brand-300 dark:hover:bg-brand-950/40"
            onClick={onDeepScan}
            disabled={aiAuditStatus === 'running' || !isPro}
            title={isPro ? t('scan.deepScanTitle') : t('errors.deepScanPro')}
            aria-busy={aiAuditStatus === 'running'}
          >
            {aiAuditStatus === 'running' ? (
              <>
                <Spinner />
                {t('scan.scanning')}
              </>
            ) : (
              <>
                <SparkleIcon />
                {t('scan.deepScan')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function DeepScanProgress({
  progress,
  status,
  info,
  error,
  quotaBlocked,
  proRequired,
  onOpenSettings,
}: {
  progress: AiAuditProgress | null;
  status: 'idle' | 'running' | 'done' | 'error';
  info: AiAuditInfo | null;
  error: string | null;
  quotaBlocked: boolean;
  proRequired: boolean;
  onOpenSettings: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      {progress && (
        <div
          className="space-y-1 border-b border-slate-200 bg-white px-4 pb-3 dark:border-slate-800 dark:bg-slate-900"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-300">
            <span>{progress.checkLabel}</span>
            <span>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div
            className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={progress.current}
            aria-valuemin={0}
            aria-valuemax={progress.total}
          >
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      {status === 'done' && info && (
        <p
          role="status"
          className="border-b border-slate-200 bg-white px-4 pb-3 text-[11px] text-lime-600 dark:border-slate-800 dark:bg-slate-900 dark:text-lime-400"
        >
          {t('deepScan.complete', {
            found: info.found,
            criteria: info.criteriaChecked,
            rejected:
              info.rejected > 0
                ? t('deepScan.rejectedSuffix', { count: info.rejected })
                : '',
          })}
        </p>
      )}
      {error && <DeepScanErrorAlert error={error} onOpenSettings={onOpenSettings} />}
      {quotaBlocked && (
        <p
          role="status"
          className="border-b border-slate-200 bg-white px-4 pb-3 text-center text-[11px] text-red-500 dark:border-slate-800 dark:bg-slate-900"
        >
          {t('deepScan.quotaBlocked')}
        </p>
      )}
      {proRequired && (
        <p
          role="status"
          className="border-b border-slate-200 bg-white px-4 pb-3 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900"
        >
          {t('deepScan.proRequired')}
        </p>
      )}
    </>
  );
}

export function IssueFilters({
  sourceFilter,
  counts,
  onChange,
}: {
  sourceFilter: 'all' | 'auto' | 'ai';
  counts: { all: number; auto: number; ai: number };
  onChange: (filter: 'all' | 'auto' | 'ai') => void;
}) {
  const { t } = useI18n();

  if (counts.all === 0) return null;

  return (
    <div className="flex gap-1" role="group" aria-label="Issue filters">
      <FilterChip
        active={sourceFilter === 'all'}
        onClick={() => onChange('all')}
        label={t('filters.all', { count: counts.all })}
      />
      <FilterChip
        active={sourceFilter === 'auto'}
        onClick={() => onChange('auto')}
        label={t('filters.auto', { count: counts.auto })}
      />
      <FilterChip
        active={sourceFilter === 'ai'}
        onClick={() => onChange('ai')}
        label={t('filters.ai', { count: counts.ai })}
      />
    </div>
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
      aria-pressed={active}
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
