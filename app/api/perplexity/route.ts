import { NextRequest } from 'next/server';
import { askPerplexity } from '@/lib/perplexity';

export const runtime = 'nodejs'; // ensure server environment

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, temperature, max_tokens } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt (string) is required' }), { status: 400 });
    }
    const result = await askPerplexity({ prompt, model, temperature, max_tokens });
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Unknown error' }), { status: 500 });
  }
}
