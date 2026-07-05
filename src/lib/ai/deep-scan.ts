import type {
  AccessibilityIssue,
  AiAuditProgress,
  KnownIssueRef,
} from '@/lib/types';
import type { Settings } from '@/lib/storage';
import {
  criterionHelpUrl,
  DEEP_SCAN_CRITERIA,
  themeForCriterion,
  type RgaaCriterion,
} from '@/lib/rgaa/criteria';
import { buildChatCompletionBody, OPENAI_CHAT_URL } from './chat-completions';

/**
 * AI deep scan: sends the pruned rendered HTML plus a batch of RGAA criteria
 * to the model and asks for violations with verbatim evidence.
 *
 * Every finding is `confidence: 'needs-review'` and must survive evidence
 * and selector validation before it becomes an issue.
 * 1. the quoted evidence exists in the HTML that was sent,
 * 2. the selector resolves on the live page.
 */

interface ScanBatch {
  label: { fr: string; en: string };
  themes: number[];
}

const SCAN_BATCHES: ScanBatch[] = [
  { label: { fr: 'Images, médias et cadres', en: 'Images, media and frames' }, themes: [1, 2, 4] },
  { label: { fr: 'Navigation et consultation', en: 'Navigation and consultation' }, themes: [6, 12] },
  { label: { fr: 'Formulaires', en: 'Forms' }, themes: [11] },
  {
    label: { fr: 'Structure, présentation et tableaux', en: 'Structure, presentation and tables' },
    themes: [5, 8, 9, 10],
  },
];

const DEEP_SCAN_SYSTEM_PROMPT = `You are a meticulous RGAA 4.1.2 (French accessibility standard) auditor.
You receive the pruned rendered HTML of a web page and a list of RGAA criteria with hints.
Report ONLY clear violations of the listed criteria that are visible in the provided HTML.

Hard rules:
- NEVER invent elements. Every finding must include "evidence": an exact verbatim excerpt copied from the provided HTML (an opening tag or short fragment, max 200 characters).
- "selector" must be a valid CSS selector targeting the offending element, built ONLY from tags, ids, classes and attributes present in the evidence.
- Report each offending element at most once, under the single most relevant criterion.
- When in doubt, do NOT report. An empty findings list is a perfectly good answer.
- Do not report issues about scripts, styles or content that was stripped from the HTML.

Respond ONLY with JSON:
{"findings": [{"criterion": "9.3", "selector": "css selector", "evidence": "verbatim excerpt", "description": "short explanation"}]}`;

interface RawFinding {
  criterion: string;
  selector: string;
  evidence: string;
  description: string;
}

export interface DeepScanResult {
  issues: AccessibilityIssue[];
  criteriaChecked: number;
  /** Findings dropped because evidence or selector could not be verified. */
  rejected: number;
}

function criteriaForBatch(batch: ScanBatch): RgaaCriterion[] {
  return DEEP_SCAN_CRITERIA.filter((criterion) =>
    batch.themes.includes(Number(criterion.id.split('.')[0])),
  );
}

function buildBatchPrompt(
  criteria: RgaaCriterion[],
  html: string,
  language: 'fr' | 'en',
): string {
  const criteriaBlock = criteria
    .map((c) => `- RGAA ${c.id} — ${c.title}\n  ${c.hint}`)
    .join('\n');

  return [
    'Criteria to audit:',
    criteriaBlock,
    '',
    `Write each "description" in ${language === 'fr' ? 'French' : 'English'}.`,
    '',
    'Rendered page HTML:',
    '```html',
    html,
    '```',
  ].join('\n');
}

function parseFindings(content: string): RawFinding[] {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned) as { findings?: unknown[] };
  if (!Array.isArray(parsed.findings)) return [];

  return parsed.findings
    .map((row): RawFinding | null => {
      if (!row || typeof row !== 'object') return null;
      const item = row as Record<string, unknown>;
      if (
        typeof item.criterion !== 'string' ||
        typeof item.selector !== 'string' ||
        typeof item.evidence !== 'string' ||
        item.selector.trim() === '' ||
        item.evidence.trim() === ''
      ) {
        return null;
      }
      return {
        criterion: item.criterion.trim(),
        selector: item.selector.trim(),
        evidence: item.evidence.trim(),
        description: typeof item.description === 'string' ? item.description : '',
      };
    })
    .filter((finding): finding is RawFinding => finding !== null);
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** The model must quote the HTML it was given; anything else is a hallucination. */
function evidenceExistsInHtml(evidence: string, normalizedHtml: string): boolean {
  const normalized = normalizeWhitespace(evidence);
  if (normalized.length < 8) return false;
  return normalizedHtml.includes(normalized);
}

