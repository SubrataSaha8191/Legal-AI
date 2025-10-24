import { queryHuggingFace } from "@/utils/huggingfaceClient";

// ✅ Upgraded models for better legal text processing
// Using BART for actual paraphrasing/simplification instead of summarization
const SIMPLIFY_MODEL = "facebook/bart-large-cnn"; // Better for paraphrasing and simplification
const CLASSIFY_MODEL = "facebook/bart-large-mnli";
const NER_MODEL = "Jean-Baptiste/roberta-large-ner-english"; // Better entity recognition

export async function simplifyClauses(
  clauses: string[],
  progressCb?: (info: { step: string; index: number; total: number; message?: string; result?: any }) => void | Promise<void>
) {
  const simplified: string[] = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    try {
      // Direct input without instructional prompt - the model will paraphrase/simplify
      // BART is trained for paraphrasing and will naturally simplify complex text
      const res = await queryHuggingFace(SIMPLIFY_MODEL, {
        inputs: clause, // Just pass the clause directly
        parameters: { 
          max_length: 250, 
          min_length: 20, 
          do_sample: false, 
          num_beams: 4, // Use beam search for better quality
          early_stopping: true,
          no_repeat_ngram_size: 3, // Avoid repetition
        },
      }, { retries: 1, wait_for_model: true });

      let text = Array.isArray(res) ? (res[0]?.summary_text || res[0]?.generated_text || clause) : (res?.summary_text || res?.generated_text || clause);
      
      // Post-process: if the output is too similar to input or seems like it failed, try basic simplification
      if (text === clause || text.toLowerCase().includes('rewrite') || text.toLowerCase().includes('simplify')) {
        // Fallback: do basic manual simplification
        text = clause
          .replace(/\bpursuant to\b/gi, 'according to')
          .replace(/\bnotwithstanding\b/gi, 'despite')
          .replace(/\bforthwith\b/gi, 'immediately')
          .replace(/\bhereinafter\b/gi, 'from now on')
          .replace(/\bhereby\b/gi, '')
          .replace(/\bthereof\b/gi, 'of it')
          .replace(/\btherein\b/gi, 'in it')
          .replace(/\bwherein\b/gi, 'where')
          .replace(/\bshall\b/gi, 'will')
          .replace(/\bmay not\b/gi, 'cannot')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      simplified.push(text);
      if (progressCb) await Promise.resolve(progressCb({ step: 'simplifying', index: i, total: clauses.length, message: 'simplified clause', result: { original: clause, simplified: text } }));
    } catch (err) {
      console.error("Failed to simplify clause, returning original:", (err as any)?.message || err);
      simplified.push(clause);
      if (progressCb) await Promise.resolve(progressCb({ step: 'simplifying', index: i, total: clauses.length, message: 'simplify failed, used original', result: { original: clause } }));
    }
  }

  return simplified;
}

export async function classifyClauses(
  clauses: string[],
  progressCb?: (info: { step: string; index: number; total: number; message?: string; result?: any }) => void | Promise<void>
) {
  const classified: Array<{ clause: string; label: string }> = [];

  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    try {
      // Expanded legal clause categories for better classification
      const result = await queryHuggingFace(CLASSIFY_MODEL, {
        inputs: clause,
        parameters: {
          candidate_labels: [
            "Confidentiality",
            "Liability",
            "Termination",
            "Jurisdiction",
            "Indemnification",
            "Payment Terms",
            "Intellectual Property",
            "Warranties",
            "Force Majeure",
            "Dispute Resolution",
            "Governing Law",
            "Assignment",
            "Severability",
            "Amendment",
            "General",
          ],
        },
      }, { retries: 1 });

      const label = result?.labels?.[0] || "General";
      classified.push({ clause, label });
      if (progressCb) await Promise.resolve(progressCb({ step: 'classifying', index: i, total: clauses.length, message: 'classified clause', result: { clause, label } }));
    } catch (err) {
      console.error("Clause classification failed, defaulting to General:", (err as any)?.message || err);
      classified.push({ clause, label: "General" });
      if (progressCb) await Promise.resolve(progressCb({ step: 'classifying', index: i, total: clauses.length, message: 'classification failed, default General', result: { clause, label: 'General' } }));
    }
  }

  return classified;
}

export async function extractLegalTerms(
  clauses: string[],
  progressCb?: (info: { step: string; index: number; total: number; message?: string; result?: any }) => void | Promise<void>
) {
  const allTerms = new Set<string>();
  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    try {
      const result = await queryHuggingFace(NER_MODEL, { inputs: clause }, { retries: 1 });

      // Extract more entity types for comprehensive legal term detection
      (result || []).forEach((entity: any) => {
        const entityType = entity?.entity_group || entity?.entity;
        // Include ORG, MISC, PER (persons), LOC (locations), and legal-specific entities
        if (entityType && ["MISC", "ORG", "PER", "LOC", "LAW", "DATE", "MONEY", "PERCENT"].includes(entityType)) {
          const word = entity.word?.replace(/^##/, "").trim(); // Clean subword tokens
          if (word && word.length > 2) {
            allTerms.add(word);
          }
        }
      });

      if (progressCb) await Promise.resolve(progressCb({ step: 'terms', index: i, total: clauses.length, message: 'NER complete for clause', result }));
    } catch (err) {
      console.error("NER extraction failed for clause, continuing:", (err as any)?.message || err);
      if (progressCb) await Promise.resolve(progressCb({ step: 'terms', index: i, total: clauses.length, message: 'NER failed for clause', result: null }));
      continue;
    }
  }

  return Array.from(allTerms);
}
