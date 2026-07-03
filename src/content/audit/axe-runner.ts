import axe from 'axe-core';
import type {
  AccessibilityIssue,
  AffectedNode,
  ScanSummary,
} from '@/lib/types';
import { normalizeSeverity, rgaaForRule } from './rgaa-mapping';
import { userImpactFor } from './user-impact';

const SEVERITY_WEIGHT = {
  critical: 10,
  serious: 6,
  moderate: 3,
  minor: 1,
} as const;

function truncateHtml(html: string, max = 240): string {
  const clean = html.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

function toAffectedNodes(nodes: axe.NodeResult[]): AffectedNode[] {
  return nodes.map((node) => ({
    target: Array.isArray(node.target) ? node.target.join(' ') : String(node.target),
    html: truncateHtml(node.html),
    failureSummary: node.failureSummary,
  }));
}

/** Run axe-core against the live document and map results to RGAA issues. */
export async function runAxeAudit(): Promise<AccessibilityIssue[]> {
  const results = await axe.run(document, {
    resultTypes: ['violations'],
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
  });

  return results.violations.map((violation): AccessibilityIssue => {
    const severity = normalizeSeverity(violation.impact);
    return {
      id: `a11y-${violation.id}`,
      kind: 'accessibility',
      ruleId: violation.id,
      severity,
      title: violation.help,
      description: violation.description,
      userImpact: userImpactFor(violation.id, violation.description),
      helpUrl: violation.helpUrl,
      rgaa: rgaaForRule(violation.id),
      nodes: toAffectedNodes(violation.nodes),
    };
  });
}

/** Compute a 0-100 composite score plus severity counts. */
export function summarize(
  issues: Array<{ severity: keyof typeof SEVERITY_WEIGHT }>,
): ScanSummary {
  const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let penalty = 0;
  for (const issue of issues) {
    counts[issue.severity] += 1;
    penalty += SEVERITY_WEIGHT[issue.severity];
  }
  // Diminishing-returns curve so a handful of minor issues doesn't tank the score.
  const score = Math.max(0, Math.round(100 - Math.min(100, penalty * 1.5)));
  return { total: issues.length, ...counts, score };
}
