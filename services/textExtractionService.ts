// ✅ Force Node.js runtime in Next.js (needed for pdf-parse / fs APIs)
// Use the generic "nodejs" runtime to be compatible with Vercel's supported runtimes
export const runtime = "nodejs";

import { readFile } from "fs/promises";
import path from "path";

/**
 * Service: Extract text content from a PDF file.
 * Works with both local (absolute path or /tmp/uploads) and remote URLs.
 *
 * Automatically falls back from `pdf-parse` → `pdfjs-dist`
 * if the first parser fails.
 */
export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  let pdfBuffer: Buffer;

  try {
    // 🧩 Step 1: Load the PDF file
    if (path.isAbsolute(fileUrl)) {
      // Absolute path (e.g., /tmp/uploads/abc.pdf)
      pdfBuffer = await readFile(fileUrl);
      console.log(`[textExtractionService] Loaded PDF from ${fileUrl}`);
    } else if (fileUrl.startsWith("/")) {
      // Relative local path (try /tmp first, then public/)
      const safePath = fileUrl.replace(/^\/+/, "");
      const tmpPath = path.join("/tmp", safePath);
      const publicPath = path.join(process.cwd(), "public", safePath);

      try {
        pdfBuffer = await readFile(tmpPath);
        console.log(`[textExtractionService] Loaded PDF from ${tmpPath}`);
      } catch {
        pdfBuffer = await readFile(publicPath);
        console.log(`[textExtractionService] Loaded PDF from ${publicPath}`);
      }
    } else {
      // Remote URL fetch
      const response = await fetch(fileUrl);
      if (!response.ok) {
        const msg = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to fetch PDF (${response.status}): ${msg}`);
      }
      pdfBuffer = Buffer.from(await response.arrayBuffer());
      console.log(`[textExtractionService] Fetched remote PDF from ${fileUrl}`);
    }
  } catch (error: any) {
    console.error("[textExtractionService] Failed to load PDF:", error.message);
    throw new Error(`Error loading PDF: ${error.message}`);
  }

  // 🧩 Step 2: Try pdfjs-dist FIRST (works better in serverless/Vercel)
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
    const pdf = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str || "").join(" ");
      text += pageText + "\n";
    }

    const extractedText = text.trim();
    if (extractedText && extractedText.length > 0) {
      console.log(`[textExtractionService] ✅ Parsed PDF with pdfjs-dist (${extractedText.length} chars)`);
      return extractedText;
    } else {
      console.warn("[textExtractionService] pdfjs-dist returned empty text");
    }
  } catch (error: any) {
    console.error("[textExtractionService] pdfjs-dist failed:", error.message, error.stack);
  }

  // 🧩 Step 3: Fallback to pdf-parse (requires canvas/native deps, may fail in serverless)
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const parsed = await pdfParse(pdfBuffer);

    if (parsed?.text && parsed.text.trim().length > 0) {
      console.log(`[textExtractionService] ✅ Parsed PDF with pdf-parse (${parsed.text.length} chars)`);
      return parsed.text.trim();
    }
  } catch (error: any) {
    console.warn("[textExtractionService] pdf-parse failed (expected in serverless):", error.message);
  }

  // 🧩 Step 4: Fail-safe with detailed error
  const errorMsg = `Failed to extract text from PDF "${fileUrl}". Both pdfjs-dist and pdf-parse failed. Check logs for details.`;
  console.error(`[textExtractionService] ${errorMsg}`);
  throw new Error(errorMsg);
}
