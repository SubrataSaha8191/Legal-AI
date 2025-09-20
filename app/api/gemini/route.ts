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

    // Enhanced prompt for legal assistant with clean, readable responses
    const prompt = `You are a helpful legal AI assistant specializing in legal document analysis and legal advice. 

    Please respond to the following query in a clear, professional manner:
    - Use plain text formatting without markdown symbols like *, **, or other special characters
    - Organize your response with clear headings and bullet points using simple dashes (-)
    - For important points, use phrases like "Important:" or "Note:" instead of brackets
    - For benefits, use "Benefits:" or "Advantages:" 
    - For warnings, use "Warning:" or "Caution:"
    - For action items, use "Next steps:" or "Recommended actions:"
    - Write in a conversational, professional tone
    - Always include a disclaimer that this is general information and not legal advice

    Query: ${message}

    Please provide a detailed, helpful response with clean formatting suitable for display in a chat interface.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any remaining markdown or awkward formatting
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .replace(/#{1,6}\s*/g, '')       // Remove heading markers
      .replace(/\[([A-Z]+)\]/g, '$1:') // Convert [IMPORTANT] to Important:
      .replace(/\*{2,}/g, '')          // Remove multiple asterisks
      .replace(/_{2,}/g, '')           // Remove multiple underscores
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive line breaks
      .trim();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}