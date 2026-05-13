"use client";

import { FormEvent } from "react";
import {
  ALLERGY_OPTIONS,
  COMMON_SUBSTITUTIONS,
  DIETARY_FILTERS,
  NUTRITION_GOALS,
  PANTRY_STAPLES,
  SERVING_SIZES
} from "@/lib/constants";
import type {
  Allergy,
  DietaryFilter,
  NutritionGoal,
  PantryMode,
  ServingSize
} from "@/types/meal";
import { ModeToggle } from "@/components/mode-toggle";

type IngredientFormProps = {
  input: string;
  mode: PantryMode;
  selectedFilters: DietaryFilter[];
  selectedAllergies: Allergy[];
  servingSize: ServingSize;
  nutritionGoal: NutritionGoal;
  selectedStaples: string[];
  useFirstIngredients: string[];
  rescueMode: boolean;
  isLoading: boolean;
  error: string | null;
  onInputChange: (value: string) => void;
  onModeChange: (mode: PantryMode) => void;
  onFilterToggle: (filter: DietaryFilter) => void;
  onAllergyToggle: (allergy: Allergy) => void;
  onServingChange: (serving: ServingSize) => void;
  onNutritionGoalChange: (goal: NutritionGoal) => void;
  onStapleToggle: (staple: string) => void;
  onUseFirstToggle: (ingredient: string) => void;
  onRescueModeChange: (value: boolean) => void;
  onSubmit: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
};

export function IngredientForm({
  input,
  mode,
  selectedFilters,
  selectedAllergies,
  servingSize,
  nutritionGoal,
  selectedStaples,
  useFirstIngredients,
  rescueMode,
  isLoading,
  error,
  onInputChange,
  onModeChange,
  onFilterToggle,
  onAllergyToggle,
  onServingChange,
  onNutritionGoalChange,
  onStapleToggle,
  onUseFirstToggle,
  onRescueModeChange,
  onSubmit,
  onRegenerate,
  canRegenerate
}: IngredientFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const ingredientOptions = input
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .filter((item, index, values) => values.indexOf(item) === index);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[1.75rem] border border-white/75 bg-white/85 p-5 shadow-card backdrop-blur sm:p-6"
    >
      <div className="space-y-2">
        <label htmlFor="ingredients" className="text-sm font-semibold text-ink">
          What&apos;s in your kitchen?
        </label>
        <textarea
          id="ingredients"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="chicken, rice, cheese, tortillas"
          className="min-h-28 w-full rounded-[1.25rem] border border-ink/10 bg-oat px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink/40 focus:border-herb focus:ring-2 focus:ring-herb/20"
        />
        <p className="text-sm text-ink/65">
          Add ingredients separated by commas. PantryPal will work with partial matches too.
        </p>
      </div>

      {ingredientOptions.length > 0 ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-ink">Use these first</p>
            <p className="text-sm text-ink/65">Mark ingredients you want PantryPal to prioritize before they go bad.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredientOptions.map((ingredient) => {
              const isActive = useFirstIngredients.includes(ingredient);

              return (
                <button
                  key={ingredient}
                  type="button"
                  onClick={() => onUseFirstToggle(ingredient)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-coral/30 bg-coral/10 text-coral"
                      : "border-ink/10 bg-white text-ink/70 hover:border-coral/30"
                  }`}
                >
                  {ingredient}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <ModeToggle value={mode} onChange={onModeChange} />

      <div className="rounded-[1.2rem] border border-ink/10 bg-oat p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Empty-fridge rescue mode</p>
            <p className="mt-1 text-sm leading-6 text-ink/65">
              Push PantryPal toward ultra-flexible meals for nights when you only have one or two real ingredients.
            </p>
          </div>
          <button
            type="button"
            aria-pressed={rescueMode}
            onClick={() => onRescueModeChange(!rescueMode)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              rescueMode ? "bg-coral text-white" : "bg-white text-ink border border-ink/10"
            }`}
          >
            {rescueMode ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">Serving size</p>
          <p className="text-sm text-ink/65">Give PantryPal the right scale for dinner planning.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {SERVING_SIZES.map((option) => {
            const isActive = servingSize === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onServingChange(option.id)}
                className={`rounded-[1.15rem] border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-oat text-ink hover:border-ink/35"
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className={`mt-1 text-xs leading-5 ${isActive ? "text-white/80" : "text-current/80"}`}>
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">Nutrition goal for Plus planning</p>
          <p className="text-sm text-ink/65">This helps the premium weekly planner steer the whole week.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {NUTRITION_GOALS.map((goal) => {
            const isActive = nutritionGoal === goal.id;

            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onNutritionGoalChange(goal.id)}
                className={`rounded-[1.15rem] border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-amber-300 bg-amber-50 text-amber-950"
                    : "border-ink/10 bg-oat text-ink hover:border-amber-200"
                }`}
              >
                <p className="text-sm font-semibold">{goal.label}</p>
                <p className="mt-1 text-xs leading-5 text-current/80">{goal.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Dietary filters</p>
            <p className="text-sm text-ink/65">Optional guardrails for more relevant ideas.</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {DIETARY_FILTERS.map((filter) => {
            const isActive = selectedFilters.includes(filter.id);

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterToggle(filter.id)}
                className={`rounded-[1.15rem] border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-herb bg-herb/10 text-herb"
                    : "border-ink/10 bg-oat text-ink hover:border-herb/40"
                }`}
              >
                <p className="text-sm font-semibold">{filter.label}</p>
                <p className="mt-1 text-xs leading-5 text-current/80">{filter.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">Allergies and hard avoids</p>
          <p className="text-sm text-ink/65">
            PantryPal will avoid building meals around these ingredients and common related extras.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {ALLERGY_OPTIONS.map((option) => {
            const isActive = selectedAllergies.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onAllergyToggle(option.id)}
                className={`rounded-[1.15rem] border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-ink/10 bg-oat text-ink hover:border-coral/35"
                }`}
              >
                <p className="text-sm font-semibold">{option.label}</p>
                <p className="mt-1 text-xs leading-5 text-current/80">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-ink">Pantry staples you already have</p>
          <p className="text-sm text-ink/65">This keeps PantryPal from suggesting basics you always stock.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PANTRY_STAPLES.map((staple) => {
            const isActive = selectedStaples.includes(staple);

            return (
              <button
                key={staple}
                type="button"
                onClick={() => onStapleToggle(staple)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-herb bg-herb/10 text-herb"
                    : "border-ink/10 bg-white text-ink/70 hover:border-herb/35"
                }`}
              >
                {staple}
              </button>
            );
          })}
        </div>
      </div>

      {ingredientOptions.some((item) => COMMON_SUBSTITUTIONS[item]) ? (
        <div className="space-y-2 rounded-[1.2rem] border border-ink/10 bg-white p-4">
          <p className="text-sm font-semibold text-ink">Quick substitution ideas</p>
          <div className="space-y-2 text-sm leading-6 text-ink/70">
            {ingredientOptions
              .filter((item) => COMMON_SUBSTITUTIONS[item])
              .slice(0, 3)
              .map((item) => (
                <p key={item}>
                  <span className="font-semibold text-ink">{item}</span>: swap with {COMMON_SUBSTITUTIONS[item]}
                </p>
              ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-herb px-5 py-3 font-semibold text-white transition hover:bg-herb/90 disabled:cursor-not-allowed disabled:bg-herb/60"
        >
          {isLoading ? "Finding meals..." : "Generate meals"}
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading || !canRegenerate}
          className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:text-ink/40"
        >
          Regenerate meals
        </button>
      </div>
    </form>
  );
}
