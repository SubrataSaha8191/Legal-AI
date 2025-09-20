/**
 * Perplexity API helper
 * Reads PERPLEXITY_API_KEY from server environment (never expose to client bundles).
 * For Next.js, create `.env.local` with PERPLEXITY_API_KEY=... (do NOT prefix with NEXT_PUBLIC_!).
 */

const PPLX_API_KEY = process.env.PERPLEXITY_API_KEY;

if (!PPLX_API_KEY && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('[perplexity] PERPLEXITY_API_KEY is not set. Add it to your .env.local file.');
}

export interface PerplexityOptions {
  model?: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}

export interface PerplexityResponse {
  id: string;
  output_text: string;
  raw: any; // original JSON for debugging
}

export async function askPerplexity(opts: PerplexityOptions): Promise<PerplexityResponse> {
  if (!PPLX_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY missing in environment');
  }

  const body = {
    model: opts.model || 'llama-3.1-sonar-small-128k-online',
    messages: [
      { role: 'system', content: 'You are a helpful legal AI assistant.' },
      { role: 'user', content: opts.prompt }
    ],
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.max_tokens ?? 512,
  };

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PPLX_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Perplexity API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const output = json.choices?.[0]?.message?.content || '';
  return { id: json.id || 'unknown', output_text: output, raw: json };
}

/**
 * Example (server side):
 *   const result = await askPerplexity({ prompt: 'Summarize a lease clause:' });
 */
