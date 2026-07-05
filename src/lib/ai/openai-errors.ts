import { t, type Language } from '@/lib/i18n/messages';

export type OpenAiErrorKind =
  | 'quota'
  | 'rate_limit'
  | 'auth'
  | 'model'
  | 'server'
  | 'network'
  | 'unknown';

export interface DeepScanErrorAction {
  label: string;
  type: 'settings' | 'link';
  href?: string;
}

export interface DeepScanErrorDisplay {
  kind: OpenAiErrorKind | 'pro' | 'no_api_key';
  title: string;
  body: string;
  hint?: string;
  actions: DeepScanErrorAction[];
  /** Raw message for optional disclosure. */
  technical?: string;
}

const OPENAI_BILLING_URL = 'https://platform.openai.com/account/billing';
const OPENAI_USAGE_URL = 'https://platform.openai.com/usage';

export class OpenAiApiError extends Error {
  readonly kind: OpenAiErrorKind;
  readonly status: number;
  readonly context?: string;
  readonly apiMessage?: string;

  constructor(
    kind: OpenAiErrorKind,
    status: number,
    options: { context?: string; apiMessage?: string } = {},
  ) {
    const batch = extractDeepScanBatch(options.context);
    const suffix = batch ? ` (${batch})` : '';
    super(`OpenAI ${kind}${suffix} [${status}]`);
    this.name = 'OpenAiApiError';
    this.kind = kind;
    this.status = status;
    this.context = options.context;
    this.apiMessage = options.apiMessage;
  }

  static fromResponse(status: number, body: string, context?: string): OpenAiApiError {
    const { kind, apiMessage } = classifyOpenAiResponse(status, body);
    return new OpenAiApiError(kind, status, { context, apiMessage });
  }
}

export function extractDeepScanBatch(context?: string): string | undefined {
  if (!context) return undefined;
  const match = context.match(/Deep scan "([^"]+)"/i);
  return match?.[1];
}

function classifyOpenAiResponse(
  status: number,
  body: string,
): { kind: OpenAiErrorKind; apiMessage?: string } {
  let apiMessage: string | undefined;
  let code = '';

  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: string; type?: string };
    };
    apiMessage = parsed.error?.message;
    code = (parsed.error?.code ?? parsed.error?.type ?? '').toLowerCase();
  } catch {
    apiMessage = body.trim() || undefined;
  }

  const message = (apiMessage ?? '').toLowerCase();

  if (
    status === 429 &&
    (code.includes('insufficient_quota') ||
      code.includes('billing') ||
      /quota|billing|exceeded your current quota|insufficient/i.test(message))
  ) {
    return { kind: 'quota', apiMessage };
  }

  if (status === 429 || code.includes('rate_limit')) {
    return { kind: 'rate_limit', apiMessage };
  }

  if (status === 401 || status === 403 || code.includes('invalid_api_key') || /invalid.*api key/i.test(message)) {
    return { kind: 'auth', apiMessage };
  }

  if (status === 404 || code.includes('model') || /model.*not found|does not exist/i.test(message)) {
    return { kind: 'model', apiMessage };
  }

  if (status >= 500) {
    return { kind: 'server', apiMessage };
  }

  return { kind: 'unknown', apiMessage };
}

function classifyErrorMessage(message: string): OpenAiErrorKind {
  const lower = message.toLowerCase();
  if (/429/.test(message) && /quota|billing|exceeded your current quota/i.test(lower)) return 'quota';
  if (/429/.test(message) || /rate.?limit/i.test(lower)) return 'rate_limit';
  if (/401|403/.test(message) || /invalid.*api key/i.test(lower)) return 'auth';
  if (/model.*not found|does not exist/i.test(lower)) return 'model';
  if (/500|502|503/.test(message)) return 'server';
  return 'unknown';
}

function actionLink(label: string, href: string): DeepScanErrorAction {
  return { label, type: 'link', href };
}

function actionSettings(label: string): DeepScanErrorAction {
  return { label, type: 'settings' };
}

export function formatDeepScanError(lang: Language, error: unknown): DeepScanErrorDisplay {
  if (error instanceof OpenAiApiError) {
    return formatOpenAiError(lang, error);
  }

  const message = error instanceof Error ? error.message : String(error);
  const batch =
    extractDeepScanBatch(message) ??
    message.match(/Deep scan "([^"]+)"/i)?.[1] ??
    message.match(/"([^"]+)" failed/i)?.[1];

  const kind = classifyErrorMessage(message);
  const synthetic = new OpenAiApiError(kind, 0, {
    context: batch ? `Deep scan "${batch}"` : undefined,
    apiMessage: message,
  });
  return formatOpenAiError(lang, synthetic, message);
}

