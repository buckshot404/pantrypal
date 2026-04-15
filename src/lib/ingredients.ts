export function parseIngredients(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function formatIngredientInput(ingredients: string[]): string {
  return ingredients.join(", ");
}
