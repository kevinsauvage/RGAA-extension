import type {
  AccessibilityIssue,
  AiAuditProgress,
  PageCandidates,
} from '@/lib/types';
import type { Settings } from '@/lib/storage';
import { criterionHelpUrl, themeForCriterion } from '@/lib/rgaa/criteria';
import { AI_CHECKS, type AiCheck, type CheckItem } from './checks';
import { buildChatCompletionBody, OPENAI_CHAT_URL } from './chat-completions';

const CLASSIFIER_SYSTEM_PROMPT = `You are a strict accessibility classifier for RGAA 4.1.2 (French accessibility standard).
You receive a numbered list of items and ONE question. For EACH item, answer with a verdict:
- "fail": the evidence clearly violates the criterion. Be conservative — when in doubt, do not fail.
- "pass": the evidence satisfies the criterion.
- "uncertain": the evidence is insufficient to decide.

Rules:
- Answer for every item index, exactly once.
- Judge ONLY from the evidence given. Never assume missing information.
- "reason" must quote the evidence (e.g. the alt or label text) and be short.

Respond ONLY with JSON:
{"results": [{"index": 0, "verdict": "pass" | "fail" | "uncertain", "reason": "short reason"}]}`;

interface Verdict {
  index: number;
  verdict: 'pass' | 'fail' | 'uncertain';
  reason: string;
}

export interface AiAuditResult {
  issues: AccessibilityIssue[];
  checksRun: number;
  itemsChecked: number;
}

function buildCheckPrompt(check: AiCheck, items: CheckItem[], language: 'fr' | 'en'): string {
  const itemsBlock = items
    .map((item, index) => `#${index}\n${item.evidence.map((line) => `  ${line}`).join('\n')}`)
    .join('\n');

  return [
    `Question (RGAA ${check.criterion}): ${check.question}`,
    '',
    'Calibration examples:',
    check.examples,
    '',
    `Write each "reason" in ${language === 'fr' ? 'French' : 'English'}.`,
    '',
    `Items (${items.length}):`,
    itemsBlock,
  ].join('\n');
}

function parseVerdicts(content: string, itemCount: number): Verdict[] {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned) as { results?: unknown[] };
  if (!Array.isArray(parsed.results)) return [];

  return parsed.results
    .map((row): Verdict | null => {
      if (!row || typeof row !== 'object') return null;
      const item = row as Record<string, unknown>;
      const index = typeof item.index === 'number' ? item.index : -1;
      const verdict = item.verdict;
      if (index < 0 || index >= itemCount) return null;
      if (verdict !== 'pass' && verdict !== 'fail' && verdict !== 'uncertain') return null;
      return {
        index,
        verdict,
        reason: typeof item.reason === 'string' ? item.reason : '',
      };
    })
    .filter((verdict): verdict is Verdict => verdict !== null);
}

async function classify(
  check: AiCheck,
  items: CheckItem[],
  settings: Settings,
): Promise<Verdict[]> {
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
          { role: 'system', content: CLASSIFIER_SYSTEM_PROMPT },
          { role: 'user', content: buildCheckPrompt(check, items, settings.language) },
        ],
        { temperature: 0, jsonMode: true },
      ),
    ),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `AI check "${check.id}" failed (${response.status}). ${detail.slice(0, 160)}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  console.log("🚀 ~ classify ~ data:", data)

  const content = data.choices?.[0]?.message?.content;
  console.log("🚀 ~ classify ~ content:", content)
  if (!content) return [];
  return parseVerdicts(content, items.length);
}

function toIssue(
  check: AiCheck,
  item: CheckItem,
  reason: string,
  language: 'fr' | 'en',
): AccessibilityIssue {
  return {
    id: `ai-${check.id}-${item.selector.replace(/\W+/g, '-').slice(0, 40)}`,
    kind: 'accessibility',
    ruleId: `ai-${check.id}`,
    source: 'ai',
    confidence: 'likely',
    severity: check.severity,
    title: check.issueTitle[language],
    description: reason || check.question,
    userImpact: check.userImpact[language],
    helpUrl: criterionHelpUrl(check.criterion),
    rgaa: [
      {
        criterion: check.criterion,
        theme: themeForCriterion(check.criterion),
        wcag: [],
      },
    ],
    nodes: [
      {
        target: item.selector,
        targets: [item.selector],
        html: item.html,
        failureSummary: reason,
      },
    ],
  };
}

/**
 * Run all AI verification checks against the extracted candidates.
 * Only "fail" verdicts become issues; "uncertain" is dropped (precision first).
 */
export async function runAiAudit(
  candidates: PageCandidates,
  settings: Settings,
  onProgress?: (progress: AiAuditProgress) => void,
): Promise<AiAuditResult> {
  if (!settings.openaiApiKey) {
    throw new Error(
      'No OpenAI API key configured. Add one in Settings to run the AI audit.',
    );
  }

  const checks = AI_CHECKS.map((check) => ({
    check,
    items: check.getItems(candidates),
  })).filter(({ items }) => items.length > 0);

  const issues: AccessibilityIssue[] = [];
  let itemsChecked = 0;

  for (let index = 0; index < checks.length; index++) {
    const { check, items } = checks[index];
    onProgress?.({
      current: index + 1,
      total: checks.length,
      checkLabel: check.label[settings.language],
    });

    const verdicts = await classify(check, items, settings);
    itemsChecked += items.length;

    for (const verdict of verdicts) {
      if (verdict.verdict !== 'fail') continue;
      issues.push(toIssue(check, items[verdict.index], verdict.reason, settings.language));
    }
  }

  return { issues, checksRun: checks.length, itemsChecked };
}
