import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { DietaryFilter, MealResponse, MealSuggestion, PantryMode } from "@/types/meal";

const EXTRA_ITEMS = [
  "olive oil",
  "garlic",
  "onion",
  "soy sauce",
  "butter",
  "lime",
  "black pepper",
  "salt",
  "eggs",
  "broth",
  "beans",
  "tomato sauce",
  "spinach",
  "yogurt",
  "hot sauce"
];

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
    groceryList,
    source: data.source === "demo" ? "demo" : "ai",
    note: typeof data.note === "string" ? data.note : undefined
  };
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function pickExtras(ingredients: string[], count: number) {
  return EXTRA_ITEMS.filter((item) => !ingredients.includes(item)).slice(0, count);
}

function buildDemoMeal(
  title: string,
  summary: string,
  ingredients: string[],
  fitLabel: MealSuggestion["fitLabel"],
  timeEstimate: string,
  steps: string[],
  missingIngredients: string[]
): MealSuggestion {
  return {
    title,
    summary,
    fitLabel,
    missingIngredients,
    steps,
    timeEstimate,
    pantryHighlights: ingredients.slice(0, 3).map(titleCase)
  };
}

function generateDemoMeals(
  ingredients: string[],
  mode: PantryMode,
  filters: DietaryFilter[]
): MealResponse {
  const primary = ingredients[0] ?? "pantry staples";
  const secondary = ingredients[1] ?? "whatever is in the fridge";
  const extraOne = pickExtras(ingredients, 1);
  const extraTwo = pickExtras(ingredients, 2);
  const timeFast = mode === "lazy" ? "15 minutes" : "12 minutes";
  const timeSlow = mode === "lazy" ? "20 minutes" : "15 minutes";
  const filterText =
    filters.length > 0 ? ` tuned for ${filters.join(", ")}` : "";

  const meals: MealSuggestion[] = [
    buildDemoMeal(
      `${titleCase(primary)} skillet toss`,
      `A fast one-pan dinner${filterText} that leans on what you already have.`,
      ingredients,
      "Uses most ingredients",
      timeFast,
      [
        `Chop or tear the ${primary} and ${secondary} into bite-size pieces.`,
        "Warm a skillet and add the ingredients that need the longest cook first.",
        "Stir in the quicker pantry items and season to taste.",
        "Cook until everything is hot, lightly crisped, and ready to serve."
      ],
      []
    ),
    buildDemoMeal(
      `Loaded ${titleCase(primary)} wraps`,
      `A flexible wrap-style meal that turns leftovers into something that feels planned.`,
      ingredients,
      "Requires 1-2 extra items",
      timeFast,
      [
        `Warm the ${primary} with any cooked ingredients you have on hand.`,
        `Add the ${secondary} and a quick sauce or seasoning if you have one.`,
        "Pile everything into wraps, tortillas, or lettuce cups.",
        "Fold and toast briefly if you want a little crunch."
      ],
      extraTwo
    ),
    buildDemoMeal(
      `${titleCase(primary)} rice bowl`,
      `A practical bowl meal that uses your pantry base and one simple finishing touch.`,
      ingredients,
      "Uses most ingredients",
      timeSlow,
      [
        "Heat any grains, rice, or starch you already have prepared.",
        `Cook or reheat the ${primary} and ${secondary} with a little oil or broth.`,
        "Layer everything into bowls and add any crunchy or fresh topping available.",
        "Season and serve while warm."
      ],
      extraOne
    ),
    buildDemoMeal(
      `Pantry hash with ${titleCase(primary)}`,
      `A low-effort clean-out-the-fridge option that still feels like a real meal.`,
      ingredients,
      "Requires 1-2 extra items",
      mode === "lazy" ? "18 minutes" : "14 minutes",
      [
        "Dice the heartiest ingredients small so they cook fast.",
        "Brown everything in a skillet until the edges pick up color.",
        "Add a splash of sauce, broth, or seasoning to bring it together.",
        "Finish with an egg, herbs, or cheese if you have them."
      ],
      pickExtras(ingredients, 2)
    )
  ];

  return {
    meals,
    groceryList: Array.from(new Set(meals.flatMap((meal) => meal.missingIngredients))).slice(0, 8),
    source: "demo",
    note: "Demo mode is active, so these meal ideas are generated locally instead of calling the OpenAI API."
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
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

  try {
    if (ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one ingredient." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(generateDemoMeals(ingredients, mode, filters));
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
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : undefined;

    if (status === 429 || status === 401 || status === 403) {
      if (ingredients.length > 0) {
        return NextResponse.json(generateDemoMeals(ingredients, mode, filters));
      }
    }

    const message =
      error instanceof Error ? error.message : "Unable to generate meals at the moment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
