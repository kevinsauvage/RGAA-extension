/**
 * Helpers for OpenAI Chat Completions requests.
 * GPT-5 and reasoning (o-series) models reject non-default temperature values.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  jsonMode?: boolean;
}

/** Models that only accept the API default temperature (1). */
export function supportsCustomTemperature(model: string): boolean {
  const id = model.toLowerCase();
  if (id.startsWith('gpt-5')) return false;
  if (/^o\d/.test(id) || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) {
    return false;
  }
  return true;
}

export function buildChatCompletionBody(
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

export const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
