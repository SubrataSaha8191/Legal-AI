import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n");

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return NextResponse.json({ reply: response });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response from Gemini." },
      { status: 500 }
    );
  }
}
