import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  DietaryFilter,
  MealResponse,
  MealSuggestion,
  NutritionGoal,
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

const GROCERY_CATEGORY_MAP: Record<string, string> = {
  yogurt: "Dairy",
  butter: "Dairy",
  eggs: "Dairy",
  spinach: "Produce",
  onion: "Produce",
  garlic: "Produce",
  lime: "Produce",
  beans: "Pantry",
  broth: "Pantry",
  "soy sauce": "Pantry",
  "tomato sauce": "Pantry",
  "hot sauce": "Pantry",
  "olive oil": "Pantry",
  "black pepper": "Pantry",
  salt: "Pantry"
};

function buildSubstitutions(ingredients: string[]) {
  const substitutions: Record<string, string> = {
    rice: "swap with quinoa or couscous if that is what you have",
    pasta: "swap with rice or noodles for the same meal base",
    tortillas: "swap with bread or lettuce cups",
    yogurt: "swap with sour cream or mayo in a pinch",
    spinach: "swap with kale or lettuce",
    cheese: "swap with yogurt sauce or avocado for creaminess",
    beans: "swap with lentils or chickpeas",
    chicken: "swap with turkey or tofu",
    eggs: "swap with tofu scramble or extra beans",
    "tomato sauce": "swap with salsa or crushed tomatoes"
  };

  return ingredients
    .filter((item) => substitutions[item])
    .slice(0, 3)
    .map((item) => ({
      original: item,
      swap: substitutions[item]
    }));
}

function buildPrompt(
  ingredients: string[],
  mode: PantryMode,
  filters: DietaryFilter[],
  servingSize: ServingSize,
  staples: string[],
  includeWeeklyPlan: boolean,
  nutritionGoal: NutritionGoal,
  useFirstIngredients: string[],
  rescueMode: boolean
) {
  const modeInstruction =
    mode === "lazy"
      ? "Prioritize the fastest, easiest meals with minimal prep and very short instructions."
      : mode === "struggle"
        ? "Prioritize meals that can work with very few ingredients and still feel realistic."
        : "Prioritize warm, cozy, satisfying meal ideas that feel comforting but still realistic for a home cook.";
  const filterInstruction =
    filters.length > 0
      ? `Respect these dietary filters: ${filters.join(", ")}.`
      : "No dietary filters are active.";
  const stapleInstruction =
    staples.length > 0
      ? `Assume the user already has these pantry staples: ${staples.join(", ")}.`
      : "Do not assume any pantry staples beyond the provided ingredients.";
  const nutritionInstruction = `Optimize premium planning for this nutrition goal: ${nutritionGoal}.`;
  const useFirstInstruction =
    useFirstIngredients.length > 0
      ? `Prioritize these ingredients before anything else: ${useFirstIngredients.join(", ")}.`
      : "No special use-first ingredients are selected.";
  const rescueInstruction = rescueMode
    ? "Empty-fridge rescue mode is on. Favor ultra-flexible, forgiving meals that work with one or two core ingredients and common pantry basics."
    : "Empty-fridge rescue mode is off.";

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
      "substitutions": [{"original": "string", "swap": "string"}],
      "steps": ["string"],
      "finishTip": "string",
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
        "leftoverTip": "string",
        "leftoverSource": "string"
      }
    ]
  },
  "groceryExport": {
    "sections": [
      {
        "category": "string",
        "items": ["string"]
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
- Keep each meal to 4 to 6 clear cooking instructions.
- Each step should include a concrete action and a useful cue such as time, heat level, texture, or doneness.
- Missing ingredients should be empty when not needed.
- finishTip should be one short sentence with a serving, storage, or flavor tip.
- substitutions should include 0 to 3 realistic simple swaps when helpful.
- Keep pantryHighlights to 1 to 3 provided ingredients worth calling out.
- timeEstimate should be short, like "15 minutes" or "25 minutes".
- servings must match the requested serving size bucket.
- Grocery list should contain a deduplicated short list of the most useful missing items across all meals.
- ${
    includeWeeklyPlan
      ? "Include a 7-day weeklyPlan that reuses meal ideas intelligently across the week with clear leftover chaining when helpful."
      : "If weeklyPlan is not needed, return an empty weeklyPlan.days array."
  }
- Always include a groceryExport grouped into useful shopping categories.
- Do not include markdown or commentary.
- ${modeInstruction}
- ${filterInstruction}
- ${stapleInstruction}
- ${nutritionInstruction}
- ${useFirstInstruction}
- ${rescueInstruction}

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
            substitutions: Array.isArray(meal.substitutions)
              ? meal.substitutions
                  .filter(
                    (item): item is { original: string; swap: string } =>
                      typeof item === "object" &&
                      item !== null &&
                      typeof item.original === "string" &&
                      typeof item.swap === "string"
                  )
                  .slice(0, 3)
              : [],
            steps: Array.isArray(meal.steps)
              ? meal.steps
                  .filter((step): step is string => typeof step === "string" && Boolean(step.trim()))
                  .slice(0, 6)
              : [],
            finishTip:
              typeof meal.finishTip === "string" && meal.finishTip.trim()
                ? meal.finishTip.trim()
                : "Taste before serving and adjust salt, acid, or heat if needed.",
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
        .filter((meal) => meal.steps.length >= 4)
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
                : "Save any extras for lunch or later in the week.",
            leftoverSource:
              typeof entry.leftoverSource === "string" && entry.leftoverSource.trim()
                ? entry.leftoverSource.trim()
                : undefined
          }))
      }
    : { days: [] };

  const groceryExport = data.groceryExport && Array.isArray(data.groceryExport.sections)
    ? {
        sections: data.groceryExport.sections
          .filter((section) => section && typeof section.category === "string")
          .map((section) => ({
            category: section.category.trim() || "Pantry",
            items: Array.isArray(section.items)
              ? section.items.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
              : []
          }))
          .filter((section) => section.items.length > 0)
      }
    : { sections: [] };

  return {
    meals,
    groceryList,
    source: data.source === "demo" ? "demo" : "ai",
    note: typeof data.note === "string" ? data.note : undefined,
    staplesUsed: Array.isArray(data.staplesUsed)
      ? data.staplesUsed.filter((item): item is string => typeof item === "string")
      : [],
    useFirstIngredients: Array.isArray(data.useFirstIngredients)
      ? data.useFirstIngredients.filter((item): item is string => typeof item === "string")
      : [],
    rescueMode: data.rescueMode === true,
    nutritionGoal:
      data.nutritionGoal === "high-protein" ||
      data.nutritionGoal === "lower-carb" ||
      data.nutritionGoal === "budget-conscious"
        ? data.nutritionGoal
        : "balanced",
    weeklyPlan,
    groceryExport
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
  finishTip: string,
  missingIngredients: string[],
  servings: ServingSize
): MealSuggestion {
  return {
    title,
    summary,
    fitLabel,
    missingIngredients,
    substitutions: buildSubstitutions(ingredients),
    steps,
    finishTip,
    timeEstimate,
    pantryHighlights: ingredients.slice(0, 3).map(titleCase),
    servings
  };
}

