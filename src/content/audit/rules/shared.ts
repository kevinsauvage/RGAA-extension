import type { AccessibilityIssue, Severity } from '@/lib/types';
import { criterionHelpUrl, themeForCriterion } from '@/lib/rgaa/criteria';
import { buildSelector, truncate } from '../dom-utils';

export interface RuleFinding {
  criterion: string;
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  userImpact: string;
  nodes: Array<{ selector: string; html: string }>;
}

export function toIssue(finding: RuleFinding): AccessibilityIssue {
  return {
    id: `rule-${finding.ruleId}`,
    kind: 'accessibility',
    ruleId: finding.ruleId,
    source: 'rule',
    confidence: 'likely',
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    userImpact: finding.userImpact,
    helpUrl: criterionHelpUrl(finding.criterion),
    rgaa: [
      {
        criterion: finding.criterion,
        theme: themeForCriterion(finding.criterion),
        wcag: [],
      },
    ],
    nodes: finding.nodes.map((node) => ({
      target: node.selector,
      targets: [node.selector],
      html: node.html,
      failureSummary: finding.description,
    })),
  };
}

export function multiNodeFinding(
  elements: Element[],
  partial: Omit<RuleFinding, 'nodes'>,
  limit = 10,
): RuleFinding | null {
  if (elements.length === 0) return null;
  return {
    ...partial,
    nodes: elements.slice(0, limit).map((el) => ({
      selector: buildSelector(el),
      html: truncate(el.outerHTML, 220),
    })),
  };
}
