import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userData, type } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error("[GEMINI API] Error: Gemini API key is MISSING.");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Helper to generate content with fallback
    const generateContent = async (prompt: string, isJson: boolean) => {
      // Models to try in order
      const modelsToTry = ["gemini-2.5-flash-lite"];

      for (const modelName of modelsToTry) {
        try {
          console.log(`[GEMINI API] Attempting model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          return await result.response;
        } catch (error: any) {
          console.error(
            `[GEMINI API] Model ${modelName} failed:`,
            error.message
          );
          // If it's the last model, throw the error
          if (modelName === modelsToTry[modelsToTry.length - 1]) throw error;
          // Otherwise continue to next model
        }
      }
      throw new Error("All models failed");
    };

    let prompt = "";

    if (type === "daily-tip") {
      prompt = `
              Based on this user profile:
              - Age: ${userData?.age || "unknown"}
              - Gender: ${userData?.gender || "unknown"}
              - Goal: ${userData?.dietaryGoal || "general health"}
              - Health Conditions: ${
                userData?.healthConditions?.join(", ") || "none"
              }
              
              Provide a single, short, actionable daily nutrition or health tip (max 20 words).
              Return ONLY the tip text.
            `;
    } else {
      prompt = `
              Analyze this user profile as a nutritionist:
              ${JSON.stringify(userData || {})}
              
              Provide a response in strict JSON format with the following structure:
              {
                "analysis": "A brief summary of their health status (max 2 sentences)",
                "recommendations": [
                  {
                    "title": "Short title",
                    "description": "Actionable advice",
                    "priority": "high|medium|low",
                    "type": "diet|exercise|lifestyle"
                  }
                ],
                "dailyTip": "A generic healthy tip"
              }
              
              Focus on their goal: ${userData?.dietaryGoal || "general health"}.
              Return ONLY the JSON object. Do not wrap in markdown code blocks.
            `;
    }

    const response = await generateContent(prompt, type !== "daily-tip");
    let text = response.text();

    console.log("[GEMINI API] Success. Generated text length:", text.length);

    if (type === "daily-tip") {
      return NextResponse.json({ tip: text.trim() });
    }

    // Clean up text if it contains markdown code blocks
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const insights = JSON.parse(text);
      return NextResponse.json(insights);
    } catch (e) {
      console.error("[GEMINI API] JSON Parse Error", e);
      console.log("[GEMINI API] Raw text:", text);
      return NextResponse.json({
        analysis: "Generated insights could not be parsed.",
        recommendations: [],
        dailyTip: "Stay healthy!",
      });
    }
  } catch (error: any) {
    console.error("[GEMINI API] FATAL Error:", error);
    // Return full error details to frontend for debugging
    return NextResponse.json(
      {
        error: "Failed to generate AI insights",
        message: error.message,
        stack: error.stack,
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}
