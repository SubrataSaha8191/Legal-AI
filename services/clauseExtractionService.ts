import { extractTextFromPDF } from "@/utils/pdfUtils";
import { queryHuggingFace } from "@/utils/huggingfaceClient";

function chunkTextByParagraphs(text: string, maxChars = 1200): string[] {
  const paragraphs = text.split(/\n{2,}/g).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length <= maxChars) {
      current = current ? `${current}\n\n${p}` : p;
    } else {
      if (current) {
        chunks.push(current);
        current = "";
      }
      if (p.length <= maxChars) {
        current = p;
      } else {
        // paragraph too large, split by characters
        for (let i = 0; i < p.length; i += maxChars) {
          chunks.push(p.slice(i, i + maxChars));
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function extractClausesFromPDF(fileUrl: string) {
  const text = await extractTextFromPDF(fileUrl);

  if (!text || text.trim().length === 0) return [];

  // First, try to extract clauses directly from the original text using smarter parsing
  // This gives us more clauses than relying only on summarization
  const directClauses = extractClausesDirectly(text);

  // If direct extraction gives us enough clauses, use those with some AI enhancement
  if (directClauses.length >= 10) {
    return directClauses;
  }

  // Otherwise, use the AI model for better extraction from chunks
  const chunks = chunkTextByParagraphs(text, 1800);

  const summaries: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      // Use a legal-domain specific model for better clause extraction
      // google/pegasus-large provides better long-form summarization and clause detection
      const prompt = `Extract all distinct legal clauses from the following text. List each clause on a separate line:\n\n${chunk}`;
      // First try with a short wait_for_model to allow cold-start
      let res = null;
      try {
        res = await queryHuggingFace("google/pegasus-large", {
          inputs: prompt,
          parameters: { max_new_tokens: 512, min_length: 50, truncation: true, do_sample: false },
        }, { retries: 1, wait_for_model: true });
      } catch (firstErr) {
        // If the first attempt fails with a HF client error like index out of range,
        // try again without waiting and with smaller parameters.
  console.warn(`First summarization attempt failed for chunk ${i}:`, (firstErr as any)?.message || firstErr);
        try {
          res = await queryHuggingFace("google/pegasus-large", {
            inputs: prompt,
            parameters: { max_new_tokens: 256, min_length: 30, truncation: true, do_sample: false },
          }, { retries: 0 });
        } catch (secondErr) {
          console.error(`Summarization chunk ${i} failed on retry:`, (secondErr as any)?.message || secondErr);
          // Skip this chunk but continue processing others
          continue;
        }
      }

      // The HF summarization endpoint may return an array of summaries
      const out = Array.isArray(res) ? (res[0]?.summary_text || "") : (res?.summary_text || "");
      if (out) summaries.push(out);
    } catch (err: any) {
      console.error(`Summarization chunk ${i} failed:`, err?.message || err);
      // Continue on failures for other chunks but surface if all fail
    }
  }

  if (summaries.length === 0) {
    // Fallback to direct extraction if AI fails
    return directClauses.length > 0 ? directClauses : [];
  }

  const outputText = summaries.join("\n\n");
  
  // Better clause splitting: split by sentence boundaries and numbered lists
  // This extracts more granular clauses from the document
  const clauses = outputText
    .split(/(?:\n{1,}|\.\s+(?=[A-Z0-9])|\d+\.\s+|\([a-z]\)\s+)/) // Split on newlines, periods before capitals, numbered lists, lettered lists
    .map((c: string) => c.trim())
    .filter((c: string) => {
      // Filter out very short fragments and keep meaningful clauses
      return c.length > 20 && !c.match(/^(and|or|the|a|an|of|in|to|for|with|on|at|by|from)$/i);
    })
    .map((c: string) => {
      // Clean up and normalize clauses
      let cleaned = c.replace(/^[^\w]+|[^\w.]+$/g, ''); // Remove leading/trailing non-word chars except periods
      // Ensure clauses end with proper punctuation
      if (!cleaned.match(/[.!?]$/)) {
        cleaned += '.';
      }
      return cleaned;
    })
    .filter(Boolean);

  // Merge with direct clauses for comprehensive extraction
  const allClauses = [...new Set([...clauses, ...directClauses])];
  
  return allClauses;
}

// Helper function to extract clauses directly from text using rule-based approach
function extractClausesDirectly(text: string): string[] {
  const clauses: string[] = [];
  
  // Split by common legal section markers and sentence boundaries
  const segments = text.split(/(?:\n\s*\n|\.\s+(?=[A-Z])|(?:^|\n)\s*(?:\d+\.|\([a-z]\)|[A-Z]\.))/);
  
  for (const segment of segments) {
    const trimmed = segment.trim();
    
    // Keep segments that look like complete clauses (20+ chars, has some structure)
    if (trimmed.length > 20 && trimmed.match(/\w/)) {
      // Further split long segments by semicolons and conjunctions that separate clauses
      const subClauses = trimmed.split(/;\s+(?=[A-Z])|,\s+(?:and|or)\s+(?=[A-Z])/);
      
      for (let sub of subClauses) {
        sub = sub.trim();
        if (sub.length > 25) {
          // Clean and normalize
          let cleaned = sub
            .replace(/^\W+|\W+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Add period if missing
          if (cleaned && !cleaned.match(/[.!?]$/)) {
            cleaned += '.';
          }
          
          if (cleaned.length > 25) {
            clauses.push(cleaned);
          }
        }
      }
    }
  }
  
  // Remove duplicates and sort by length (longer clauses first)
  const unique = [...new Set(clauses)].sort((a, b) => b.length - a.length);
  
  return unique;
}
