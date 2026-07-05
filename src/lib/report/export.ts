import type { ScanResult } from '@/lib/types';

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeFilename(result: ScanResult, ext: string): string {
  const host = result.url.replace(/^https?:\/\//, '').split('/')[0] ?? 'page';
  const date = new Date(result.timestamp).toISOString().slice(0, 10);
  return `a11yfix-${host}-${date}.${ext}`;
}

/** Export full scan result as JSON. */
export function exportReportJson(result: ScanResult): void {
  const json = JSON.stringify(result, null, 2);
  downloadBlob(safeFilename(result, 'json'), new Blob([json], { type: 'application/json' }));
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Export accessibility issues as CSV (one row per node). */
export function exportReportCsv(result: ScanResult): void {
  const header = [
    'severity',
    'source',
    'confidence',
    'ruleId',
    'title',
    'criterion',
    'selector',
    'html',
    'userImpact',
  ].join(',');

  const rows: string[] = [header];
  for (const issue of result.accessibilityIssues) {
    const criteria = issue.rgaa.map((r) => r.criterion).join(';');
    for (const node of issue.nodes) {
      rows.push(
        [
          issue.severity,
          issue.source,
          issue.confidence,
          issue.ruleId,
          issue.title,
          criteria,
          node.target,
          node.html,
          issue.userImpact,
        ]
          .map((cell) => csvEscape(String(cell ?? '')))
          .join(','),
      );
    }
  }

  downloadBlob(
    safeFilename(result, 'csv'),
    new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }),
  );
}
