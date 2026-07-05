import axe from 'axe-core';
import type { AccessibilityIssue, AffectedNode } from '@/lib/types';
import { summarizeIssues } from '@/lib/scan-summary';
import { normalizeSeverity, rgaaForRule } from './rgaa-mapping';
import { userImpactFor } from './user-impact';
import { truncate } from './dom-utils';

function axeTargetToSelectors(target: axe.NodeResult['target']): string[] {
  if (!Array.isArray(target)) return [String(target)];
  return target
    .map((chain) => (Array.isArray(chain) ? chain.join(' ') : String(chain)))
    .filter((s) => s.length > 0);
}

function toAffectedNodes(nodes: axe.NodeResult[]): AffectedNode[] {
  return nodes.map((node) => {
    const targets = axeTargetToSelectors(node.target);
    return {
      target: targets[0] ?? '',
      targets,
      html: truncate(node.html, 240),
      failureSummary: node.failureSummary,
    };
  });
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
      source: 'axe',
      confidence: 'certain',
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

export { summarizeIssues as summarize };
