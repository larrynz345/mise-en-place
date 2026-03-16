import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { text, url } = await request.json();

    if (!text && !url) {
      return NextResponse.json({ error: "No text or URL provided" }, { status: 400 });
    }

    const systemPrompt = `You are an expert culinary AI for a high-end family cookbook application called "MISE / en place".
Your task is to take unstructured recipe text or a Pinterest URL description and parse it into a structured JSON format.

Return ONLY a valid JSON object matching this exact structure:
{
  "title": "Recipe Title string",
  "category": "String (e.g., Dinner, Dessert, Breakfast, Side, etc)",
  "description": "Short 1-2 sentence description",
  "prepTime": "String (e.g., 15 mins)",
  "cookTime": "String (e.g., 45 mins)",
  "servings": Integer (number only, e.g., 4),
  "tags": ["Array", "of", "strings"],
  "ingredients": [
    {
      "amount": "String (e.g., 2 cups, 1 tsp, or leave empty if none)",
      "name": "String (e.g., all-purpose flour)"
    }
  ],
  "steps": [
    {
      "text": "String (e.g., Preheat the oven to 350°F.)",
      "timeLabel": "String or null (e.g., 30 mins, or null if no active time is specified for this step)"
    }
  ]
}

Ensure amounts are separated from ingredient names. Ensure steps are sequential. Do not include markdown formatting or \`\`\`json wrappers in your output. Just the raw JSON object.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is the recipe information to parse:\n\nURL: ${url || 'None'}\n\nTEXT:\n${text || 'None'}`,
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseText = (message.content.find((block: any) => block.type === 'text') as any)?.text;

    if (!responseText) {
      throw new Error("Failed to extract text from Anthropic response");
    }

    let jsonStr = responseText;
    const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      jsonStr = match[1];
    }

    const parsedData = JSON.parse(jsonStr.trim());

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    console.error("Anthropic parsing error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to parse recipe", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to parse recipe" },
      { status: 500 }
    );
  }
}
