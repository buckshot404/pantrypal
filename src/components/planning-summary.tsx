import type { NutritionGoal, ServingSize } from "@/types/meal";

type PlanningSummaryProps = {
  servingSize: ServingSize;
  nutritionGoal: NutritionGoal;
  selectedStaples: string[];
};

export function PlanningSummary({
  servingSize,
  nutritionGoal,
  selectedStaples
}: PlanningSummaryProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
      <p className="text-sm font-semibold text-ink">Planning assumptions</p>
      <p className="mt-1 text-sm leading-6 text-ink/70">
        PantryPal is aiming for {servingSize} and assumes you already have{" "}
        {selectedStaples.length > 0 ? selectedStaples.slice(0, 4).join(", ") : "no pantry staples selected"}.
      </p>
      <p className="mt-2 text-sm leading-6 text-ink/70">
        PantryPal Plus is steering the week toward a {nutritionGoal.replace("-", " ")} goal.
      </p>
    </div>
  );
}
