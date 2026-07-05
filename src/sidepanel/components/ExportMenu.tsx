import { useState } from 'react';
import type { ScanResult } from '@/lib/types';
import { exportReportCsv, exportReportJson } from '@/lib/report/export';
import { exportReportPdf } from '@/lib/report/pdf';
import { useI18n } from '@/lib/i18n/useI18n';

interface ExportMenuProps {
  result: ScanResult;
  isPro: boolean;
  onError: (message: string) => void;
}

export function ExportMenu({ result, isPro, onError }: ExportMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const exportPdf = async () => {
    if (!isPro) {
      onError(t('errors.pdfPro'));
      return;
    }
    await exportReportPdf(result);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-ghost text-xs"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {t('export.label')} ▾
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-10 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => void exportPdf()}
              title={isPro ? undefined : t('export.proRequired')}
            >
              {t('export.pdf')}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => {
                exportReportJson(result);
                setOpen(false);
              }}
            >
              {t('export.json')}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => {
                exportReportCsv(result);
                setOpen(false);
              }}
            >
              {t('export.csv')}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
