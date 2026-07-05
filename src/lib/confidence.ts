import type { IssueConfidence, IssueSource } from './types';

export interface ConfidenceDisplay {
  label: { en: string; fr: string };
  /** Tailwind classes for badge background/text. */
  badgeClass: string;
}

export const CONFIDENCE_DISPLAY: Record<IssueConfidence, ConfidenceDisplay> = {
  certain: {
    label: { en: 'Certain', fr: 'Certain' },
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  },
  likely: {
    label: { en: 'Likely', fr: 'Probable' },
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  },
  'needs-review': {
    label: { en: 'Needs review', fr: 'À vérifier' },
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
};

const SOURCE_HINT: Record<IssueSource, { en: string; fr: string }> = {
  axe: { en: 'axe-core', fr: 'axe-core' },
  rule: { en: 'RGAA rule', fr: 'Règle RGAA' },
  ai: { en: 'AI analysis', fr: 'Analyse IA' },
};

export function confidenceLabel(
  confidence: IssueConfidence,
  lang: 'en' | 'fr' = 'en',
): string {
  return CONFIDENCE_DISPLAY[confidence].label[lang];
}

export function confidenceWithSource(
  confidence: IssueConfidence,
  source: IssueSource,
  lang: 'en' | 'fr' = 'en',
): string {
  return `${confidenceLabel(confidence, lang)} · ${SOURCE_HINT[source][lang]}`;
}

export function pdfConfidenceLabel(confidence: IssueConfidence, source: IssueSource): string {
  return confidenceWithSource(confidence, source, 'en');
}
