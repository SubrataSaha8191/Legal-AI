import { NextResponse } from "next/server";

export const runtime = "nodejs";
import {
  simplifyClauses,
  classifyClauses,
  extractLegalTerms,
} from "@/services/clauseSimplificationService";

export async function POST(req: Request) {
  try {
    const { clauses } = await req.json();
    if (!clauses || !Array.isArray(clauses))
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const simplified = await simplifyClauses(clauses);
    const classifications = await classifyClauses(simplified);
    const legalTerms = await extractLegalTerms(simplified);

    return NextResponse.json({
      success: true,
      simplified,
      classifications,
      legalTerms,
    });
  } catch (error: any) {
    console.error("Simplification Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Simplification failed" },
      { status: 500 }
    );
  }
}