function buildDemoGroceryExport(items: string[]) {
  const groups = new Map<string, string[]>();

  for (const item of items) {
    const category = GROCERY_CATEGORY_MAP[item] ?? "Other";
    const existing = groups.get(category) ?? [];
    groups.set(category, [...existing, item]);
  }

  return {
    sections: Array.from(groups.entries()).map(([category, groupedItems]) => ({
      category,
      items: groupedItems
    }))
  };
}

function generateDemoMeals(
  ingredients: string[],
  mode: PantryMode,
  filters: DietaryFilter[],
  servingSize: ServingSize,
  staples: string[],
  nutritionGoal: NutritionGoal,
  useFirstIngredients: string[],
  rescueMode: boolean
): MealResponse {
  const primary = useFirstIngredients[0] ?? ingredients[0] ?? "pantry staples";
  const secondary = useFirstIngredients[1] ?? ingredients[1] ?? "whatever is in the fridge";
  const ingredientsAndStaples = Array.from(new Set([...ingredients, ...staples]));
  const extraOne = pickExtras(ingredientsAndStaples, 1);
  const extraTwo = pickExtras(ingredientsAndStaples, 2);
  const timeFast = mode === "lazy" ? "15 minutes" : mode === "comfort" ? "22 minutes" : "12 minutes";
  const timeSlow = mode === "lazy" ? "20 minutes" : mode === "comfort" ? "28 minutes" : "15 minutes";
  const filterText =
    filters.length > 0 ? ` tuned for ${filters.join(", ")}` : "";
  const goalText =
    nutritionGoal === "balanced"
      ? "balanced week"
      : nutritionGoal === "high-protein"
        ? "higher-protein week"
        : nutritionGoal === "lower-carb"
          ? "lower-carb week"
          : "budget-conscious week";
  const rescueTitle = rescueMode ? "rescue" : "week";
  const comfortText =
    mode === "comfort" ? " with a cozy, comforting angle" : "";

  const meals: MealSuggestion[] = [
    buildDemoMeal(
      `${titleCase(primary)} ${rescueMode ? "rescue skillet" : "skillet toss"}`,
      `A fast one-pan ${rescueTitle}${filterText}${comfortText} that leans on what you already have for a ${goalText}.`,
      ingredients,
      "Uses most ingredients",
      timeFast,
      [
        `Chop or tear the ${primary} and ${secondary} into bite-size pieces so they cook evenly.`,
        "Heat a skillet over medium heat, add a little oil, and start with the ingredient that needs the longest cook.",
        `Stir in the remaining ingredients and cook for 3 to 5 minutes until everything is hot and lightly browned.`,
        "Season with pantry basics and keep tossing until the edges look crisp and the center is steaming.",
        "Serve right away while the skillet is still hot so the texture stays lively."
      ],
      "A squeeze of acid or a sprinkle of herbs at the end will wake the whole pan up.",
      [],
      servingSize
    ),
    buildDemoMeal(
      `${rescueMode ? "Emergency" : mode === "comfort" ? "Toasty" : "Loaded"} ${titleCase(primary)} wraps`,
      `A flexible wrap-style meal that turns leftovers into something that feels planned${mode === "comfort" ? " and a little more cozy" : ""}.`,
      ingredients,
      "Requires 1-2 extra items",
      timeFast,
      [
        `Warm the ${primary} in a skillet over medium heat until it is heated through and starting to brown.`,
        `Add the ${secondary} plus any sauce or seasoning and stir for 2 minutes so the filling tastes cohesive.`,
        "Warm wraps, tortillas, or lettuce cups separately so they are easy to fold without tearing.",
        "Fill each wrap generously, then fold tightly and press seam-side down in the pan for 1 minute if you want crunch.",
        "Slice and serve while warm so the filling stays melty or juicy."
      ],
      "If the filling feels dry, add a spoonful of yogurt, salsa, or broth before wrapping.",
      extraTwo,
      servingSize
    ),
    buildDemoMeal(
      `${titleCase(primary)} ${rescueMode ? "pantry bowl" : "rice bowl"}`,
      `A practical bowl meal that uses your pantry base and one simple finishing touch${mode === "comfort" ? " with a softer, warmer feel" : ""}.`,
      ingredients,
      "Uses most ingredients",
      timeSlow,
      [
        "Heat any grains, rice, or starch first so the base is ready when the toppings finish.",
        `Cook or reheat the ${primary} and ${secondary} with a little oil or broth over medium heat until fully hot.`,
        "Taste and season the mixture, then let it cook another minute so the flavors settle in.",
        "Layer the warm base into bowls and spoon the cooked mixture over the top.",
        "Finish with anything crunchy, creamy, or fresh to give the bowl contrast."
      ],
      "This is a good place to use leftover herbs, greens, or a quick sauce from the fridge.",
      extraOne,
      servingSize
    ),
    buildDemoMeal(
      `${rescueMode ? "Bare-bones" : mode === "comfort" ? "Skillet comfort" : "Pantry"} hash with ${titleCase(primary)}`,
      `A low-effort clean-out-the-fridge option that still feels like a real meal${mode === "comfort" ? " you would actually look forward to" : ""}.`,
      ingredients,
      "Requires 1-2 extra items",
      mode === "lazy" ? "18 minutes" : "14 minutes",
      [
        "Dice the heartiest ingredients small so they soften fast and crisp at the edges.",
        "Heat a skillet over medium-high heat and spread everything out so it browns instead of steaming.",
        "Stir only occasionally for 5 to 7 minutes until the edges pick up deep color.",
        "Add a splash of sauce, broth, or seasoning and toss until it coats the pan evenly.",
        "Finish with an egg, herbs, or cheese if you have them and serve while everything is still sizzling."
      ],
      "A little hot sauce or black pepper at the end makes this feel more intentional than improvised.",
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
            : "Repurpose any extra filling or grains later in the week.",
        leftoverSource:
          index === 1
            ? `Carry extra from Monday's ${meals[0].title} into Tuesday lunch bowls or wraps.`
            : index === 3
              ? `Save part of Wednesday's ${meals[2].title} to bulk up Thursday dinner.`
              : index === 5
                ? `Use leftover fillings from earlier in the week to keep the weekend lighter.`
                : undefined
      };
    })
  };

  const groceryList = Array.from(new Set(meals.flatMap((meal) => meal.missingIngredients))).slice(0, 8);

  return {
    meals,
    groceryList,
    source: "demo",
    note: "Demo mode is active, so these meal ideas are generated locally instead of calling the OpenAI API.",
    staplesUsed: staples,
    useFirstIngredients,
    rescueMode,
    nutritionGoal,
    weeklyPlan,
    groceryExport: buildDemoGroceryExport(groceryList)
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
    nutritionGoal?: NutritionGoal;
    useFirstIngredients?: string[];
    rescueMode?: boolean;
  };

  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.filter(
        (item): item is string => typeof item === "string" && Boolean(item.trim())
      )
    : [];

  const mode =
    body.mode === "struggle" || body.mode === "comfort"
      ? body.mode
      : "lazy";
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
  const useFirstIngredients = Array.isArray(body.useFirstIngredients)
    ? body.useFirstIngredients.filter(
        (item): item is string => typeof item === "string" && Boolean(item.trim())
      )
    : [];
  const rescueMode = body.rescueMode === true;
  const nutritionGoal =
    body.nutritionGoal === "high-protein" ||
    body.nutritionGoal === "lower-carb" ||
    body.nutritionGoal === "budget-conscious"
      ? body.nutritionGoal
      : "balanced";

  try {
    if (ingredients.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one ingredient." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        generateDemoMeals(
          ingredients,
          mode,
          filters,
          servingSize,
          staples,
          nutritionGoal,
          useFirstIngredients,
          rescueMode
        )
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
            includeWeeklyPlan,
            nutritionGoal,
            useFirstIngredients,
            rescueMode
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
          generateDemoMeals(
            ingredients,
            mode,
            filters,
            servingSize,
            staples,
            nutritionGoal,
            useFirstIngredients,
            rescueMode
          )
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "Unable to generate meals at the moment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
