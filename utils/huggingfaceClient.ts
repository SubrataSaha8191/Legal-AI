export async function queryHuggingFace(model: string, inputs: any, opts?: { retries?: number, wait_for_model?: boolean }) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing HUGGINGFACE_API_KEY. Add it to your environment (.env.local) and restart the server.");
  }

  const retries = opts?.retries ?? 2;

  // Encode each path segment safely (owner and model may contain characters)
  const safeModel = model.split("/").map(encodeURIComponent).join("/");
  // allow waiting for a model to spin up if caller requests it
  const url = `https://api-inference.huggingface.co/models/${safeModel}${opts?.wait_for_model ? '?wait_for_model=true' : ''}`;

  // Small helper to attempt once
  async function attemptOnce(): Promise<any> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "legal-ai-landing/1.0 (+https://example.local)"
      },
      method: "POST",
      body: JSON.stringify(inputs),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // ignore
      }
      const message = parsed?.error || parsed?.message || text || response.statusText;
      console.error("Hugging Face request failed:", { url, status: response.status, body: text?.slice(0, 1000) });

      if (response.status === 404) {
        try {
          const metaUrl = `https://huggingface.co/api/models/${safeModel}`;
          const metaRes = await fetch(metaUrl);
          const metaText = await metaRes.text().catch(() => "");
          console.error("Hugging Face model metadata:", { metaUrl, status: metaRes.status, body: metaText?.slice(0, 400) });
          throw new Error(`${message} — model not found or inaccessible. Model metadata: ${metaText?.slice(0, 400)}`);
        } catch (metaErr: any) {
          console.error("Failed to fetch model metadata:", metaErr);
          throw new Error(`${message} — model not found or inaccessible.`);
        }
      }

      throw new Error(message || `Hugging Face request failed with status ${response.status}`);
    }

    if (contentType.includes("application/json")) {
      return response.json();
    }

    // Fallback: try to parse text as JSON
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response from Hugging Face (not JSON): ${text.slice(0, 200)}`);
    }
  }

  // Retry loop with small backoff
  let lastErr: any = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await attemptOnce();
    } catch (err: any) {
      lastErr = err;
      // If it's a 4xx client error (bad input), avoid retrying
      const msg = String(err?.message || err || "").toLowerCase();
      if (msg.includes("bad request") || msg.includes("index out of range") || msg.includes("unexpected response")) {
        // return/throw immediately to let caller handle fallback
        throw err;
      }
      // small exponential backoff
      const backoff = Math.min(500 * Math.pow(2, i), 2000);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  throw lastErr || new Error("Hugging Face request failed after retries");
}
