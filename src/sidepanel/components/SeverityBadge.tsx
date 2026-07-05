import type { Severity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePanelStore } from '../store';

const STYLES: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  serious: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  minor: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
};

const LABELS: Record<'fr' | 'en', Record<Severity, string>> = {
  en: {
    critical: 'Critical',
    serious: 'Serious',
    moderate: 'Moderate',
    minor: 'Minor',
  },
  fr: {
    critical: 'Critique',
    serious: 'Majeur',
    moderate: 'Modéré',
    minor: 'Mineur',
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const language = usePanelStore((s) => s.language);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        STYLES[severity],
      )}
    >
      {LABELS[language][severity]}
    </span>
  );
}
