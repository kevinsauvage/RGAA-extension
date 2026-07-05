import { useI18n } from '@/lib/i18n/useI18n';
import { formatDeepScanErrorFromMessage } from '@/lib/ai/openai-errors';

export function DeepScanErrorAlert({
  error,
  onOpenSettings,
}: {
  error: string;
  onOpenSettings: () => void;
}) {
  const { language, t } = useI18n();
  const display = formatDeepScanErrorFromMessage(language, error);

  return (
    <div
      role="alert"
      className="border-b border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30"
    >
      <div className="flex gap-2">
        <AlertIcon kind={display.kind} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-semibold text-red-900 dark:text-red-100">{display.title}</p>
          <p className="text-[11px] leading-relaxed text-red-800 dark:text-red-200">{display.body}</p>
          {display.hint && (
            <p className="text-[11px] text-red-700/90 dark:text-red-300/90">{display.hint}</p>
          )}
          {display.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {display.actions.map((action) =>
                action.type === 'settings' ? (
                  <button
                    key={action.label}
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-red-800 shadow-sm ring-1 ring-red-200 hover:bg-red-50 dark:bg-red-950 dark:text-red-100 dark:ring-red-800 dark:hover:bg-red-900"
                    onClick={onOpenSettings}
                  >
                    {action.label}
                  </button>
                ) : (
                  <a
                    key={action.label}
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-red-800 shadow-sm ring-1 ring-red-200 hover:bg-red-50 dark:bg-red-950 dark:text-red-100 dark:ring-red-800 dark:hover:bg-red-900"
                  >
                    {action.label}
                  </a>
                ),
              )}
            </div>
          )}
          {display.technical && (
            <details className="pt-1">
              <summary className="cursor-pointer text-[10px] font-medium text-red-700/80 dark:text-red-400">
                {t('deepScan.errors.technicalDetails')}
              </summary>
              <p className="mt-1 break-all rounded bg-red-100/60 p-2 font-mono text-[10px] text-red-900 dark:bg-red-950/60 dark:text-red-200">
                {display.technical}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertIcon({ kind }: { kind: string }) {
  const isQuota = kind === 'quota' || kind === 'rate_limit';
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`mt-0.5 shrink-0 ${isQuota ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}
      aria-hidden="true"
    >
      {isQuota ? (
        <path
          d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
