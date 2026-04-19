export type PantryMode = "lazy" | "struggle";
export type DietaryFilter = "vegetarian" | "dairy-free" | "gluten-free" | "high-protein";

export type MealSuggestion = {
  title: string;
  summary: string;
  fitLabel: "Uses most ingredients" | "Requires 1-2 extra items";
  missingIngredients: string[];
  steps: string[];
  timeEstimate: string;
  pantryHighlights: string[];
};

export type MealResponse = {
  meals: MealSuggestion[];
  groceryList: string[];
  source?: "ai" | "demo";
  note?: string;
};