function formatOpenAiError(
  lang: Language,
  error: OpenAiApiError,
  rawFallback?: string,
): DeepScanErrorDisplay {
  const batch = extractDeepScanBatch(error.context);
  const batchArg = batch ? { batch } : { batch: t(lang, 'deepScan.errors.unknownBatch') };
  const technical = error.apiMessage ?? rawFallback ?? error.message;

  switch (error.kind) {
    case 'quota':
      return {
        kind: 'quota',
        title: t(lang, 'deepScan.errors.quota.title'),
        body: t(lang, 'deepScan.errors.quota.body', batchArg),
        hint: t(lang, 'deepScan.errors.quota.hint'),
        actions: [
          actionLink(t(lang, 'deepScan.errors.quota.billing'), OPENAI_BILLING_URL),
          actionLink(t(lang, 'deepScan.errors.quota.usage'), OPENAI_USAGE_URL),
          actionSettings(t(lang, 'deepScan.errors.openSettings')),
        ],
        technical,
      };
    case 'rate_limit':
      return {
        kind: 'rate_limit',
        title: t(lang, 'deepScan.errors.rateLimit.title'),
        body: t(lang, 'deepScan.errors.rateLimit.body', batchArg),
        hint: t(lang, 'deepScan.errors.rateLimit.hint'),
        actions: [actionSettings(t(lang, 'deepScan.errors.openSettings'))],
        technical,
      };
    case 'auth':
      return {
        kind: 'auth',
        title: t(lang, 'deepScan.errors.auth.title'),
        body: t(lang, 'deepScan.errors.auth.body', batchArg),
        hint: t(lang, 'deepScan.errors.auth.hint'),
        actions: [actionSettings(t(lang, 'deepScan.errors.openSettings'))],
        technical,
      };
    case 'model':
      return {
        kind: 'model',
        title: t(lang, 'deepScan.errors.model.title'),
        body: t(lang, 'deepScan.errors.model.body', batchArg),
        hint: t(lang, 'deepScan.errors.model.hint'),
        actions: [actionSettings(t(lang, 'deepScan.errors.openSettings'))],
        technical,
      };
    case 'server':
      return {
        kind: 'server',
        title: t(lang, 'deepScan.errors.server.title'),
        body: t(lang, 'deepScan.errors.server.body', batchArg),
        hint: t(lang, 'deepScan.errors.server.hint'),
        actions: [],
        technical,
      };
    default:
      return {
        kind: 'unknown',
        title: t(lang, 'deepScan.errors.generic.title'),
        body: t(lang, 'deepScan.errors.generic.body', batchArg),
        hint: t(lang, 'deepScan.errors.generic.hint'),
        actions: [actionSettings(t(lang, 'deepScan.errors.openSettings'))],
        technical,
      };
  }
}

/** Format AI fix generation errors with the same OpenAI classification. */
export function formatAiFixError(lang: Language, error: unknown): string {
  const display = formatDeepScanError(lang, error);
  return [display.title, display.body, display.hint].filter(Boolean).join(' ');
}

export function formatDeepScanErrorFromMessage(lang: Language, message: string): DeepScanErrorDisplay {
  const decoded = decodeDeepScanError(message);
  if (decoded !== message) {
    return formatDeepScanError(lang, decoded);
  }
  if (message === t(lang, 'errors.deepScanPro')) {
    return {
      kind: 'pro',
      title: t(lang, 'deepScan.errors.pro.title'),
      body: t(lang, 'deepScan.errors.pro.body'),
      actions: [actionSettings(t(lang, 'deepScan.errors.openSettings'))],
    };
  }
  if (message === t(lang, 'deepScan.noApiKey')) {
    return {
      kind: 'no_api_key',
      title: t(lang, 'deepScan.errors.noApiKey.title'),
      body: t(lang, 'deepScan.errors.noApiKey.body'),
      actions: [actionSettings(t(lang, 'deepScan.errors.openSettings'))],
    };
  }
  return formatDeepScanError(lang, message);
}

const OAI_ERROR_PREFIX = '[[oai]]';

/** Serialize OpenAI errors for Zustand storage while keeping structured data for i18n. */
export function encodeDeepScanError(error: unknown): string {
  if (error instanceof OpenAiApiError) {
    return `${OAI_ERROR_PREFIX}${JSON.stringify({
      kind: error.kind,
      status: error.status,
      context: error.context,
      apiMessage: error.apiMessage,
    })}`;
  }
  return error instanceof Error ? error.message : String(error);
}

export function decodeDeepScanError(encoded: string): unknown {
  if (!encoded.startsWith(OAI_ERROR_PREFIX)) return encoded;
  try {
    const data = JSON.parse(encoded.slice(OAI_ERROR_PREFIX.length)) as {
      kind: OpenAiErrorKind;
      status: number;
      context?: string;
      apiMessage?: string;
    };
    return new OpenAiApiError(data.kind, data.status, {
      context: data.context,
      apiMessage: data.apiMessage,
    });
  } catch {
    return encoded;
  }
}
