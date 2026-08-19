import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { situationText, timeOfDay, locationLabel } = await req.json();

    if (!situationText) {
      return NextResponse.json({ error: 'Situation text is required' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // Local heuristic fallback logic
    const runFallback = () => {
      const text = situationText.toLowerCase();
      const highRiskWords = ["following", "won't stop", "scared", "alone", "insisting", "threat", "lost", "drunk"];
      const modRiskWords = ["unfamiliar", "weird", "uncomfortable", "sketchy", "dark", "late"];
      
      let riskLevel = "Low";
      let shouldEscalate = false;
      const concerns = [];
      const recommendedActions = [];

      if (highRiskWords.some(w => text.includes(w))) {
        riskLevel = "High";
        shouldEscalate = true;
        concerns.push("User explicitly mentioned high-risk keywords indicating potential threat.");
        recommendedActions.push("Move to a well-lit, populated area immediately.");
        recommendedActions.push("Prepare to contact emergency services if approached.");
      } else if (modRiskWords.some(w => text.includes(w))) {
        riskLevel = "Moderate";
        concerns.push("Situation involves unfamiliar or uncomfortable elements.");
        recommendedActions.push("Stay alert and keep your phone accessible.");
        recommendedActions.push("Share your location with a trusted contact.");
      } else {
        concerns.push("No immediate high-risk indicators detected in text.");
        recommendedActions.push("Continue to monitor your surroundings.");
      }

      return {
        riskLevel,
        concerns,
        recommendedActions,
        shouldEscalate,
        source: "heuristic"
      };
    };

    if (!GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, using heuristic fallback.");
      return NextResponse.json(runFallback());
    }

    // Call Gemini API
    const systemPrompt = `You are a personal safety situation analyzer. 
Analyze the provided situation. Do NOT provide medical, legal, or guaranteed safety claims. Base your assessment ONLY on the information given. Keep concerns and actions specific and practical.
Return ONLY a valid JSON object matching this schema exactly:
{
  "riskLevel": "Low" | "Moderate" | "High",
  "concerns": ["concern 1", "concern 2"], // 2-4 items
  "recommendedActions": ["action 1", "action 2"], // 2-4 items
  "shouldEscalate": boolean
}`;

    const userPrompt = `Time of day: ${timeOfDay}\nLocation context: ${locationLabel || 'Unknown'}\nSituation: ${situationText}`;

    // Add AbortController for ~6s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{
            role: "user",
            parts: [{ text: userPrompt }]
          }],
          generationConfig: {
            response_mime_type: "application/json",
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error("Empty response from Gemini");
      }

      const parsed = JSON.parse(rawText);
      return NextResponse.json({ ...parsed, source: "ai" });
      
    } catch (err: any) {
      console.error("Gemini API call failed, falling back to heuristic:", err.message);
      return NextResponse.json(runFallback());
    }

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
