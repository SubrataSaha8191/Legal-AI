import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure Node.js runtime

// NOTE: We import the Gemini SDK dynamically so the codebase doesn't fail to compile
// when the package is not installed in the developer's environment. This lets
// the route return a clear runtime message instructing how to install the SDK.

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable" },
      { status: 500 }
    );
  }

  // Try to dynamically import the SDK; fail gracefully if it's missing
  let GoogleGenerativeAI: any;
  try {
    const mod = await import("@google/generative-ai");
    GoogleGenerativeAI = mod?.GoogleGenerativeAI ?? mod?.default ?? mod;
  } catch (err) {
    console.error("Gemini SDK not installed:", err);
    return NextResponse.json(
      {
        error:
          "Gemini SDK (@google/generative-ai) is not installed. Install it with `pnpm add @google/generative-ai` or disable this API.",
      },
      { status: 500 }
    );
  }

  // Create client
  let genAI: any;
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
    return NextResponse.json({ error: "Failed to initialize Gemini client" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("[gemini-chatbot] Generating response for message:", message.substring(0, 100));

    // Determine which model to use.
    // Priority:
    // 1. GEMINI_MODEL env override (full name or short name)
    // 2. If the SDK supports listModels, pick a preferred model from the account
    // 3. Fall back to a sensible hard-coded model name
    let modelName: string | undefined = process.env.GEMINI_MODEL;

    // If no explicit override, attempt to discover available models via listModels
    if (!modelName && typeof genAI.listModels === 'function') {
      try {
        const modelsList = await genAI.listModels();
        const modelsArray: string[] = Array.isArray(modelsList?.models)
          ? modelsList.models.map((m: any) => (m && typeof m === 'object' ? (m.name || m.id || m) : m))
          : (Array.isArray(modelsList) ? modelsList : []);

        const preferredPatterns = [/gemini-2\.5-pro/i, /gemini-2\./i, /gemini-1\.5/i, /bison/i, /text-bison/i, /chat/i];
        const candidates = modelsArray.filter(Boolean).map(String);
        for (const pat of preferredPatterns) {
          const pick = candidates.find((n) => pat.test(n));
          if (pick) {
            modelName = pick;
            console.log('[gemini-chatbot] Selected model from listModels:', modelName);
            break;
          }
        }
      } catch (lmErr) {
        console.warn('[gemini-chatbot] listModels discovery failed (will use fallback model):', (lmErr as any)?.message ?? lmErr);
      }
    }

    // Default fallback model if nothing discovered or configured
    if (!modelName) modelName = 'models/gemini-2.5-pro';

    // Initialize model object
    let model;
    try {
      model = genAI.getGenerativeModel({ model: modelName });
    } catch (modelError) {
      const modelErrMsg = (modelError as any)?.message ?? String(modelError);
      console.error('[gemini-chatbot] Failed to get model:', modelErrMsg);
      // If the error suggests the model isn't found, give actionable advice
      const msg = String(modelErrMsg || 'Failed to initialize AI model');
      if (/not found|404/i.test(msg)) {
        return NextResponse.json({
          error: 'Requested model not available for this account or API version',
          details: msg,
          hint: 'Run the scripts/list-models.js script or set GEMINI_MODEL to a model name that exists for your account.'
        }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to initialize AI model', details: msg }, { status: 500 });
    }

    // Enhanced prompt for legal assistant with rich markdown formatting
    const prompt = `You are a helpful legal AI assistant specializing in legal document analysis and legal advice. 

Please respond to the following query using rich markdown formatting:
- Use **bold text** for important terms and concepts
- Use bullet points (-) for lists and key points
- Use numbered lists (1., 2., 3.) for sequential steps or procedures
- Use headings (##, ###) to organize longer responses into sections
- Use tables (| ... |) when comparing multiple items or presenting structured data
- Use > blockquotes for important warnings or disclaimers
- Use \`code blocks\` for legal citations, clauses, or technical terms
- Use --- for horizontal rules to separate major sections

Structure your response with:
1. A brief summary if the topic is complex
2. Main content with clear headings and formatting
3. Key takeaways or important points in bold
4. Always end with a disclaimer blockquote

Query: ${message}

Please provide a detailed, well-formatted response that is visually engaging and easy to read.`;

    // Generate content (SDKs vary). Try multiple invocation patterns and capture errors
    console.log("[gemini-chatbot] Calling model.generateContent / generate...");
    let result: any;
    let generateError: any = null;

    const safeMessage = (e: any) => (e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e));

    // Prefer model.generateContent(prompt) signature
    // helper: retry transient errors (503, 429)
    async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, delayMs = 800): Promise<T> {
      let lastErr: any;
      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (e: any) {
          lastErr = e;
          const status = (e && e.status) || (e && e.response && e.response.status) || null;
          // retry on 429/503 or network errors
          if (status === 429 || status === 503 || !status) {
            const backoff = delayMs * Math.pow(2, i);
            console.warn(`[gemini-chatbot] transient error (status=${status}) — retrying in ${backoff}ms`, (e && e.message) || e);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }
          // non-transient: rethrow
          throw e;
        }
      }
      throw lastErr;
    }

    try {
      if (typeof model.generateContent === "function") {
        result = await retryWithBackoff(() => model.generateContent(prompt));
      }
    } catch (err) {
      generateError = err;
      console.warn('[gemini-chatbot] model.generateContent failed, will try model.generate', safeMessage(err));
    }

    // Fallback to model.generate({ prompt })
    if (!result) {
      try {
        if (typeof model.generate === "function") {
          result = await retryWithBackoff(() => model.generate({ prompt }));
        }
      } catch (err) {
        generateError = generateError || err;
        console.warn('[gemini-chatbot] model.generate also failed', safeMessage(err));
      }
    }

    if (!result) {
      console.error('[gemini-chatbot] All model generation attempts failed');
      const genErrMsg = generateError instanceof Error ? generateError.message : String(generateError);

      // First, if the client supports listModels, use it to find available models
      // and prefer a supported Gemini/Text/Bison model. This avoids trying
      // hard-coded model names that may not be available on the account.
      try {
        if (typeof genAI.listModels === 'function') {
          const modelsList = await genAI.listModels();
          console.log('[gemini-chatbot] listModels result preview:', JSON.stringify(modelsList).substring(0, 1000));

          const modelsArray: string[] = Array.isArray(modelsList?.models)
            ? modelsList.models.map((m: any) => (m && typeof m === 'object' ? (m.name || m.id || m) : m))
            : (Array.isArray(modelsList) ? modelsList : []);

          // prefer specific well-known, supported model names if present
          const preferredPatterns = [/gemini-2\.5-pro/i, /gemini-2\./i, /gemini-1\.5/i, /bison/i, /text-bison/i, /chat/i];
          const candidatesFromList = modelsArray.filter(Boolean).map(String);
          let triedAny = false;

          for (const pat of preferredPatterns) {
            const pick = candidatesFromList.find((n) => pat.test(n));
            if (pick) {
              triedAny = true;
              try {
                console.log('[gemini-chatbot] Trying model from listModels:', pick);
                const fallbackModel = genAI.getGenerativeModel({ model: pick });
                let fallbackResult: any;
                if (typeof fallbackModel.generateContent === 'function') {
                  fallbackResult = await fallbackModel.generateContent(prompt);
                } else if (typeof fallbackModel.generate === 'function') {
                  fallbackResult = await fallbackModel.generate({ prompt });
                } else {
                  console.log('[gemini-chatbot] candidate from list does not expose generate methods:', pick);
                  continue;
                }

                // extract text from fallbackResult
                const fallbackText =
                  (fallbackResult?.response && typeof fallbackResult.response.text === 'function'
                    ? await fallbackResult.response.text()
                    : (fallbackResult?.outputText ?? (fallbackResult?.output?.[0]?.content?.[0]?.text))) ??
                  (typeof fallbackResult === 'string' ? fallbackResult : JSON.stringify(fallbackResult));

                const cleaned = String(fallbackText).trim();
                if (cleaned) {
                  console.log('[gemini-chatbot] listModels candidate succeeded:', pick);
                  return NextResponse.json({ response: cleaned });
                }
              } catch (fbErr) {
                console.warn('[gemini-chatbot] listModels candidate failed:', pick, safeMessage(fbErr));
                // try next pattern
              }
            }
          }

          // if listModels returned models but none matched preferred patterns,
          // fall through to try some safe hard-coded candidates that are common.
          if (triedAny === false && candidatesFromList.length > 0) {
            console.log('[gemini-chatbot] No preferred models found in list; will try first available candidates');
            for (const pick of candidatesFromList.slice(0, 6)) {
              try {
                console.log('[gemini-chatbot] Trying model from listModels (fallback):', pick);
                const fallbackModel = genAI.getGenerativeModel({ model: pick });
                let fallbackResult: any;
                if (typeof fallbackModel.generateContent === 'function') {
                  fallbackResult = await fallbackModel.generateContent(prompt);
                } else if (typeof fallbackModel.generate === 'function') {
                  fallbackResult = await fallbackModel.generate({ prompt });
                } else {
                  continue;
                }
                const fallbackText =
                  (fallbackResult?.response && typeof fallbackResult.response.text === 'function'
                    ? await fallbackResult.response.text()
                    : (fallbackResult?.outputText ?? (fallbackResult?.output?.[0]?.content?.[0]?.text))) ??
                  (typeof fallbackResult === 'string' ? fallbackResult : JSON.stringify(fallbackResult));

                const cleaned = String(fallbackText).trim();
                if (cleaned) {
                  console.log('[gemini-chatbot] listModels candidate (first-available) succeeded:', pick);
                  return NextResponse.json({ response: cleaned });
                }
              } catch (fbErr) {
                console.warn('[gemini-chatbot] listModels candidate (first-available) failed:', pick, safeMessage(fbErr));
              }
            }
          }
        }
      } catch (listErr) {
        console.warn('[gemini-chatbot] listModels failed:', safeMessage(listErr));
      }

      // Last-resort: try a small set of safe hard-coded fallbacks. NOTE: we
      // intentionally avoid the historical 'gemini-pro' alias which may cause
      // 404s on some accounts. Prefer explicit 'models/...' names.
      const candidateModels = [
        'models/gemini-2.5-pro',
        'models/gemini-1.5',
        'models/text-bison-001',
        'text-bison-001'
      ];

      for (const candidate of candidateModels) {
        try {
          console.log('[gemini-chatbot] Trying hard-coded fallback candidate model:', candidate);
          const fallbackModel = genAI.getGenerativeModel({ model: candidate });
          let fallbackResult: any;
          if (typeof fallbackModel.generateContent === 'function') {
            fallbackResult = await fallbackModel.generateContent(prompt);
          } else if (typeof fallbackModel.generate === 'function') {
            fallbackResult = await fallbackModel.generate({ prompt });
          } else {
            continue;
          }

          const fallbackText =
            (fallbackResult?.response && typeof fallbackResult.response.text === 'function'
              ? await fallbackResult.response.text()
              : (fallbackResult?.outputText ?? (fallbackResult?.output?.[0]?.content?.[0]?.text))) ??
            (typeof fallbackResult === 'string' ? fallbackResult : JSON.stringify(fallbackResult));

          const cleaned = String(fallbackText).trim();
          if (cleaned) {
            console.log('[gemini-chatbot] Hard-coded fallback succeeded:', candidate);
            return NextResponse.json({ response: cleaned });
          }
        } catch (fbErr) {
          console.warn('[gemini-chatbot] Hard-coded fallback failed:', candidate, safeMessage(fbErr));
        }
      }

      // If we get here, nothing worked.
      return NextResponse.json({ error: 'Model generation failed', details: genErrMsg }, { status: 500 });
    }

    // SDKs return different shapes. Try to get text safely.
    console.log("[gemini-chatbot] Extracting text from result...");
    let text = "";
    try {
      // If the SDK returns a response with .response.text()
      if (result?.response && typeof result.response.text === "function") {
        text = await result.response.text();
      } else if (typeof result === "string") {
        text = result;
      } else if (result?.output?.[0]?.content?.[0]?.text) {
        text = result.output[0].content[0].text;
      } else if (result?.outputText) {
        text = result.outputText;
      } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = result.candidates[0].content.parts[0].text;
      } else if (result?.candidates?.[0]?.content) {
        text = JSON.stringify(result.candidates[0].content);
      } else {
        text = JSON.stringify(result);
      }
    } catch (err) {
      console.error("[gemini-chatbot] Failed to extract text from Gemini result:", err);
      console.error("[gemini-chatbot] Result object:", JSON.stringify(result).substring(0, 500));
      return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
    }

    console.log("[gemini-chatbot] Extracted text (first 200 chars):", String(text).substring(0, 200));

    // Return the markdown-formatted text directly without stripping formatting
    const cleanedText = String(text).trim();

    console.log("[gemini-chatbot] Successfully generated response");
    return NextResponse.json({ response: cleanedText });
  } catch (error) {
    console.error("[gemini-chatbot] Error calling Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to generate response",
      details: errorMessage 
    }, { status: 500 });
  }
}