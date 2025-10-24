// ✅ Force Node.js runtime in Next.js
export const runtime = "nodejs";

import { readFile } from "fs/promises";
import path from "path";

/**
 * Extracts text content from a PDF file, using either pdf-parse or pdfjs-dist.
 * Works for both local (public/uploads/...) and remote URLs.
 */
export async function extractTextFromPDF(fileUrl: string): Promise<string> {
  let pdfBuffer: Buffer;

  try {
    // 🧩 1️⃣ Load the PDF file (local or remote)
    // If caller provided an absolute filesystem path, try reading it directly
    if (path.isAbsolute(fileUrl)) {
      pdfBuffer = await readFile(fileUrl);
      console.log(`[pdfUtils] Loaded PDF from absolute path ${fileUrl}`);
    } else if (fileUrl.startsWith("/")) {
      // For serverless environments (Vercel), files are in /tmp/uploads
      // For local dev, try both /tmp and public
      const safePath = fileUrl.replace(/^\/+/, "");
      const tmpPath = path.join("/tmp", safePath);
      const publicPath = path.join(process.cwd(), "public", safePath);

      try {
        pdfBuffer = await readFile(tmpPath);
        console.log(`[pdfUtils] Loaded local PDF from ${tmpPath}`);
      } catch (tmpError) {
        // Fallback to public directory for local development
        pdfBuffer = await readFile(publicPath);
        console.log(`[pdfUtils] Loaded local PDF from ${publicPath}`);
      }
    } else {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        const msg = await response.text().catch(() => response.statusText);
        throw new Error(`Failed to fetch PDF (${response.status}): ${msg}`);
      }
      pdfBuffer = Buffer.from(await response.arrayBuffer());
      console.log(`[pdfUtils] Fetched remote PDF from ${fileUrl}`);
    }
  } catch (error: any) {
    console.error("[pdfUtils] Failed to load PDF:", error.message);
    throw new Error(`Error loading PDF: ${error.message}`);
  }

  // 🧩 2️⃣ Try parsing using pdfjs-dist FIRST (works better in serverless/Vercel)
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
      console.log(`[pdfUtils] ✅ Parsed PDF successfully using pdfjs-dist (${extractedText.length} chars)`);
      return extractedText;
    } else {
      console.warn("[pdfUtils] pdfjs-dist returned empty text");
    }
  } catch (error: any) {
    console.error("[pdfUtils] pdfjs-dist failed:", error.message, error.stack);
  }

  // 🧩 3️⃣ Fallback: use pdf-parse (requires canvas, may fail in serverless)
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const parsed = await pdfParse(pdfBuffer);

    if (parsed?.text && parsed.text.trim().length > 0) {
      console.log(`[pdfUtils] ✅ Parsed PDF successfully using pdf-parse (${parsed.text.length} chars)`);
      return parsed.text.trim();
    }
  } catch (error: any) {
    console.warn("[pdfUtils] pdf-parse failed (expected in serverless):", error.message);
  }

  // 🧩 4️⃣ If both fail, provide detailed error
  const errorMsg = `Unable to extract text from PDF. Both pdfjs-dist and pdf-parse failed. File: ${fileUrl}`;
  console.error(`[pdfUtils] ${errorMsg}`);
  throw new Error(errorMsg);
}
