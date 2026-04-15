import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { DietaryFilter, MealResponse, MealSuggestion, PantryMode } from "@/types/meal";

function buildPrompt(ingredients: string[], mode: PantryMode, filters: DietaryFilter[]) {
  const modeInstruction =
    mode === "lazy"
      ? "Prioritize the fastest, easiest meals with minimal prep and very short instructions."
      : "Prioritize meals that can work with very few ingredients and still feel realistic.";
  const filterInstruction =
    filters.length > 0
      ? `Respect these dietary filters: ${filters.join(", ")}.`
      : "No dietary filters are active.";

  return `
You are PantryPal, a practical home-cooking assistant.

Return JSON only with this shape:
{
  "meals": [
    {
      "title": "string",
      "summary": "string",
      "fitLabel": "Uses most ingredients" | "Requires 1-2 extra items",
      "missingIngredients": ["string"],
      "steps": ["string"],
      "timeEstimate": "string",
      "pantryHighlights": ["string"]
    }
  ],
  "groceryList": ["string"]
}

Rules:
- Generate 3 to 5 meal ideas.
- Meals must be simple, realistic, and suitable for a busy home cook.
- Recipes do not need to use every ingredient.
- Favor meals that use the provided ingredients and need few extra items.
- Keep each summary to one short sentence.
- Keep each meal to 3 to 5 steps.
- Missing ingredients should be empty when not needed.
- Keep pantryHighlights to 1 to 3 provided ingredients worth calling out.
- timeEstimate should be short, like "15 minutes" or "25 minutes".
- Grocery list should contain a deduplicated short list of the most useful missing items across all meals.
- Do not include markdown or commentary.
- ${modeInstruction}
- ${filterInstruction}

Available ingredients:
${ingredients.join(", ")}
`;
}

function sanitizeMealResponse(data: MealResponse): MealResponse {
  const meals: MealSuggestion[] = Array.isArray(data.meals)
    ? data.meals
        .filter((meal) => meal && typeof meal.title === "string")
        .slice(0, 5)
        .map((meal): MealSuggestion => {
          const fitLabel: MealSuggestion["fitLabel"] =
            meal.fitLabel === "Requires 1-2 extra items"
              ? "Requires 1-2 extra items"
              : "Uses most ingredients";

          return {
            title: meal.title.trim(),
            summary: meal.summary?.trim() || "A simple meal built from your pantry ingredients.",
            fitLabel,
            missingIngredients: Array.isArray(meal.missingIngredients)
              ? meal.missingIngredients
                  .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
                  .slice(0, 3)
              : [],
            steps: Array.isArray(meal.steps)
              ? meal.steps
                  .filter((step): step is string => typeof step === "string" && Boolean(step.trim()))
                  .slice(0, 5)
              : [],
            timeEstimate:
              typeof meal.timeEstimate === "string" && meal.timeEstimate.trim()
                ? meal.timeEstimate.trim()
                : "20 minutes",
            pantryHighlights: Array.isArray(meal.pantryHighlights)
              ? meal.pantryHighlights
                  .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
                  .slice(0, 3)
              : []
          };
        })
        .filter((meal) => meal.steps.length >= 3)
    : [];

  const groceryList = Array.isArray(data.groceryList)
    ? Array.from(
        new Set(
          data.groceryList
            .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
            .slice(0, 8)
        )
      )
    : [];

  return {
    meals,
    groceryList
  };
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY. Add it to your .env.local file." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as {
      ingredients?: string[];
      mode?: PantryMode;
      filters?: DietaryFilter[];
    };

    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients.filter(
          (item): item is string => typeof item === "string" && Boolean(item.trim())
        )
      : [];

    const mode = body.mode === "struggle" ? "struggle" : "lazy";
    const filters = Array.isArray(body.filters)
      ? body.filters.filter(
          (filter): filter is DietaryFilter =>
            filter === "vegetarian" ||
            filter === "dairy-free" ||
            filter === "gluten-free" ||
            filter === "high-protein"
        )
      : [];

    if (ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one ingredient." },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: "You generate structured meal suggestions for a pantry app."
        },
        {
          role: "user",
          content: buildPrompt(ingredients, mode, filters)
        }
      ],
      temperature: 0.9
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("The model returned an empty response.");
    }

    const parsed = JSON.parse(content) as MealResponse;
    const sanitized = sanitizeMealResponse(parsed);

    if (sanitized.meals.length === 0) {
      throw new Error("No usable meals were generated.");
    }

    return NextResponse.json(sanitized);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate meals at the moment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
