import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure Node.js runtime

export async function POST(request: NextRequest) {
  try {
    // Validate API key first
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "AI service not configured. GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    // Dynamic import to avoid module loading issues
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { topic, type } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Use a supported Gemini model name (full resource name is safest)
    // Primary choice is models/gemini-2.5-pro which supports generateContent
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });
    } catch (modelError) {
      console.error("[learn-content] Failed to get model:", modelError);
      return NextResponse.json(
        { 
          error: "Failed to initialize AI model",
          details: modelError instanceof Error ? modelError.message : "Model initialization failed",
          hint: "The Gemini API configuration may have changed. Check your API key and model availability."
        },
        { status: 500 }
      );
    }

    let prompt: string;

    if (type === 'content') {
      prompt = `
Create a comprehensive educational content about "${topic}" in the legal field. Structure the response with:

1. **Main heading** for the topic
2. **Introduction** paragraph
3. **Key concepts** with subheadings
4. **Important points** that should be highlighted in colored boxes
5. **Practical examples** 
6. **Conclusion**

Format the response as JSON with this structure:
{
  "title": "Main title",
  "introduction": "Introduction paragraph",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Section content",
      "type": "normal"
    },
    {
      "heading": "Important Note",
      "content": "Important content for colored box",
      "type": "important"
    }
  ],
  "conclusion": "Conclusion paragraph"
}

Types can be: "normal", "important", "warning", "benefit", "action"
Make it detailed, educational, and well-structured.`;
    } else if (type === 'questions') {
      prompt = `
Generate 20 multiple choice questions about "${topic}" in the legal field for a competitive exam style test.

Format as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Make questions challenging but fair, covering different aspects of the topic.`;
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'content' or 'questions'" }, { status: 400 });
    }

    console.log(`[learn-content] Generating ${type} for topic: ${topic}`);

    const result = await model.generateContent(prompt);

    // Safely extract text from the SDK result - different SDK versions return
    // different shapes (Response-like, outputText, output array, string, etc.)
    let text = "";
    try {
      if (result?.response && typeof result.response.text === "function") {
        // Most common: SDK returns a Response object with text() method
        text = await result.response.text();
      } else if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Direct access to candidates.content.parts.text
        text = result.candidates[0].content.parts[0].text;
      } else if (result?.output?.[0]?.content?.[0]?.text) {
        // Some older SDK shapes
        text = result.output[0].content[0].text;
      } else if (typeof result === "string") {
        text = result;
      } else if (result?.outputText) {
        text = result.outputText;
      } else if (result?.candidates?.[0]?.content) {
        // Fallback: stringify content object
        text = JSON.stringify(result.candidates[0].content);
      } else {
        // Last resort: stringify the whole result
        text = JSON.stringify(result);
      }
    } catch (ex) {
      console.error("[learn-content] Failed to extract text from model result:", ex);
      console.error("[learn-content] Result object:", JSON.stringify(result).substring(0, 500));
      return NextResponse.json({ 
        error: "Failed to extract model response",
        hint: "The AI response format was unexpected. Please try again."
      }, { status: 500 });
    }

    console.log("[learn-content] Raw AI Response (first 200 chars):", String(text).substring(0, 200));

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to find JSON object if response contains extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
      console.log("[learn-content] Extracted JSON from response");
    }
    
    try {
      const parsedResponse = JSON.parse(text);
      console.log("[learn-content] Successfully parsed AI response");
      
      // Validate the response structure
      if (type === 'content' && (!parsedResponse.title || !parsedResponse.sections)) {
        throw new Error("Invalid content structure: missing required fields");
      }
      if (type === 'questions' && (!parsedResponse.questions || !Array.isArray(parsedResponse.questions))) {
        throw new Error("Invalid questions structure: missing questions array");
      }
      
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error("[learn-content] JSON Parse Error:", parseError);
      console.error("[learn-content] Failed text:", text.substring(0, 500));
      
      // Return a more detailed error with raw response
      return NextResponse.json({ 
        error: "Failed to parse AI response as JSON", 
        details: parseError instanceof Error ? parseError.message : "Unknown parse error",
        rawResponse: text.substring(0, 500) + "...",
        hint: "The AI might not have returned valid JSON. Try a different topic or try again."
      }, { status: 500 });
    }

  } catch (error) {
    console.error("[learn-content] Error generating content:", error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    const errorDetails = error instanceof Error && error.stack ? error.stack.substring(0, 300) : "";
    
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: errorMessage,
        stack: errorDetails,
        hint: "Check your GEMINI_API_KEY and internet connection"
      },
      { status: 500 }
    );
  }
}