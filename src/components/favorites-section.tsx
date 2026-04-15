"use client";

import type { MealSuggestion } from "@/types/meal";

type FavoritesSectionProps = {
  items: MealSuggestion[];
  onSelect: (meal: MealSuggestion) => void;
  onRemove: (meal: MealSuggestion) => void;
};

export function FavoritesSection({
  items,
  onSelect,
  onRemove
}: FavoritesSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Saved meals</h2>
          <p className="text-sm text-ink/65">Keep a few reliable ideas on deck for later.</p>
        </div>
        <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
          {items.length} saved
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((meal) => (
          <div
            key={`favorite-${meal.title}`}
            className="rounded-[1.2rem] border border-ink/10 bg-oat p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{meal.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink/70">{meal.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(meal)}
                className="rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-coral/30 hover:text-coral"
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              onClick={() => onSelect(meal)}
              className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              View details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

