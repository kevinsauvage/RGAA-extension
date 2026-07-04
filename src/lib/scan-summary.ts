import type { ScanSummary, Severity } from './types';

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1,
};

/** Compute a 0-100 composite score plus severity counts. */
export function summarizeIssues(
  issues: Array<{ severity: Severity }>,
): ScanSummary {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let penalty = 0;
  for (const issue of issues) {
    counts[issue.severity] += 1;
    penalty += SEVERITY_WEIGHT[issue.severity];
  }
  const score = Math.max(0, Math.round(100 - Math.min(100, penalty * 1.5)));
  return { total: issues.length, ...counts, score };
}
