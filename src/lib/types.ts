/**
 * Shared domain types for A11yFix AI.
 * Kept dependency-free so both content scripts and UI can import them.
 */

export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';

export type IssueKind = 'accessibility' | 'performance';

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

export type Issue = AccessibilityIssue | PerformanceIssue;

export interface CoreWebVitals {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
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

/**
 * Candidates for AI verification. Code extracts the elements and their
 * evidence; the AI only classifies each item against one narrow question.
 */
export interface CandidateBase {
  /** CSS selector usable for highlighting. */
  selector: string;
  /** Truncated outerHTML of the element. */
  html: string;
}

export interface ImageCandidate extends CandidateBase {
  alt: string;
  src: string;
  /** Nearby text (caption, heading, paragraph) to judge relevance. */
  context?: string;
}

export interface LinkCandidate extends CandidateBase {
  /** Visible text or accessible name of the link. */
  text: string;
  href: string;
  /** Surrounding sentence or parent block text. */
  context?: string;
}

export interface ButtonCandidate extends CandidateBase {
  label: string;
  context?: string;
}

export interface FieldCandidate extends CandidateBase {
  label: string;
  fieldType: string;
  name?: string;
  placeholder?: string;
}

/** Everything the AI checks need, collected in one pass by the content script. */
export interface PageCandidates {
  url: string;
  title: string;
  lang: string;
  h1: string[];
  images: ImageCandidate[];
  links: LinkCandidate[];
  buttons: ButtonCandidate[];
  fields: FieldCandidate[];
}

export interface AiAuditProgress {
  current: number;
  total: number;
  checkLabel: string;
}
