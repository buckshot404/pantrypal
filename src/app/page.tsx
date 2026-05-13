"use client";

import { useEffect, useState } from "react";
import { FavoritesSection } from "@/components/favorites-section";
import { FilterSummary } from "@/components/filter-summary";
import { GroceryExport } from "@/components/grocery-export";
import { HistoryList } from "@/components/history-list";
import { IngredientForm } from "@/components/ingredient-form";
import { PlanningSummary } from "@/components/planning-summary";
import { PremiumBadge } from "@/components/premium-badge";
import { PricingCards } from "@/components/pricing-cards";
import { ResultsSection } from "@/components/results-section";
import { UpgradeModal } from "@/components/upgrade-modal";
import { WeeklyPlanner } from "@/components/weekly-planner";
import {
  FAVORITES_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_ITEMS,
  MODE_COPY,
  PANTRY_STAPLES
} from "@/lib/constants";
import { formatIngredientInput, parseIngredients } from "@/lib/ingredients";
import type {
  Allergy,
  DietaryFilter,
  MealResponse,
  MealSuggestion,
  NutritionGoal,
  PantryMode,
  ServingSize
} from "@/types/meal";

export default function HomePage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<PantryMode>("lazy");
  const [selectedFilters, setSelectedFilters] = useState<DietaryFilter[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<Allergy[]>([]);
  const [servingSize, setServingSize] = useState<ServingSize>("3-4");
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal>("balanced");
  const [selectedStaples, setSelectedStaples] = useState<string[]>(PANTRY_STAPLES.slice(0, 4));
  const [useFirstIngredients, setUseFirstIngredients] = useState<string[]>([]);
  const [rescueMode, setRescueMode] = useState(false);
  const [results, setResults] = useState<MealResponse | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<MealResponse["weeklyPlan"] | null>(null);
  const [plusPreviewUnlocked, setPlusPreviewUnlocked] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isWeeklyLoading, setIsWeeklyLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<MealSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSubmittedInput, setLastSubmittedInput] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as string[];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const savedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!savedFavorites) {
      return;
    }

    try {
      const parsed = JSON.parse(savedFavorites) as MealSuggestion[];
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  }, []);

  const saveSearch = (value: string) => {
    const nextHistory = [value, ...history.filter((item) => item !== value)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    setHistory(nextHistory);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
  };

  const toggleFilter = (filter: DietaryFilter) => {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  };

  const toggleFavorite = (meal: MealSuggestion) => {
    setFavorites((current) => {
      const nextFavorites = current.some((item) => item.title === meal.title)
        ? current.filter((item) => item.title !== meal.title)
        : [meal, ...current].slice(0, 8);

      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
      return nextFavorites;
    });
  };

  const toggleAllergy = (allergy: Allergy) => {
    setSelectedAllergies((current) =>
      current.includes(allergy)
        ? current.filter((item) => item !== allergy)
        : [...current, allergy]
    );
  };

  const toggleStaple = (staple: string) => {
    setSelectedStaples((current) =>
      current.includes(staple)
        ? current.filter((item) => item !== staple)
        : [...current, staple]
    );
  };

  const toggleUseFirstIngredient = (ingredient: string) => {
    setUseFirstIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient]
    );
  };

  const selectFavorite = (meal: MealSuggestion) => {
    setResults({
      meals: [meal],
      groceryList: meal.missingIngredients,
      source: "demo",
      staplesUsed: selectedStaples,
      useFirstIngredients,
      rescueMode
    });
  };

  const generateMeals = async (value: string) => {
    const ingredients = parseIngredients(value);

    if (ingredients.length === 0) {
      setError("Add at least one ingredient to generate meal ideas.");
      setResults(null);
      return;
    }

    setError(null);
    setIsLoading(true);
    const validUseFirstIngredients = useFirstIngredients.filter((item) => ingredients.includes(item));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ingredients,
          mode,
          filters: selectedFilters,
          allergies: selectedAllergies,
          servingSize,
          nutritionGoal,
          staples: selectedStaples,
          useFirstIngredients: validUseFirstIngredients,
          rescueMode
        })
      });

      const payload = (await response.json()) as MealResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate meals right now.");
      }

      setResults(payload);
      setWeeklyPlan(payload.weeklyPlan ?? null);
      setLastSubmittedInput(formatIngredientInput(ingredients));
      saveSearch(formatIngredientInput(ingredients));
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while generating meals.";

      setError(message);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyPlan = async () => {
    const ingredients = parseIngredients(lastSubmittedInput || input);

    if (ingredients.length === 0) {
      setError("Add ingredients first so PantryPal Plus can build your week.");
      return;
    }

    setError(null);
    setIsWeeklyLoading(true);
    const validUseFirstIngredients = useFirstIngredients.filter((item) => ingredients.includes(item));

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ingredients,
          mode,
          filters: selectedFilters,
          allergies: selectedAllergies,
          servingSize,
          nutritionGoal,
          staples: selectedStaples,
          includeWeeklyPlan: true,
          useFirstIngredients: validUseFirstIngredients,
          rescueMode
        })
      });

      const payload = (await response.json()) as MealResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate a weekly plan right now.");
      }

      setWeeklyPlan(payload.weeklyPlan ?? null);
      if (!results) {
        setResults(payload);
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while planning your week.";
      setError(message);
    } finally {
      setIsWeeklyLoading(false);
    }
  };

  const activeMealCount = results?.meals.length ?? 0;
  const groceryCount = results?.groceryList.length ?? 0;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUnlockPreview={() => {
          setPlusPreviewUnlocked(true);
          setIsUpgradeModalOpen(false);
        }}
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/30 bg-ink px-5 py-6 text-white shadow-card sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr]">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                PantryPal
              </p>
              <div className="mt-3">
                <PremiumBadge label="Plus weekly planning available" tone="dark" />
              </div>
              <h1 className="font-display mt-4 text-balance text-4xl font-semibold leading-tight sm:text-6xl">
                Use what you already have. Waste less. Eat sooner.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                PantryPal turns loose ingredients into realistic meal ideas with minimal extras,
                faster modes for low-energy nights, and lightweight planning tools that make the next
                grocery run easier.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/80">
                <span className="rounded-full bg-white/10 px-3 py-1">3-5 smart meal ideas</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Favorites you can keep</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Dietary filter support</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Checklist grocery extras</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Current mode
                </p>
                <p className="mt-3 text-xl font-semibold">{MODE_COPY[mode].name}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{MODE_COPY[mode].description}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Meals generated
                </p>
                <p className="mt-3 text-3xl font-semibold">{activeMealCount}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">Fresh ideas in the current batch.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Extra groceries
                </p>
                <p className="mt-3 text-3xl font-semibold">{groceryCount}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">Small add-ons shared across meals.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Premium tier
                    </p>
                    <p className="mt-3 text-xl font-semibold">PantryPal Plus</p>
                  </div>
                  <PremiumBadge label="Upsell ready" tone="light" />
                </div>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Weekly planning, prep pacing, and leftover strategy built as a paid upgrade.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr,0.7fr]">
          <div className="space-y-6">
            <IngredientForm
              input={input}
              mode={mode}
              selectedFilters={selectedFilters}
              selectedAllergies={selectedAllergies}
              servingSize={servingSize}
              nutritionGoal={nutritionGoal}
              selectedStaples={selectedStaples}
              useFirstIngredients={useFirstIngredients}
              rescueMode={rescueMode}
              isLoading={isLoading}
              error={error}
              onInputChange={setInput}
              onModeChange={setMode}
              onFilterToggle={toggleFilter}
              onAllergyToggle={toggleAllergy}
              onServingChange={setServingSize}
              onNutritionGoalChange={setNutritionGoal}
              onStapleToggle={toggleStaple}
              onUseFirstToggle={toggleUseFirstIngredient}
              onRescueModeChange={setRescueMode}
              onSubmit={() => generateMeals(input)}
              onRegenerate={() => generateMeals(lastSubmittedInput || input)}
              canRegenerate={Boolean(lastSubmittedInput || input)}
            />
            <HistoryList items={history} onSelect={setInput} />
          </div>

          <div className="space-y-4">
            <FilterSummary filters={selectedFilters} />
            <PlanningSummary
              servingSize={servingSize}
              nutritionGoal={nutritionGoal}
              selectedStaples={selectedStaples}
            />
            {results?.source === "demo" ? (
              <div className="rounded-[1.5rem] border border-citrus/35 bg-citrus/20 p-4 shadow-card backdrop-blur">
                <p className="text-sm font-semibold text-amber-950">Demo mode active</p>
                <p className="mt-1 text-sm leading-6 text-amber-950/80">
                  {results.note ??
                    "PantryPal is showing locally generated meal ideas so the demo keeps working even without live API quota."}
                </p>
              </div>
            ) : null}
            <ResultsSection
              data={results}
              isLoading={isLoading}
              favoriteTitles={favorites.map((meal) => meal.title)}
              onToggleFavorite={toggleFavorite}
            />
          </div>

          <div className="space-y-4">
            <FavoritesSection
              items={favorites}
              onSelect={selectFavorite}
              onRemove={toggleFavorite}
            />
            <WeeklyPlanner
              plan={weeklyPlan}
              isUnlocked={plusPreviewUnlocked}
              isLoading={isWeeklyLoading}
              onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
              onGenerate={generateWeeklyPlan}
            />
            <PricingCards onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
            <GroceryExport
              exportData={results?.groceryExport ?? null}
              isUnlocked={plusPreviewUnlocked}
              onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            />
            <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
              <p className="text-base font-semibold text-ink">Deployment ready</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                This app is now structured for Vercel with environment-based OpenAI usage,
                production build validation, and reusable App Router components.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
