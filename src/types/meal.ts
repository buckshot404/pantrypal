export type PantryMode = "lazy" | "struggle" | "comfort";
export type DietaryFilter = "vegetarian" | "dairy-free" | "gluten-free" | "high-protein";
export type ServingSize = "1-2" | "3-4" | "5+";
export type NutritionGoal = "balanced" | "high-protein" | "lower-carb" | "budget-conscious";
export type WeeklyPlanDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type MealSuggestion = {
  title: string;
  summary: string;
  fitLabel: "Uses most ingredients" | "Requires 1-2 extra items";
  missingIngredients: string[];
  substitutions: Array<{
    original: string;
    swap: string;
  }>;
  steps: string[];
  finishTip: string;
  timeEstimate: string;
  pantryHighlights: string[];
  servings: ServingSize;
};

export type MealResponse = {
  meals: MealSuggestion[];
  groceryList: string[];
  source?: "ai" | "demo";
  note?: string;
  staplesUsed?: string[];
  useFirstIngredients?: string[];
  rescueMode?: boolean;
  nutritionGoal?: NutritionGoal;
  groceryExport?: {
    sections: Array<{
      category: string;
      items: string[];
    }>;
  };
  weeklyPlan?: {
    days: Array<{
      day: WeeklyPlanDay;
      mealTitle: string;
      mealSummary: string;
      prepFocus: string;
      leftoverTip: string;
      leftoverSource?: string;
    }>;
  };
};
