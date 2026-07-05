export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  jsonMode?: boolean;
}

export interface OpenAiRequestOptions extends ChatCompletionOptions {
  /** Prefix for error messages, e.g. "Deep scan batch". */
  context?: string;
}

export const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/** Models that only accept the API default temperature (1). */
function supportsCustomTemperature(model: string): boolean {
  const id = model.toLowerCase();
  if (id.startsWith('gpt-5')) return false;
  if (/^o\d/.test(id) || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) {
    return false;
  }
  return true;
}

function buildChatCompletionBody(
  model: string,
  messages: ChatMessage[],
  options: ChatCompletionOptions = {},
): Record<string, unknown> {
  const body: Record<string, unknown> = { model, messages };

  if (options.temperature !== undefined && supportsCustomTemperature(model)) {
    body.temperature = options.temperature;
  }

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  return body;
}

export function stripJsonFences(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
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
    throw new Error(
      options.context ? `${options.context}: empty response.` : 'OpenAI returned an empty response.',
    );
  }
  return content;
}
