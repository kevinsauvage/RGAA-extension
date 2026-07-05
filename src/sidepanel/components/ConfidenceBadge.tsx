import type { AccessibilityIssue, IssueConfidence } from '@/lib/types';
import { CONFIDENCE_DISPLAY, confidenceWithSource } from '@/lib/confidence';
import { useI18n } from '@/lib/i18n/useI18n';

interface ConfidenceBadgeProps {
  issue: Pick<AccessibilityIssue, 'confidence' | 'source'>;
}

export function ConfidenceBadge({ issue }: ConfidenceBadgeProps) {
  const { language } = useI18n();
  const display = CONFIDENCE_DISPLAY[issue.confidence];

  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${display.badgeClass}`}
      title={confidenceWithSource(issue.confidence, issue.source, language)}
    >
      {display.label[language]}
    </span>
  );
}

export function confidenceBadgeClass(confidence: IssueConfidence): string {
  return CONFIDENCE_DISPLAY[confidence].badgeClass;
}
