import type { AccessibilityIssue, AiFix } from '@/lib/types';
import type { Settings } from '@/lib/storage';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompts';
import { buildChatCompletionBody, OPENAI_CHAT_URL } from './chat-completions';

interface RawFix {
  explanation: string;
  codeFix: string;
  rationale: string[];
}

function parseFix(content: string): RawFix {
  // The model is asked for pure JSON, but strip fences defensively.
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const parsed = JSON.parse(cleaned) as Partial<RawFix>;
  return {
    explanation: parsed.explanation ?? '',
    codeFix: parsed.codeFix ?? '',
    rationale: Array.isArray(parsed.rationale) ? parsed.rationale : [],
  };
}

/**
 * Generate a remediation for a single accessibility issue using the OpenAI
 * Chat Completions API. Runs in the extension context; the API key never leaves
 * the user's machine except in the direct call to OpenAI.
 */
export async function generateFix(issue: AccessibilityIssue, settings: Settings): Promise<AiFix> {
  if (!settings.openaiApiKey) {
    throw new Error(
      'No OpenAI API key configured. Add one in the extension options to enable AI fixes.',
    );
  }

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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(issue, settings.language) },
        ],
        { temperature: 0.2, jsonMode: true },
      ),
    ),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`OpenAI request failed (${response.status}). ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned an empty response.');

  const raw = parseFix(content);
  return {
    issueId: issue.id,
    explanation: raw.explanation,
    codeFix: raw.codeFix,
    rationale: raw.rationale,
    model: settings.model,
    createdAt: Date.now(),
  };
}
