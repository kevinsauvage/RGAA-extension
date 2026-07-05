import type { AiAuditProgress } from '@/lib/types';
import { Spinner } from '@/components/Spinner';
import type { AiAuditInfo } from '../store';
import { SparkleIcon } from './icons';

interface ScanToolbarProps {
  pageUrl?: string;
  status: 'idle' | 'scanning' | 'done' | 'error';
  quotaAllowed: boolean;
  isPro: boolean;
  hasResult: boolean;
  aiAuditStatus: 'idle' | 'running' | 'done' | 'error';
  deepScanTitle: string;
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
  deepScanTitle,
  onScan,
  onDeepScan,
}: ScanToolbarProps) {
  return (
    <div className="space-y-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="truncate text-xs text-slate-400" title={pageUrl}>
        {pageUrl ?? 'No page selected'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={onScan}
          disabled={status === 'scanning' || !quotaAllowed}
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
        {hasResult && (
          <button
            type="button"
            className="btn-ghost flex-1 border border-brand-200 text-brand-700 hover:bg-brand-50 dark:border-brand-900 dark:text-brand-300 dark:hover:bg-brand-950/40"
            onClick={onDeepScan}
            disabled={aiAuditStatus === 'running' || !isPro}
            title={deepScanTitle}
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
}: {
  progress: AiAuditProgress | null;
  status: 'idle' | 'running' | 'done' | 'error';
  info: AiAuditInfo | null;
  error: string | null;
  quotaBlocked: boolean;
  proRequired: boolean;
}) {
  return (
    <>
      {progress && (
        <div className="space-y-1 border-b border-slate-200 bg-white px-4 pb-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-300">
            <span>{progress.checkLabel}</span>
            <span>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      {status === 'done' && info && (
        <p className="border-b border-slate-200 bg-white px-4 pb-3 text-[11px] text-lime-600 dark:border-slate-800 dark:bg-slate-900 dark:text-lime-400">
          Deep scan complete — {info.found} finding
          {info.found === 1 ? '' : 's'} to review across {info.criteriaChecked} RGAA criteria
          {info.rejected > 0
            ? ` (${info.rejected} unverified AI suggestion${info.rejected === 1 ? '' : 's'} dropped)`
            : ''}
          .
        </p>
      )}
      {error && (
        <p className="border-b border-slate-200 bg-white px-4 pb-3 text-[11px] text-red-500 dark:border-slate-800 dark:bg-slate-900">
          {error}
        </p>
      )}
      {quotaBlocked && (
        <p className="border-b border-slate-200 bg-white px-4 pb-3 text-center text-[11px] text-red-500 dark:border-slate-800 dark:bg-slate-900">
          Monthly free scan limit reached — enable Pro (preview) in Settings for unlimited scans.
        </p>
      )}
      {proRequired && (
        <p className="border-b border-slate-200 bg-white px-4 pb-3 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Deep scan, AI fixes, and PDF export require Pro (preview) in Settings.
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
  if (counts.all === 0) return null;

  return (
    <div className="flex gap-1">
      <FilterChip
        active={sourceFilter === 'all'}
        onClick={() => onChange('all')}
        label={`All (${counts.all})`}
      />
      <FilterChip
        active={sourceFilter === 'auto'}
        onClick={() => onChange('auto')}
        label={`Automated (${counts.auto})`}
      />
      <FilterChip
        active={sourceFilter === 'ai'}
        onClick={() => onChange('ai')}
        label={`AI (${counts.ai})`}
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

