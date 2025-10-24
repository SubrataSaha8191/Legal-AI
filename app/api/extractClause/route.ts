import { NextResponse } from "next/server";

export const runtime = "nodejs20.x";
import { extractClausesFromPDF } from "@/services/clauseExtractionService";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) return NextResponse.json({ error: "Missing file URL" }, { status: 400 });

    const clauses = await extractClausesFromPDF(fileUrl);
    return NextResponse.json({ success: true, clauses });
  } catch (error: any) {
    console.error("Clause Extraction Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Clause extraction failed" },
      { status: 500 }
    );
  }
}
