import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  DietaryFilter,
  MealResponse,
  MealSuggestion,
  PantryMode,
  ServingSize,
  WeeklyPlanDay
} from "@/types/meal";

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
const WEEK_DAYS: WeeklyPlanDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

function buildPrompt(
  ingredients: string[],
  mode: PantryMode,
  filters: DietaryFilter[],
  servingSize: ServingSize,
  staples: string[],
  includeWeeklyPlan: boolean
) {
  const modeInstruction =
    mode === "lazy"
      ? "Prioritize the fastest, easiest meals with minimal prep and very short instructions."
      : "Prioritize meals that can work with very few ingredients and still feel realistic.";
  const filterInstruction =
    filters.length > 0
      ? `Respect these dietary filters: ${filters.join(", ")}.`
      : "No dietary filters are active.";
  const stapleInstruction =
    staples.length > 0
      ? `Assume the user already has these pantry staples: ${staples.join(", ")}.`
      : "Do not assume any pantry staples beyond the provided ingredients.";

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
      "pantryHighlights": ["string"],
      "servings": "1-2" | "3-4" | "5+"
    }
  ],
  "groceryList": ["string"],
  "weeklyPlan": {
    "days": [
      {
        "day": "Monday",
        "mealTitle": "string",
        "mealSummary": "string",
        "prepFocus": "string",
        "leftoverTip": "string"
      }
    ]
  }
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
- servings must match the requested serving size bucket.
- Grocery list should contain a deduplicated short list of the most useful missing items across all meals.
- ${
    includeWeeklyPlan
      ? "Include a 7-day weeklyPlan that reuses meal ideas intelligently across the week."
      : "If weeklyPlan is not needed, return an empty weeklyPlan.days array."
  }
- Do not include markdown or commentary.
- ${modeInstruction}
- ${filterInstruction}
- ${stapleInstruction}

Requested serving size:
${servingSize}

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
              : [],
            servings:
              meal.servings === "1-2" || meal.servings === "5+"
                ? meal.servings
                : "3-4"
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

  const weeklyPlan = data.weeklyPlan && Array.isArray(data.weeklyPlan.days)
    ? {
        days: data.weeklyPlan.days
          .filter((entry) => entry && typeof entry.day === "string" && typeof entry.mealTitle === "string")
          .slice(0, 7)
          .map((entry) => ({
            day: WEEK_DAYS.includes(entry.day as WeeklyPlanDay)
              ? (entry.day as WeeklyPlanDay)
              : "Monday",
            mealTitle: entry.mealTitle.trim(),
            mealSummary:
              typeof entry.mealSummary === "string" && entry.mealSummary.trim()
                ? entry.mealSummary.trim()
                : "A realistic meal slot built from your pantry ingredients.",
            prepFocus:
              typeof entry.prepFocus === "string" && entry.prepFocus.trim()
                ? entry.prepFocus.trim()
                : "Keep prep simple and use what is already on hand.",
            leftoverTip:
              typeof entry.leftoverTip === "string" && entry.leftoverTip.trim()
                ? entry.leftoverTip.trim()
                : "Save any extras for lunch or later in the week."
          }))
      }
    : { days: [] };

  return {
    meals,
    groceryList,
    source: data.source === "demo" ? "demo" : "ai",
    note: typeof data.note === "string" ? data.note : undefined,
    staplesUsed: Array.isArray(data.staplesUsed)
      ? data.staplesUsed.filter((item): item is string => typeof item === "string")
      : [],
    weeklyPlan
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
  missingIngredients: string[],
  servings: ServingSize
): MealSuggestion {
  return {
    title,
    summary,
    fitLabel,
    missingIngredients,
    steps,
    timeEstimate,
    pantryHighlights: ingredients.slice(0, 3).map(titleCase),
    servings
  };
}

function generateDemoMeals(
  ingredients: string[],
  mode: PantryMode,
  filters: DietaryFilter[],
  servingSize: ServingSize,
  staples: string[]
): MealResponse {
  const primary = ingredients[0] ?? "pantry staples";
  const secondary = ingredients[1] ?? "whatever is in the fridge";
  const ingredientsAndStaples = Array.from(new Set([...ingredients, ...staples]));
  const extraOne = pickExtras(ingredientsAndStaples, 1);
  const extraTwo = pickExtras(ingredientsAndStaples, 2);
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
      [],
      servingSize
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
      extraTwo,
      servingSize
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
      extraOne,
      servingSize
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
      pickExtras(ingredientsAndStaples, 2),
      servingSize
    )
  ];

  const weeklyPlan = {
    days: WEEK_DAYS.map((day, index) => {
      const meal = meals[index % meals.length];

      return {
        day,
        mealTitle: meal.title,
        mealSummary: meal.summary,
        prepFocus:
          index < 2
            ? "Use the fastest prep path and batch one base ingredient early in the week."
            : index < 5
              ? "Reuse a sauce, grain, or cooked protein to keep effort low."
              : "Lean into leftovers, pantry staples, and quick refreshes.",
        leftoverTip:
          index % 2 === 0
            ? "Cook a little extra so lunch is already handled tomorrow."
            : "Repurpose any extra filling or grains later in the week."
      };
    })
  };

  return {
    meals,
    groceryList: Array.from(new Set(meals.flatMap((meal) => meal.missingIngredients))).slice(0, 8),
    source: "demo",
    note: "Demo mode is active, so these meal ideas are generated locally instead of calling the OpenAI API.",
    staplesUsed: staples,
    weeklyPlan
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    ingredients?: string[];
    mode?: PantryMode;
    filters?: DietaryFilter[];
    servingSize?: ServingSize;
    staples?: string[];
    includeWeeklyPlan?: boolean;
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
  const servingSize = body.servingSize === "1-2" || body.servingSize === "5+"
    ? body.servingSize
    : "3-4";
  const staples = Array.isArray(body.staples)
    ? body.staples.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    : [];
  const includeWeeklyPlan = body.includeWeeklyPlan === true;

  try {
    if (ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one ingredient." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        generateDemoMeals(ingredients, mode, filters, servingSize, staples)
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
          content: buildPrompt(
            ingredients,
            mode,
            filters,
            servingSize,
            staples,
            includeWeeklyPlan
          )
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
        return NextResponse.json(
          generateDemoMeals(ingredients, mode, filters, servingSize, staples)
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "Unable to generate meals at the moment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
