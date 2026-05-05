"use client";

import { PremiumBadge } from "@/components/premium-badge";
import type { MealResponse } from "@/types/meal";

type WeeklyPlannerProps = {
  plan: MealResponse["weeklyPlan"] | null;
  isUnlocked: boolean;
  isLoading: boolean;
  onOpenUpgrade: () => void;
  onGenerate: () => void;
};

export function WeeklyPlanner({
  plan,
  isUnlocked,
  isLoading,
  onOpenUpgrade,
  onGenerate
}: WeeklyPlannerProps) {
  if (!isUnlocked) {
    return (
      <section className="overflow-hidden rounded-[1.7rem] border border-amber-200 bg-gradient-to-br from-[#fff4dd] via-[#fffaf0] to-[#f7efe0] p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <PremiumBadge />
            <h2 className="mt-2 text-xl font-semibold text-ink">Weekly meal planner</h2>
          </div>
          <PremiumBadge label="Paid feature" tone="dark" />
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          Turn one ingredient list into a full week of meal suggestions with prep pacing,
          leftover strategy, and lower-effort dinner flow. This is designed as a premium upgrade.
        </p>
        <div className="mt-4 grid gap-2 text-sm text-ink/70">
          <div className="rounded-2xl bg-white/70 px-4 py-3">7-day dinner map</div>
          <div className="rounded-2xl bg-white/70 px-4 py-3">Prep focus for each day</div>
          <div className="rounded-2xl bg-white/70 px-4 py-3">Leftover planning across the week</div>
        </div>
        <button
          type="button"
          onClick={onOpenUpgrade}
          className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          Preview PantryPal Plus
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[1.7rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PremiumBadge label="PantryPal Plus Preview" />
          <h2 className="mt-2 text-xl font-semibold text-ink">Weekly meal planner</h2>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="inline-flex rounded-full bg-herb px-4 py-2 text-sm font-semibold text-white transition hover:bg-herb/90 disabled:cursor-not-allowed disabled:bg-herb/60"
        >
          {isLoading ? "Planning..." : "Generate weekly plan"}
        </button>
      </div>

      {plan?.days?.length ? (
        <div className="mt-5 grid gap-3">
          {plan.days.map((day) => (
            <article
              key={`${day.day}-${day.mealTitle}`}
              className="rounded-[1.2rem] border border-ink/10 bg-oat p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">
                    {day.day}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-ink">{day.mealTitle}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink/70">{day.mealSummary}</p>
                </div>
                <PremiumBadge label="Plus day plan" tone="light" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Prep focus
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/75">{day.prepFocus}</p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">
                    Leftover tip
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/75">{day.leftoverTip}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.35rem] border border-dashed border-ink/15 bg-white/60 p-5 text-sm leading-6 text-ink/65">
          Generate a weekly plan to see a full 7-day dinner map built from your current ingredients,
          serving size, dietary filters, and pantry staple assumptions.
        </div>
      )}
    </section>
  );
}
