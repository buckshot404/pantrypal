import type { DietaryFilter, NutritionGoal, PantryMode, ServingSize } from "@/types/meal";

export const MODE_COPY: Record<
  PantryMode,
  {
    name: string;
    description: string;
  }
> = {
  lazy: {
    name: "Lazy Mode",
    description: "Fastest, easiest meals with low effort and short steps."
  },
  struggle: {
    name: "Struggle Mode",
    description: "Simple meals that work with a very short ingredient list."
  },
  comfort: {
    name: "Comfort Mode",
    description: "Warmer, cozier meal ideas that still stay realistic and easy enough."
  }
};

export const HISTORY_STORAGE_KEY = "pantrypal-recent-searches";
export const MAX_HISTORY_ITEMS = 6;
export const FAVORITES_STORAGE_KEY = "pantrypal-favorite-meals";
export const GROCERY_CHECKED_STORAGE_KEY = "pantrypal-grocery-checked";

export const DIETARY_FILTERS: Array<{
  id: DietaryFilter;
  label: string;
  description: string;
}> = [
  {
    id: "vegetarian",
    label: "Vegetarian",
    description: "Skip meat and seafood."
  },
  {
    id: "dairy-free",
    label: "Dairy-free",
    description: "Avoid milk, cheese, and cream."
  },
  {
    id: "gluten-free",
    label: "Gluten-free",
    description: "Avoid wheat-based ingredients."
  },
  {
    id: "high-protein",
    label: "High protein",
    description: "Lean toward filling meals with more protein."
  }
];

export const SERVING_SIZES: Array<{
  id: ServingSize;
  label: string;
  description: string;
}> = [
  {
    id: "1-2",
    label: "1-2 servings",
    description: "Best for solo meals or a quick lunch plus leftovers."
  },
  {
    id: "3-4",
    label: "3-4 servings",
    description: "Great for a small household or a shared dinner."
  },
  {
    id: "5+",
    label: "5+ servings",
    description: "More batch-friendly and better for meal prep."
  }
];

export const PANTRY_STAPLES = [
  "olive oil",
  "salt",
  "black pepper",
  "garlic",
  "onion",
  "butter",
  "eggs",
  "soy sauce",
  "broth",
  "tomato sauce"
];

export const COMMON_SUBSTITUTIONS: Record<string, string> = {
  rice: "quinoa or couscous",
  pasta: "rice or noodles",
  tortillas: "bread or lettuce cups",
  yogurt: "sour cream or mayo",
  spinach: "kale or lettuce",
  cheese: "yogurt sauce or avocado",
  beans: "lentils or chickpeas",
  chicken: "turkey or tofu",
  eggs: "scrambled tofu or extra beans",
  "tomato sauce": "salsa or crushed tomatoes"
};

export const NUTRITION_GOALS: Array<{
  id: NutritionGoal;
  label: string;
  description: string;
}> = [
  {
    id: "balanced",
    label: "Balanced",
    description: "Keep the week practical and generally well-rounded."
  },
  {
    id: "high-protein",
    label: "High protein",
    description: "Prioritize fuller meals with stronger protein focus."
  },
  {
    id: "lower-carb",
    label: "Lower carb",
    description: "Lean lighter on breads, pasta, and rice-heavy meals."
  },
  {
    id: "budget-conscious",
    label: "Budget conscious",
    description: "Minimize extra purchases and reuse ingredients aggressively."
  }
];
