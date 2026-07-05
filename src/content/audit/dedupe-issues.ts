import type { AccessibilityIssue, AffectedNode, IssueConfidence } from '@/lib/types';

const SKIP_LINK_RULE_IDS = new Set(['bypass', 'skip-link', 'rgaa-skip-link']);

function confidenceRank(confidence: IssueConfidence): number {
  switch (confidence) {
    case 'certain':
      return 3;
    case 'likely':
      return 2;
    case 'needs-review':
      return 1;
    default: {
      const _exhaustive: never = confidence;
      void _exhaustive;
      return 0;
    }
  }
}

function sourceRank(source: AccessibilityIssue['source']): number {
  switch (source) {
    case 'axe':
      return 3;
    case 'rule':
      return 2;
    case 'ai':
      return 1;
    default: {
      const _exhaustive: never = source;
      void _exhaustive;
      return 0;
    }
  }
}

function criteriaSet(issue: AccessibilityIssue): Set<string> {
  return new Set(issue.rgaa.map((ref) => ref.criterion));
}

function sharedCriteria(a: AccessibilityIssue, b: AccessibilityIssue): string[] {
  const setB = criteriaSet(b);
  return [...criteriaSet(a)].filter((c) => setB.has(c));
}

function nodeSelectors(issue: AccessibilityIssue): Set<string> {
  const selectors = new Set<string>();
  for (const node of issue.nodes) {
    if (node.target) selectors.add(node.target);
    node.targets?.forEach((target) => selectors.add(target));
  }
  return selectors;
}

function selectorsOverlap(a: AccessibilityIssue, b: AccessibilityIssue): boolean {
  const selectorsA = nodeSelectors(a);
  for (const selector of nodeSelectors(b)) {
    if (selectorsA.has(selector)) return true;
  }
  return false;
}

function isSkipLinkOverlap(a: AccessibilityIssue, b: AccessibilityIssue): boolean {
  if (!SKIP_LINK_RULE_IDS.has(a.ruleId) || !SKIP_LINK_RULE_IDS.has(b.ruleId)) return false;
  return sharedCriteria(a, b).includes('12.7');
}

function shouldMerge(a: AccessibilityIssue, b: AccessibilityIssue): boolean {
  if (sharedCriteria(a, b).length === 0) return false;
  if (isSkipLinkOverlap(a, b)) return true;
  return selectorsOverlap(a, b);
}

function mergeNodes(primary: AffectedNode[], secondary: AffectedNode[]): AffectedNode[] {
  const seen = new Set<string>();
  const merged: AffectedNode[] = [];

  for (const node of [...primary, ...secondary]) {
    const key = [...nodeSelectors({ nodes: [node] } as AccessibilityIssue)][0] ?? node.html;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(node);
  }

  return merged;
}

function pickPrimary(a: AccessibilityIssue, b: AccessibilityIssue): AccessibilityIssue {
  const rankA = confidenceRank(a.confidence) * 10 + sourceRank(a.source);
  const rankB = confidenceRank(b.confidence) * 10 + sourceRank(b.source);
  return rankA >= rankB ? a : b;
}

function mergeIssues(a: AccessibilityIssue, b: AccessibilityIssue): AccessibilityIssue {
  const primary = pickPrimary(a, b);
  const secondary = primary === a ? b : a;
  return {
    ...primary,
    nodes: mergeNodes(primary.nodes, secondary.nodes),
  };
}

/** Collapse overlapping axe/rule findings (e.g. RGAA 12.7 skip link checked twice). */
export function dedupeAccessibilityIssues(issues: AccessibilityIssue[]): AccessibilityIssue[] {
  const result: AccessibilityIssue[] = [];

  for (const issue of issues) {
    const matchIndex = result.findIndex((existing) => shouldMerge(existing, issue));
    if (matchIndex === -1) {
      result.push(issue);
    } else {
      result[matchIndex] = mergeIssues(result[matchIndex], issue);
    }
  }

  return result;
}
