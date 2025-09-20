import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Enhanced prompt for legal assistant with structured responses
    const prompt = `You are a helpful legal AI assistant specializing in legal document analysis and legal advice. 

    Please respond to the following query with a structured format that includes:
    1. A clear, comprehensive answer
    2. Important points marked with [IMPORTANT] tags for highlighting
    3. Key benefits or considerations marked with [BENEFIT] tags
    4. Warnings or risks marked with [WARNING] tags
    5. Action items marked with [ACTION] tags

    Query: ${message}

    Please provide a detailed, helpful response while making sure to include disclaimers that this is general information and not legal advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}