import type { DietaryFilter, PantryMode } from "@/types/meal";

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
