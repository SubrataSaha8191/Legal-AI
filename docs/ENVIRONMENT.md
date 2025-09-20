# Environment Variables Guide

This project uses Next.js. Environment variables follow these rules:

1. Variables that MUST be available in the browser must start with `NEXT_PUBLIC_`.
2. Secret keys must NOT be prefixed with `NEXT_PUBLIC_`; they remain server-only.
3. Put real secrets in `.env.local` (gitignored). Commit only `.env.example` as a template.

## Required Variables

### Firebase (Client Visible)
These are safe(ish) to expose because Firebase config is public in web apps:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional if you do not use Analytics)

### AI / External APIs (Server Only)
- `GEMINI_API_KEY` (Gemini route)
- `PERPLEXITY_API_KEY` (Perplexity helper)
- `HUGGINGFACE_API_KEY` or `HF_API_KEY` (optional for clause simplification & NER)

### Optional Tuning
- `MAX_AI_SIMPLIFY_CLAUSES` (default 20) controls how many clauses attempt AI-based simplification before falling back to rule-based.

## Example `.env.local`
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

GEMINI_API_KEY=...
PERPLEXITY_API_KEY=...
HUGGINGFACE_API_KEY=...
MAX_AI_SIMPLIFY_CLAUSES=20
```

## Common Mistakes Avoided
- Placing JavaScript code inside `.env` (only `KEY=VALUE` lines are valid).
- Forgetting the `NEXT_PUBLIC_` prefix for values needed client-side (Firebase). 
- Accidentally exposing secrets by adding `NEXT_PUBLIC_` to server-only keys.

## Rotating Secrets
If a key is compromised:
1. Revoke it in the provider dashboard.
2. Generate a new key.
3. Update `.env.local`.
4. Restart the dev server / redeploy.

## Deployment
Most hosting providers (Vercel, Netlify, etc.) let you configure these in their dashboard. Use the same names. Do not commit `.env.local`.

---
Generated automatically to ensure correct setup.
