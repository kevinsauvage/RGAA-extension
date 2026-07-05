import {
  buildChatCompletionBody,
  OPENAI_CHAT_URL,
  type ChatMessage,
  type ChatCompletionOptions,
} from './chat-completions';

export function stripJsonFences(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

export interface OpenAiRequestOptions extends ChatCompletionOptions {
  /** Prefix for error messages, e.g. "Deep scan batch". */
  context?: string;
}

/** Shared OpenAI Chat Completions fetch + content extraction. */
export async function openaiChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options: OpenAiRequestOptions = {},
): Promise<string> {
  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(buildChatCompletionBody(model, messages, options)),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const prefix = options.context ? `${options.context} ` : 'OpenAI request ';
    throw new Error(`${prefix}failed (${response.status}). ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(options.context ? `${options.context}: empty response.` : 'OpenAI returned an empty response.');
  }
  return content;
}
