import type { AxeResults, NodeResult, run as axeRun } from 'axe-core';
import type { AccessibilityIssue, AffectedNode } from '@/lib/types';
import { summarizeIssues } from '@/lib/scan-summary';
import { normalizeSeverity, rgaaForRule } from './rgaa-mapping';
import { userImpactFor } from './user-impact';
import { truncate } from './dom-utils';
import { AXE_RUN_TAGS } from './axe-config';

type AxeCore = { run: typeof axeRun };

let axeModule: AxeCore | null = null;

async function loadAxe(): Promise<AxeCore> {
  if (!axeModule) {
    const mod = await import('axe-core');
    axeModule = mod.default;
  }
  return axeModule;
}

const AXE_RUN_OPTIONS = {
  resultTypes: ['violations'] as ('violations')[],
  // WCAG-tagged rules only — excludes best-practice (extra noise, weak RGAA mapping).
  runOnly: {
    type: 'tag' as const,
    values: [...AXE_RUN_TAGS],
  },
};

function axeTargetToSelectors(target: NodeResult['target']): string[] {
  if (!Array.isArray(target)) return [String(target)];
  return target
    .map((chain) => (Array.isArray(chain) ? chain.join(' ') : String(chain)))
    .filter((s) => s.length > 0);
}

function toAffectedNodes(nodes: NodeResult[]): AffectedNode[] {
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

function violationsToIssues(results: AxeResults): AccessibilityIssue[] {
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

/**
 * Run axe-core against the live page and map results to RGAA issues.
 * Axe descends into same-origin iframes itself — do not pass iframe Documents
 * (cross-realm nodes fail axe's context validation and throw "arguments are invalid").
 */
export async function runAxeAudit(): Promise<AccessibilityIssue[]> {
  const axe = await loadAxe();
  const results = await axe.run(document, AXE_RUN_OPTIONS);
  return violationsToIssues(results);
}

export { summarizeIssues as summarize };
