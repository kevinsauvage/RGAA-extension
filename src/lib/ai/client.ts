import type { AccessibilityIssue, AiFix } from '@/lib/types';
import type { Settings } from '@/lib/storage';
import { buildUserPrompt, SYSTEM_PROMPT } from './prompts';
import { openaiChatCompletion, stripJsonFences } from './openai-fetch';

interface RawFix {
  explanation: string;
  codeFix: string;
  rationale: string[];
}

function parseFix(content: string): RawFix {
  const parsed = JSON.parse(stripJsonFences(content)) as Partial<RawFix>;
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

  const content = await openaiChatCompletion(
    settings.openaiApiKey,
    settings.model,
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(issue, settings.language) },
    ],
    { temperature: 0.2, jsonMode: true, context: 'AI fix generation' },
  );

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
