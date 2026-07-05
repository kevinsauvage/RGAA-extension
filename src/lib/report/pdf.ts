import { jsPDF } from 'jspdf';
import type { IssueSource, ScanResult } from '@/lib/types';

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  serious: 'Serious',
  moderate: 'Moderate',
  minor: 'Minor',
};

const SOURCE_LABEL: Record<IssueSource, string> = {
  axe: 'Automated (axe-core)',
  rule: 'Automated (RGAA rule)',
  ai: 'AI analysis',
};

/** Build a client-ready PDF audit report and trigger a download. */
export function exportReportPdf(result: ScanResult): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  const line = (text: string, size = 11, bold = false, gap = 16) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2) as string[];
    for (const part of wrapped) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(part, margin, y);
      y += gap;
    }
  };

  doc.setFillColor(31, 99, 235);
  doc.rect(0, 0, pageWidth, 70, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('A11yFix AI — Accessibility Audit', margin, 44);
  doc.setTextColor(15, 23, 42);
  y = 100;

  line(result.title, 14, true);
  line(result.url, 10);
  line(`Generated: ${new Date(result.timestamp).toLocaleString()}`, 10);
  y += 8;

  line(`Accessibility score: ${result.summary.score}/100`, 16, true);
  line(
    `${result.summary.total} issues — ` +
      `${result.summary.critical} critical, ${result.summary.serious} serious, ` +
      `${result.summary.moderate} moderate, ${result.summary.minor} minor.`,
    11,
  );

  const bySource = result.accessibilityIssues.reduce(
    (acc, issue) => {
      acc[issue.source] += 1;
      return acc;
    },
    { axe: 0, rule: 0, ai: 0 } as Record<IssueSource, number>,
  );
  const needsReview = result.accessibilityIssues.filter(
    (issue) => issue.confidence === 'needs-review',
  ).length;
  line(
    `Sources: ${bySource.axe} axe-core, ${bySource.rule} RGAA rules, ${bySource.ai} AI` +
      (needsReview > 0 ? ` (${needsReview} pending manual review).` : '.'),
    10,
  );
  y += 8;

  line('Accessibility findings (RGAA / WCAG)', 14, true);
  result.accessibilityIssues.forEach((issue, index) => {
    y += 4;
    const rgaa = issue.rgaa.map((r) => r.criterion).join(', ');
    const reviewFlag = issue.confidence === 'needs-review' ? ' — NEEDS MANUAL REVIEW' : '';
    line(`${index + 1}. [${SEVERITY_LABEL[issue.severity]}] ${issue.title}`, 11, true);
    line(
      `RGAA ${rgaa} — ${issue.nodes.length} element(s) — ${SOURCE_LABEL[issue.source]}${reviewFlag}`,
      9,
    );
    line(`Impact: ${issue.userImpact}`, 9);
  });

  if (result.performanceIssues.length > 0) {
    y += 10;
    line('Performance findings (Core Web Vitals)', 14, true);
    result.performanceIssues.forEach((issue) => {
      line(
        `• ${issue.title}: ${issue.value}${issue.unit} (target ≤ ${issue.threshold}${issue.unit})`,
        10,
      );
    });
  }

  const host = (() => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return 'report';
    }
  })();
  doc.save(`a11yfix-${host}-${result.id}.pdf`);
}