async function scanBatch(
  batch: ScanBatch,
  criteria: RgaaCriterion[],
  html: string,
  settings: Settings,
): Promise<RawFinding[]> {
  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.openaiApiKey}`,
    },
    body: JSON.stringify(
      buildChatCompletionBody(
        settings.model,
        [
          { role: 'system', content: DEEP_SCAN_SYSTEM_PROMPT },
          { role: 'user', content: buildBatchPrompt(criteria, html, settings.language) },
        ],
        { temperature: 0, jsonMode: true },
      ),
    ),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `Deep scan "${batch.label.en}" failed (${response.status}). ${detail.slice(0, 160)}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return [];
  return parseFindings(content);
}

function toIssue(
  finding: RawFinding,
  criterion: RgaaCriterion,
): AccessibilityIssue {
  return {
    id: `deep-${criterion.id}-${finding.selector.replace(/\W+/g, '-').slice(0, 40)}`,
    kind: 'accessibility',
    ruleId: `ai-deep-${criterion.id}`,
    source: 'ai',
    confidence: 'needs-review',
    severity: 'moderate',
    title: criterion.title,
    description: finding.description || criterion.hint,
    userImpact: finding.description || criterion.hint,
    helpUrl: criterionHelpUrl(criterion.id),
    rgaa: [
      {
        criterion: criterion.id,
        theme: themeForCriterion(criterion.id),
        wcag: [],
      },
    ],
    nodes: [
      {
        target: finding.selector,
        targets: [finding.selector],
        html: finding.evidence.slice(0, 240),
        failureSummary: finding.description,
      },
    ],
  };
}

/**
 * Run the full-page deep scan.
 * @param verifySelectors callback resolving which selectors exist on the live page
 */
export async function runDeepScan(
  html: string,
  knownIssues: KnownIssueRef[],
  settings: Settings,
  verifySelectors: (selectors: string[]) => Promise<Record<string, boolean>>,
  onProgress?: (progress: AiAuditProgress) => void,
): Promise<DeepScanResult> {
  if (!settings.openaiApiKey) {
    throw new Error('No OpenAI API key configured. Add one in Settings to run the deep scan.');
  }

  const batches = SCAN_BATCHES.map((batch) => ({
    batch,
    criteria: criteriaForBatch(batch),
  })).filter(({ criteria }) => criteria.length > 0);

  const normalizedHtml = normalizeWhitespace(html);
  const knownSelectors = new Set(
    knownIssues.map((issue) => issue.selector.trim().toLowerCase()).filter(Boolean),
  );

  const rawFindings: RawFinding[] = [];
  let rejected = 0;

  for (let index = 0; index < batches.length; index++) {
    const { batch, criteria } = batches[index];
    onProgress?.({
      current: index + 1,
      total: batches.length,
      checkLabel: batch.label[settings.language],
    });
    rawFindings.push(...(await scanBatch(batch, criteria, html, settings)));
  }

  // Validation pass 1: criterion known + evidence quoted from the actual HTML.
  const evidenceValidated = rawFindings.filter((finding) => {
    const criterion = DEEP_SCAN_CRITERIA.find((c) => c.id === finding.criterion);
    if (!criterion || !evidenceExistsInHtml(finding.evidence, normalizedHtml)) {
      rejected += 1;
      return false;
    }
    return true;
  });

  // Validation pass 2: selector must resolve on the live page.
  const selectorResults = await verifySelectors(
    [...new Set(evidenceValidated.map((finding) => finding.selector))],
  );

  const issues: AccessibilityIssue[] = [];
  const seen = new Set<string>();

  for (const finding of evidenceValidated) {
    if (!selectorResults[finding.selector]) {
      rejected += 1;
      continue;
    }
    const selector = finding.selector.trim().toLowerCase();
    const key = `${finding.criterion}|${selector}`;
    if (seen.has(key) || knownSelectors.has(selector)) continue;
    seen.add(key);

    const criterion = DEEP_SCAN_CRITERIA.find((c) => c.id === finding.criterion);
    if (!criterion) continue;
    issues.push(toIssue(finding, criterion));
  }

  return {
    issues,
    criteriaChecked: DEEP_SCAN_CRITERIA.length,
    rejected,
  };
}
