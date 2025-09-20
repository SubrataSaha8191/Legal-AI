import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { topic, type } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedResponse = JSON.parse(text);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      // If JSON parsing fails, return the raw text
      return NextResponse.json({ 
        error: "Failed to parse AI response", 
        rawResponse: text 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}