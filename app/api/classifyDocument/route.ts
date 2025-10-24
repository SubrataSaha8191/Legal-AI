import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { classifyDocumentSections } from "@/services/documentClassificationService";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();
    if (!fileUrl) return NextResponse.json({ error: "Missing file URL" }, { status: 400 });

    const classification = await classifyDocumentSections(fileUrl);
    return NextResponse.json({ success: true, classification });
  } catch (error: any) {
    console.error("Document Classification Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Classification failed" },
      { status: 500 }
    );
  }
}
