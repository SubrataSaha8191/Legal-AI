// ✅ Force Node.js runtime in Next.js
export const runtime = "nodejs20.x";

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

  // 🧩 2️⃣ Try parsing using pdf-parse (Node.js native)
  try {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const parsed = await pdfParse(pdfBuffer);

    if (parsed?.text) {
      console.log("[pdfUtils] ✅ Parsed PDF successfully using pdf-parse");
      return parsed.text;
    }
  } catch (error: any) {
    console.warn("[pdfUtils] pdf-parse failed:", error.message);
  }

  // 🧩 3️⃣ Fallback: use pdfjs-dist
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

    console.log("[pdfUtils] ✅ Parsed PDF successfully using pdfjs-dist");
    return text.trim();
  } catch (error: any) {
    console.error("[pdfUtils] pdfjs-dist failed:", error.message);
  }

  // 🧩 4️⃣ If both fail
  throw new Error(
    "Unable to load a PDF parsing library (pdf-parse/pdfjs-dist). Ensure dependencies are installed and server restarted."
  );
}
