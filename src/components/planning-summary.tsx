import type { ServingSize } from "@/types/meal";

type PlanningSummaryProps = {
  servingSize: ServingSize;
  selectedStaples: string[];
};

export function PlanningSummary({
  servingSize,
  selectedStaples
}: PlanningSummaryProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
      <p className="text-sm font-semibold text-ink">Planning assumptions</p>
      <p className="mt-1 text-sm leading-6 text-ink/70">
        PantryPal is aiming for {servingSize} and assumes you already have{" "}
        {selectedStaples.length > 0 ? selectedStaples.slice(0, 4).join(", ") : "no pantry staples selected"}.
      </p>
    </div>
  );
}
