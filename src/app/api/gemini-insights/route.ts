
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("[GEMINI API] Request Body:", JSON.stringify(body, null, 2));

        const { userData, type } = body;

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        console.log("[GEMINI API] API Key configured:", !!apiKey);

        if (!apiKey) {
            console.error("[GEMINI API] Error: Gemini API key is MISSING.");
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        // Helper to generate content
        const generate = async (modelName: string) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            console.log(`[GEMINI API] Calling model: ${modelName}`);

            let prompt = "";
            if (type === "daily-tip") {
                prompt = `
          Based on this user profile:
          - Age: ${userData?.age || 'unknown'}
          - Gender: ${userData?.gender || 'unknown'}
          - Goal: ${userData?.dietaryGoal || 'general health'}
          - Health Conditions: ${userData?.healthConditions?.join(", ") || 'none'}
          
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
          
          Focus on their goal: ${userData?.dietaryGoal || 'general health'}.
        `;
            }

            return axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }]
            });
        };

        let response;
        try {
            // Try the requested model first if available (or just stick to stable)
            try {
                response = await generate("gemini-1.5-flash");
            } catch (e: any) {
                console.log("[GEMINI API] gemini-1.5-flash failed:", e.message);
                console.log("[GEMINI API] Retrying with gemini-pro...");
                response = await generate("gemini-pro");
            }
        } catch (finalError) {
            throw finalError;
        }

        const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error("No content generated from Gemini API");
        }

        if (type === "daily-tip") {
            return NextResponse.json({ tip: generatedText.trim() });
        }

        // Parse JSON from markdown code block if present
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : generatedText;

        try {
            const insights = JSON.parse(jsonString);
            return NextResponse.json(insights);
        } catch (e) {
            console.error("[GEMINI API] JSON Parse Error", e);
            // Return a valid fallback JSON so frontend doesn't break
            return NextResponse.json({
                analysis: "We generated insights but couldn't format them perfectly. Here is the raw text: " + generatedText.substring(0, 100) + "...",
                recommendations: [],
                dailyTip: "Eat well and stay active!"
            });
        }

    } catch (error: any) {
        console.error("[GEMINI API] FATAL Error:", error.message);
        if (error.response) {
            console.error("[GEMINI API] Response Status:", error.response.status);
            console.error("[GEMINI API] Response Data:", JSON.stringify(error.response.data, null, 2));
        }
        return NextResponse.json(
            { error: "Failed to generate AI insights", details: error.message },
            { status: 500 }
        );
    }
}
