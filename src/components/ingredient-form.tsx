"use client";

import { FormEvent } from "react";
import { DIETARY_FILTERS, PANTRY_STAPLES, SERVING_SIZES } from "@/lib/constants";
import type { DietaryFilter, PantryMode, ServingSize } from "@/types/meal";
import { ModeToggle } from "@/components/mode-toggle";

type IngredientFormProps = {
  input: string;
  mode: PantryMode;
  selectedFilters: DietaryFilter[];
  servingSize: ServingSize;
  selectedStaples: string[];
  isLoading: boolean;
  error: string | null;
  onInputChange: (value: string) => void;
  onModeChange: (mode: PantryMode) => void;
  onFilterToggle: (filter: DietaryFilter) => void;
  onServingChange: (serving: ServingSize) => void;
  onStapleToggle: (staple: string) => void;
  onSubmit: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
};

export function IngredientForm({
  input,
  mode,
  selectedFilters,
  servingSize,
  selectedStaples,
  isLoading,
  error,
  onInputChange,
  onModeChange,
  onFilterToggle,
  onServingChange,
  onStapleToggle,
  onSubmit,
  onRegenerate,
  canRegenerate
}: IngredientFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

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

      <ModeToggle value={mode} onChange={onModeChange} />

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
