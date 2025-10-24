import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import os from "os";
import { extractTextFromPDF } from "@/services/textExtractionService";


export const runtime = "nodejs20.x";

import { extractClausesFromPDF } from "@/services/clauseExtractionService";
import {
  simplifyClauses,
  classifyClauses,
  extractLegalTerms,
} from "@/services/clauseSimplificationService";
import { classifyDocumentSections } from "@/services/documentClassificationService";

function sseJson(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  // If client accepts text/event-stream, stream progress updates
  const accept = req.headers.get("accept") || "";

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Protect serverless environments from very large uploads which can OOM or timeout.
  // Default max size 10 MiB, can be overridden by UPLOAD_MAX_BYTES env var.
  const MAX_UPLOAD_BYTES = parseInt(process.env.UPLOAD_MAX_BYTES || "10485760", 10); // 10 * 1024 * 1024
  if (file.size > MAX_UPLOAD_BYTES) {
    console.warn(`[analyze-document] Uploaded file too large: ${file.size} bytes (max ${MAX_UPLOAD_BYTES})`);
    return NextResponse.json({ error: `Uploaded file is too large. Max allowed is ${MAX_UPLOAD_BYTES} bytes.` }, { status: 413 });
  }

  // Use OS temp directory for platform-safe temporary uploads
  const tmpRoot = os.tmpdir();
  const uploadsDir = path.join(tmpRoot, "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // Generate unique filename
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filepath = path.join(uploadsDir, filename);

  // Convert file to buffer and save
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filepath, buffer);

  // File URL for processing - use absolute filepath so extraction can read directly
  const fileUrl = filepath;

  console.log(`[analyze-document] Processing file: ${filename}`);

  if (accept.includes("text/event-stream")) {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Extract raw text to get document info
          controller.enqueue(sseJson({ step: "uploading", status: "completed", message: "File uploaded" }));

          const rawText = await extractTextFromPDF(fileUrl);
          const wordCount = rawText.split(/\s+/).length;
          const charCount = rawText.length;
          const estimatedPages = Math.ceil(charCount / 2000); // rough estimate

          // Step 2: Extract clauses first
          controller.enqueue(sseJson({ step: "extracting", status: "loading", message: "Extracting clauses" }));
          const extractedClauses = await extractClausesFromPDF(fileUrl);
          controller.enqueue(sseJson({ step: "extracting", status: "completed", message: `Extracted ${extractedClauses.length} clauses`, resultCount: extractedClauses.length }));

          // Step 3: Simplify clauses
          controller.enqueue(sseJson({ step: "simplifying", status: "loading", message: "Simplifying clauses" }));
          const simplifiedClauses = await simplifyClauses(extractedClauses, async (info) => {
            controller.enqueue(sseJson({ step: info.step, status: 'loading', index: info.index, total: info.total, message: info.message }));
          });
          controller.enqueue(sseJson({ step: "simplifying", status: "completed", message: "Simplification complete" }));

          // Step 4: Classify clauses (internal per-clause classification) - send clause-specific progress with a distinct step so UI won't treat it as the final document classification
          controller.enqueue(sseJson({ step: "clause_classifying", status: "loading", message: "Classifying clauses" }));
          const clauseClassifications = await classifyClauses(simplifiedClauses, async (info) => {
            controller.enqueue(sseJson({ step: info.step || 'clause_classifying', status: 'loading', index: info.index, total: info.total, message: info.message, result: info.result }));
          });
          controller.enqueue(sseJson({ step: "clause_classifying", status: "completed", message: "Clause classification complete", resultCount: clauseClassifications.length }));

          // Step 5: Primary Document Classification (moved to last visible step)
          controller.enqueue(sseJson({ step: "classifying", status: "loading", message: "Classifying document" }));
          const primaryClassification = await classifyDocumentSections(fileUrl);
          controller.enqueue(sseJson({ step: "classifying", status: "completed", message: "Document classification complete", result: primaryClassification }));

          // Step 6: Extract legal terms (entities) using HuggingFace NER
          controller.enqueue(sseJson({ step: "terms", status: "loading", message: "Extracting legal terms" }));
          const legalTerms = await extractLegalTerms(simplifiedClauses, async (info) => {
            controller.enqueue(sseJson({ step: info.step, status: 'loading', index: info.index, total: info.total, message: info.message }));
          });
          controller.enqueue(sseJson({ step: "terms", status: "completed", message: `Found ${legalTerms.length} terms` }));

          // Build unified analysis result matching the UI expectations
          const analysisResult = {
            document_info: {
              filename: file.name,
              size_bytes: file.size,
              pages: estimatedPages,
              word_count: wordCount,
              char_count: charCount,
            },
            classification: {
              primary_classification: primaryClassification,
              confidence_score: "High",
            },
            clauses: {
              total_found: extractedClauses.length,
              classifications: clauseClassifications,
            },
            summary: {
              document_type: primaryClassification,
              key_clauses: clauseClassifications.slice(0, 10).map((c, idx) => ({
                id: idx + 1,
                type: c.label || "General",
                original: extractedClauses[idx] || "",
                simplified: simplifiedClauses[idx] || "",
              })),
              main_parties: legalTerms
                .filter((term) => term.length > 2)
                .slice(0, 5)
                .map((text) => ({ text, type: "ORG" })),
              important_dates: [],
            },
            legal_terms: legalTerms,
            raw_clauses: extractedClauses,
            simplified_clauses: simplifiedClauses,
          };

          controller.enqueue(sseJson({ step: "done", status: "completed", message: "Analysis complete", data: analysisResult }));
        } catch (err) {
          console.error("[analyze-document] Error in stream:", err);
          controller.enqueue(sseJson({ step: "error", status: "failed", message: (err as any)?.message || String(err) }));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  // Fallback: non-streaming (existing behavior)
  try {
    const rawText = await extractTextFromPDF(fileUrl);
    const wordCount = rawText.split(/\s+/).length;
    const charCount = rawText.length;
    const estimatedPages = Math.ceil(charCount / 2000);

  // Extract -> Simplify -> Clause-classify -> Document-classify -> Terms
  const extractedClauses = await extractClausesFromPDF(fileUrl);
  const simplifiedClauses = await simplifyClauses(extractedClauses);
  const clauseClassifications = await classifyClauses(simplifiedClauses);
  const primaryClassification = await classifyDocumentSections(fileUrl);
  const legalTerms = await extractLegalTerms(simplifiedClauses);

    const analysisResult = {
      document_info: {
        filename: file.name,
        size_bytes: file.size,
        pages: estimatedPages,
        word_count: wordCount,
        char_count: charCount,
      },
      classification: {
        primary_classification: primaryClassification,
        confidence_score: "High",
      },
      clauses: {
        total_found: extractedClauses.length,
        classifications: clauseClassifications,
      },
      summary: {
        document_type: primaryClassification,
        key_clauses: clauseClassifications.slice(0, 10).map((c, idx) => ({
          id: idx + 1,
          type: c.label || "General",
          original: extractedClauses[idx] || "",
          simplified: simplifiedClauses[idx] || "",
        })),
        main_parties: legalTerms
          .filter((term) => term.length > 2)
          .slice(0, 5)
          .map((text) => ({ text, type: "ORG" })),
        important_dates: [],
      },
      legal_terms: legalTerms,
      raw_clauses: extractedClauses,
      simplified_clauses: simplifiedClauses,
    };

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error: any) {
    console.error("[analyze-document] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Document analysis failed. Please check server logs.",
      },
      { status: 500 }
    );
  }
}
