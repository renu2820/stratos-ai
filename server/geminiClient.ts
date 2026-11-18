import { GoogleGenAI, ThinkingLevel, type Schema } from '@google/genai';
import type { ZodType } from 'zod';

const MODEL_NAME = 'gemini-4-hydrogen';

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured on the server. Please add a valid Gemini API key in Settings > Secrets.'
    );
    (err as Error & { statusCode?: number }).statusCode = 503;
    throw err;
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export interface StructuredGenerationOptions<T> {
  systemInstruction: string;
  prompt: string;
  responseSchema: Schema;
  zodValidator: ZodType<T>;
  thinkingLevel?: ThinkingLevel;
}

function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('timeout') ||
    msg.includes('econnreset')
  );
}

export function formatGeminiApiError(error: unknown): { status: number; message: string } {
  const errObj = error as { status?: number; statusCode?: number; message?: string };
  const rawMessage = errObj?.message || 'Unexpected Gemini API failure.';
  const lower = rawMessage.toLowerCase();

  if (errObj?.statusCode === 503 && lower.includes('gemini_api_key')) {
    return { status: 503, message: rawMessage };
  }
  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || errObj?.status === 403 || errObj?.status === 400) {
    return {
      status: 400,
      message: 'Gemini API key was rejected or lacks permission. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || errObj?.status === 429) {
    return {
      status: 429,
      message: 'Gemini API rate limit or quota reached. Please wait a moment and retry.',
    };
  }
  if (lower.includes('not_found') || errObj?.status === 404) {
    return {
      status: 502,
      message: `Requested Gemini model (${MODEL_NAME}) was not found or is unavailable.`,
    };
  }
  return { status: 502, message: rawMessage };
}

export async function generateStructuredModule<T>({
  systemInstruction,
  prompt,
  responseSchema,
  zodValidator,
  thinkingLevel = ThinkingLevel.MEDIUM,
}: StructuredGenerationOptions<T>): Promise<T> {
  const ai = getClient();
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          thinkingConfig: {
            thinkingLevel,
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Gemini returned an empty response for this strategy module.');
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        throw new Error('Gemini returned malformed JSON that failed parsing.');
      }

      const validated = zodValidator.safeParse(parsedJson);
      if (!validated.success) {
        const issues = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        throw new Error(`Structured strategy output failed schema validation: ${issues}`);
      }

      return validated.data;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isRetryableError(err)) {
        const delayMs = 600 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
