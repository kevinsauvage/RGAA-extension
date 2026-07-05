import type { ScanHistoryEntry } from '@/lib/storage';
import { useI18n } from '@/lib/i18n/useI18n';

interface ScanHistoryListProps {
  entries: ScanHistoryEntry[];
  compact?: boolean;
}

export function ScanHistoryList({ entries, compact = false }: ScanHistoryListProps) {
  const { t } = useI18n();

  if (entries.length === 0) {
    return <p className="text-xs text-slate-400">{t('scan.noHistory')}</p>;
  }

  return (
    <ul className={`space-y-1 ${compact ? '' : 'card p-2'}`} aria-label={t('scan.history')}>
      {entries.map((entry) => (
        <li key={entry.id}>
          <div
            className={`rounded-lg px-2 py-1.5 ${compact ? 'bg-slate-100 dark:bg-slate-800/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200" title={entry.url}>
              {entry.title || entry.url}
            </p>
            <p className="flex justify-between text-[10px] text-slate-400">
              <span>{new Date(entry.timestamp).toLocaleString()}</span>
              <span>
                {t('scan.score', { score: entry.score })} · {entry.issueCount} issues
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
