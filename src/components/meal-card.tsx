"use client";

import { useState } from "react";
import { PremiumBadge } from "@/components/premium-badge";
import type { MealSuggestion } from "@/types/meal";

type MealCardProps = {
  meal: MealSuggestion;
  isFavorite: boolean;
  onToggleFavorite: (meal: MealSuggestion) => void;
};

export function MealCard({ meal, isFavorite, onToggleFavorite }: MealCardProps) {
  const [copied, setCopied] = useState(false);
  const isMostlyUsingPantry = meal.fitLabel === "Uses most ingredients";

  const handleCopy = async () => {
    const recipeText = [
      meal.title,
      meal.summary,
      `Servings: ${meal.servings}`,
      `Time: ${meal.timeEstimate}`,
      "",
      "Cooking instructions:",
      ...meal.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
      `Finish tip: ${meal.finishTip}`,
      ...(meal.substitutions.length > 0
        ? ["", "Substitutions:", ...meal.substitutions.map((item) => `- ${item.original}: ${item.swap}`)]
        : []),
      "",
      `Missing ingredients: ${meal.missingIngredients.join(", ") || "None"}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(recipeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-ink">{meal.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/70">{meal.summary}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isMostlyUsingPantry
                ? "bg-herb/12 text-herb"
                : "bg-citrus/20 text-amber-900"
            }`}
          >
            {meal.fitLabel}
          </span>
          <PremiumBadge label="Copyable recipe" tone="light" />
          <button
            type="button"
            onClick={() => onToggleFavorite(meal)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              isFavorite
                ? "border-coral/30 bg-coral/10 text-coral"
                : "border-ink/10 bg-oat text-ink/70 hover:border-coral/30 hover:text-coral"
            }`}
          >
            {isFavorite ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink/70 transition hover:bg-ink/5"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
          {meal.timeEstimate}
        </span>
        <span className="rounded-full bg-oat px-3 py-1 text-xs font-semibold text-ink">
          {meal.servings} servings
        </span>
        {meal.pantryHighlights.map((item) => (
          <span
            key={`${meal.title}-${item}`}
            className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink/75"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr,0.9fr]">
        <div>
          <p className="text-sm font-semibold text-ink">Cooking instructions</p>
          <ol className="mt-2 space-y-2 text-sm leading-6 text-ink/75">
            {meal.steps.map((step, index) => (
              <li key={`${meal.title}-step-${index}`} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[1.25rem] bg-oat p-4">
          <p className="text-sm font-semibold text-ink">Finish tip</p>
          <p className="mt-2 text-sm leading-6 text-ink/75">{meal.finishTip}</p>
          {meal.substitutions.length > 0 ? (
            <>
              <p className="mt-4 text-sm font-semibold text-ink">Substitutions</p>
              <div className="mt-2 space-y-2">
                {meal.substitutions.map((item) => (
                  <p key={`${meal.title}-${item.original}`} className="text-sm leading-6 text-ink/75">
                    <span className="font-semibold text-ink">{item.original}</span>: {item.swap}
                  </p>
                ))}
              </div>
            </>
          ) : null}
          <p className="mt-4 text-sm font-semibold text-ink">Missing ingredients</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {meal.missingIngredients.length > 0 ? (
              meal.missingIngredients.map((item) => (
                <span
                  key={`${meal.title}-${item}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink/75"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-herb">
                No extras needed
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
