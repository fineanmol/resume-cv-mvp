import { spawn } from 'node:child_process';
import { cleanJson } from './gemini';

/**
 * Cursor Composer (composer-2.5) JSON generator via `cursor agent --print --mode ask`.
 * Requires CURSOR_API_KEY (or prior `cursor agent login`).
 */
export function composerEnabled(): boolean {
  if (process.env.DISABLE_COMPOSER_FALLBACK === '1') return false;
  if (process.env.AI_PROVIDER === 'gemini') return false;
  // Needs CURSOR_API_KEY or `cursor agent login`. FORCE_COMPOSER / AI_PROVIDER=composer opt in.
  return Boolean(
    process.env.CURSOR_API_KEY ||
      process.env.FORCE_COMPOSER === '1' ||
      process.env.AI_PROVIDER === 'composer',
  );
}

export function preferComposerFirst(): boolean {
  return process.env.AI_PROVIDER === 'composer' || process.env.FORCE_COMPOSER === '1';
}

function buildAskPrompt(userPrompt: string, schema: unknown): string {
  return [
    'You are a JSON-only generator for a resume/cover-letter pipeline.',
    'Do NOT use tools. Do NOT edit files. Do NOT explain.',
    'Reply with a single raw JSON object only — no markdown fences, no commentary.',
    schema
      ? `Match this JSON schema shape (field names + types):\n${JSON.stringify(schema, null, 2)}`
      : '',
    '---',
    userPrompt,
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function runCursorAgentAsk(prompt: string): Promise<string> {
  const model = process.env.COMPOSER_MODEL || 'composer-2.5';
  const args = [
    'agent',
    '--print',
    '--mode',
    'ask',
    '--trust',
    '--output-format',
    'text',
    '--model',
    model,
    prompt,
  ];

  const env = { ...process.env };
  if (process.env.CURSOR_API_KEY) {
    env.CURSOR_API_KEY = process.env.CURSOR_API_KEY;
  }

  return new Promise((resolve, reject) => {
    const child = spawn('cursor', args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Composer (cursor agent) timed out after 180s'));
    }, 180_000);

    child.stdout.on('data', (d) => {
      stdout += String(d);
    });
    child.stderr.on('data', (d) => {
      stderr += String(d);
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(
          new Error(
            `Composer (cursor agent) exited ${code}: ${(stderr || stdout).slice(0, 500)}`,
          ),
        );
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export async function composerRequestJson<T>(
  userPrompt: string,
  schema?: unknown,
): Promise<T> {
  if (!composerEnabled() && process.env.AI_PROVIDER !== 'composer') {
    throw new Error(
      'Composer fallback unavailable: set CURSOR_API_KEY (or AI_PROVIDER=composer with login).',
    );
  }

  console.warn('[ai] Using Composer (composer-2.5) for JSON generation');
  const text = await runCursorAgentAsk(buildAskPrompt(userPrompt, schema));
  try {
    return JSON.parse(cleanJson(text)) as T;
  } catch (err) {
    // Sometimes the model wraps JSON in prose — try to extract first object
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleanJson(text.slice(start, end + 1))) as T;
    }
    console.error('Composer raw response was:', text.slice(0, 800));
    throw new Error(`Composer JSON parse failed: ${(err as Error).message}`, { cause: err });
  }
}

export function extractGeminiPrompt(payload: unknown): {
  prompt: string;
  schema?: unknown;
} {
  const p = payload as {
    contents?: Array<{ parts?: Array<{ text?: string }> }>;
    generationConfig?: { responseSchema?: unknown };
  };
  const prompt = p.contents?.[0]?.parts?.[0]?.text || '';
  const schema = p.generationConfig?.responseSchema;
  if (!prompt) throw new Error('Empty Gemini payload — cannot fall back to Composer');
  return { prompt, schema };
}
