/**
 * Shared domain types for A11yFix AI.
 * Kept dependency-free so both content scripts and UI can import them.
 */

export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

export type IssueSource = 'axe' | 'ai' | 'rule';
export type IssueConfidence = 'certain' | 'likely' | 'needs-review';

/** A single RGAA criterion reference (e.g. { theme: 1, criterion: '1.1' }). */
export interface RgaaReference {
  /** RGAA criterion identifier, e.g. "1.1". */
  criterion: string;
  /** Human readable theme name, e.g. "Images". */
  theme: string;
  /** Related WCAG success criteria, e.g. ["1.1.1"]. */
  wcag: string[];
}

/** A DOM node implicated in an issue. */
export interface AffectedNode {
  /** Primary CSS selector for the element. */
  target: string;
  /** Alternative selectors (axe provides fallbacks). */
  targets?: string[];
  /** Truncated outerHTML snippet of the element. */
  html: string;
  /** Human-readable failure summary for this node. */
  failureSummary?: string;
}

/** A single detected accessibility issue (post RGAA mapping). */
export interface AccessibilityIssue {
  id: string;
  kind: 'accessibility';
  /** axe rule id or custom rule id that produced this issue. */
  ruleId: string;
  /** Engine that produced this finding. */
  source: IssueSource;
  /** How confident we are (AI findings are heuristic). */
  confidence: IssueConfidence;
  severity: Severity;
  title: string;
  description: string;
  /** How this affects a real user (short, filled by engine or AI). */
  userImpact: string;
  helpUrl?: string;
  rgaa: RgaaReference[];
  nodes: AffectedNode[];
}

/** A single performance finding derived from Web Vitals / resource timing. */
export interface PerformanceIssue {
  id: string;
  kind: 'performance';
  metric: string;
  severity: Severity;
  title: string;
  description: string;
  value: number;
  unit: string;
  /** Recommended threshold for a "good" score. */
  threshold: number;
}

export interface CoreWebVitals {
  lcp: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
}

export interface ScanSummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  /** 0-100 composite accessibility score. */
  score: number;
}

export interface ScanResult {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  durationMs: number;
  summary: ScanSummary;
  accessibilityIssues: AccessibilityIssue[];
  performanceIssues: PerformanceIssue[];
  webVitals: CoreWebVitals;
}

/** AI-generated remediation for a specific issue node. */
export interface AiFix {
  issueId: string;
  /** Plain-language explanation of what a real user experiences. */
  explanation: string;
  /** Ready-to-paste corrected markup / code. */
  codeFix: string;
  /** Short bullet list of why the fix works. */
  rationale: string[];
  model: string;
  createdAt: number;
}

export interface KnownIssueRef {
  ruleId: string;
  selector: string;
  title: string;
}

export interface AiAuditProgress {
  current: number;
  total: number;
  checkLabel: string;
}
