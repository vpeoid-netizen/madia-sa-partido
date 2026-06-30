import type { Place } from '@madia/domain';
import type { AiContext, AiResponse } from './concierge.js';

export type AiEngine = 'grounded' | 'ollama' | 'groq' | 'gemini' | 'openai';

export interface AiProviderStatus {
  engines: AiEngine[];
  active: AiEngine;
  model: string;
}

const SYSTEM_PROMPT = `You are MADIA, the tourism assistant for Partido, Camarines Sur, Philippines.

Rules:
- Use ONLY the MADIA records provided below. Never invent places, prices, schedules, contacts, or routes.
- If information is missing, say "Information not yet available in MADIA."
- Mention verification status when relevant (verified vs partially verified).
- Write in clear, friendly, conversational English suitable for travelers.
- For multiple places, use a short numbered list.
- Keep answers concise but helpful (roughly 3–8 sentences unless a list is clearer).`;

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function buildRecordContext(places: Place[], grounded: AiResponse): string {
  const recordIds = new Set(grounded.grounded_records.map((record) => record.record_id));
  const matched = places.filter((place) => recordIds.has(place.record_id));

  if (matched.length === 0) {
    return grounded.grounded_records
      .map(
        (record) =>
          `- ${record.official_name} (${record.verification_status}; source: ${record.source || 'n/a'}; updated: ${record.last_confirmed || 'n/a'})`,
      )
      .join('\n');
  }

  return matched
    .map((place) => {
      const lines = [
        `Name: ${place.official_name}`,
        `Category: ${place.category}`,
        `Type: ${place.record_type}`,
        `Municipality: ${place.municipality || 'n/a'}`,
        `Verification: ${place.verification_status}`,
        `Description: ${place.short_description || 'Information not yet available in MADIA.'}`,
        `Fee or price note: ${place.entrance_fee || place.price_range || 'Information not yet available in MADIA.'}`,
        `Operating status: ${place.operating_status || 'Information not yet available in MADIA.'}`,
        `Last confirmed: ${place.date_information_last_confirmed || 'n/a'}`,
        `Source: ${place.primary_source || 'n/a'}`,
      ];
      return lines.join('\n');
    })
    .join('\n\n---\n\n');
}

function buildUserPrompt(question: string, grounded: AiResponse, context: AiContext): string {
  const municipality = context.municipalityName || 'Partido (all municipalities)';
  const records = buildRecordContext(context.places, grounded);

  return [
    `Traveler question: ${question}`,
    `Municipality scope: ${municipality}`,
    '',
    'MADIA records (use only these):',
    records || 'None matched.',
    '',
    'Baseline answer from MADIA retrieval (you may rephrase, not add facts):',
    grounded.answer,
  ].join('\n');
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAiCompatible(params: {
  url: string;
  apiKey?: string;
  model: string;
  userPrompt: string;
  timeoutMs?: number;
}): Promise<string | null> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.apiKey) headers.Authorization = `Bearer ${params.apiKey}`;

  const res = await fetchWithTimeout(
    params.url,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: params.model,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: params.userPrompt },
        ],
      }),
    },
    params.timeoutMs ?? 20000,
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[madia-ai] chat request failed:', res.status, detail.slice(0, 300));
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function tryOllama(userPrompt: string): Promise<string | null> {
  const host = trimEnv(process.env.OLLAMA_HOST) || 'http://127.0.0.1:11434';
  const model = trimEnv(process.env.OLLAMA_MODEL) || 'llama3.2:1b';
  const timeoutMs = Number(trimEnv(process.env.OLLAMA_TIMEOUT_MS) || '90000');

  const res = await fetchWithTimeout(
    `${host.replace(/\/$/, '')}/api/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    },
    timeoutMs,
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    message?: { content?: string };
  };

  return data.message?.content?.trim() || null;
}

async function tryGroq(userPrompt: string): Promise<string | null> {
  const apiKey = trimEnv(process.env.GROQ_API_KEY);
  if (!apiKey) return null;

  const model = trimEnv(process.env.GROQ_MODEL) || 'llama-3.3-70b-versatile';

  return callOpenAiCompatible({
    url: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey,
    model,
    userPrompt,
  });
}

async function tryGemini(userPrompt: string): Promise<string | null> {
  const apiKey = trimEnv(process.env.GEMINI_API_KEY) || trimEnv(process.env.GOOGLE_API_KEY);
  if (!apiKey) return null;

  const model = trimEnv(process.env.GEMINI_MODEL) || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    },
    20000,
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[madia-ai] Gemini request failed:', res.status, detail.slice(0, 300));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function tryOpenAi(userPrompt: string): Promise<string | null> {
  const apiKey = trimEnv(process.env.AI_API_KEY) || trimEnv(process.env.OPENAI_API_KEY);
  if (!apiKey) return null;

  const model = trimEnv(process.env.AI_MODEL) || 'gpt-4o-mini';

  return callOpenAiCompatible({
    url: 'https://api.openai.com/v1/chat/completions',
    apiKey,
    model,
    userPrompt,
  });
}

type ProviderRunner = {
  engine: AiEngine;
  model: string;
  run: (userPrompt: string) => Promise<string | null>;
};

function providerRunners(): ProviderRunner[] {
  const ollamaModel = trimEnv(process.env.OLLAMA_MODEL) || 'llama3.2:1b';
  const groqModel = trimEnv(process.env.GROQ_MODEL) || 'llama-3.3-70b-versatile';
  const geminiModel = trimEnv(process.env.GEMINI_MODEL) || 'gemini-2.0-flash';
  const openAiModel = trimEnv(process.env.AI_MODEL) || 'gpt-4o-mini';

  const all: ProviderRunner[] = [
    { engine: 'ollama', model: ollamaModel, run: tryOllama },
    { engine: 'groq', model: groqModel, run: tryGroq },
    { engine: 'gemini', model: geminiModel, run: tryGemini },
    { engine: 'openai', model: openAiModel, run: tryOpenAi },
  ];

  const preferred = (trimEnv(process.env.AI_PROVIDER) || 'auto').toLowerCase();

  if (preferred === 'auto') {
    return all;
  }

  const selected = all.find((provider) => provider.engine === preferred);
  return selected ? [selected] : all;
}

export function getAiProviderStatus(): AiProviderStatus {
  const runners = providerRunners();
  const engines = runners.map((runner) => runner.engine);
  const active = engines[0] || 'grounded';

  return {
    engines: engines.length > 0 ? engines : ['grounded'],
    active,
    model: runners[0]?.model || 'madia-grounded',
  };
}

const ENGINE_LABELS: Record<AiEngine, string> = {
  grounded: 'MADIA records',
  ollama: 'Ollama (local)',
  groq: 'Groq',
  gemini: 'Google Gemini',
  openai: 'OpenAI',
};

export function getAiEngineLabel(engine: AiEngine): string {
  return ENGINE_LABELS[engine];
}

export async function phraseWithAvailableAi(
  question: string,
  grounded: AiResponse,
  context: AiContext,
): Promise<{ answer: string; provider: AiEngine; model?: string; assumption?: string } | null> {
  const userPrompt = buildUserPrompt(question, grounded, context);

  for (const runner of providerRunners()) {
    try {
      const answer = await runner.run(userPrompt);
      if (!answer) continue;

      return {
        answer,
        provider: runner.engine,
        model: runner.model,
        assumption: `Answer phrased by ${ENGINE_LABELS[runner.engine]} using grounded MADIA records only.`,
      };
    } catch (error) {
      console.error(`[madia-ai] ${runner.engine} error:`, error);
    }
  }

  return null;
}
