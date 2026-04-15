import type { MealResponse, MealSuggestion } from "@/types/meal";
import { GroceryList } from "@/components/grocery-list";
import { MealCard } from "@/components/meal-card";

type ResultsSectionProps = {
  data: MealResponse | null;
  isLoading: boolean;
  favoriteTitles: string[];
  onToggleFavorite: (meal: MealSuggestion) => void;
};

export function ResultsSection({
  data,
  isLoading,
  favoriteTitles,
  onToggleFavorite
}: ResultsSectionProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-48 animate-pulse rounded-[1.5rem] border border-white/60 bg-white/60 shadow-card"
          />
        ))}
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white/55 p-8 text-center shadow-card">
        <p className="text-lg font-semibold text-ink">Your next meal ideas will show up here.</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/65">
          PantryPal turns your ingredient list into realistic meals that feel doable on a busy day.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        {data.meals.map((meal) => (
          <MealCard
            key={meal.title}
            meal={meal}
            isFavorite={favoriteTitles.includes(meal.title)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      <GroceryList items={data.groceryList} />
    </section>
  );
}
