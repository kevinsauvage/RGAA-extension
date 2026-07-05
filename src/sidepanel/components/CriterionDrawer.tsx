import { useEffect, useRef } from 'react';
import type { CriterionDetail } from '@/lib/rgaa/referential-ui';
import type { CheckMethod } from '@/lib/rgaa/coverage';
import { useI18n } from '@/lib/i18n/useI18n';

const METHOD_STYLE: Record<CheckMethod, string> = {
  axe: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  rule: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  ai: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  manual: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

interface CriterionDrawerProps {
  criterion: CriterionDetail | null;
  onClose: () => void;
}

export function CriterionDrawer({ criterion, onClose }: CriterionDrawerProps) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!criterion) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [criterion, onClose]);

  if (!criterion) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label={t('coverage.viewCriterion')}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="criterion-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="flex items-start justify-between gap-2 border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">
              {t('coverage.theme', { num: criterion.theme, name: criterion.themeName })}
            </p>
            <h2 id="criterion-drawer-title" className="text-base font-semibold">
              RGAA {criterion.id}
            </h2>
          </div>
          <button ref={closeRef} type="button" className="btn-ghost px-2 py-1 text-xs" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <p className="text-sm text-slate-700 dark:text-slate-200">{criterion.title}</p>

          <div className="flex flex-wrap gap-1">
            {criterion.methods.map((method) => (
              <span
                key={method}
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${METHOD_STYLE[method]}`}
              >
                {t(`coverage.methods.${method}`)}
              </span>
            ))}
          </div>

          {(criterion.rules.length > 0 || criterion.axeRules.length > 0) && (
            <div className="text-xs text-slate-500">
              {criterion.rules.length > 0 && <p>Rules: {criterion.rules.join(', ')}</p>}
              {criterion.axeRules.length > 0 && <p>axe: {criterion.axeRules.join(', ')}</p>}
            </div>
          )}

          {criterion.note && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="font-semibold">{t('coverage.limitation')}: </span>
              {criterion.note}
            </p>
          )}

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('coverage.officialTests')}
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {criterion.tests.map((test) => (
                <li key={test.id}>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{test.id}</span>{' '}
                  — {test.title}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={criterion.helpUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-medium text-brand-600 hover:underline"
          >
            {t('coverage.openRgaa')}
          </a>
        </div>
      </aside>
    </div>
  );
}
