import { DIETARY_FILTERS } from "@/lib/constants";
import type { DietaryFilter } from "@/types/meal";

type FilterSummaryProps = {
  filters: DietaryFilter[];
};

export function FilterSummary({ filters }: FilterSummaryProps) {
  if (filters.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
        <p className="text-sm font-semibold text-ink">Dietary guardrails</p>
        <p className="mt-1 text-sm leading-6 text-ink/70">
          No dietary filters are active, so PantryPal can focus on pure ingredient matching.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur">
      <p className="text-sm font-semibold text-ink">Dietary guardrails</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <span
            key={filter}
            className="rounded-full bg-herb/10 px-3 py-1 text-xs font-semibold text-herb"
          >
            {DIETARY_FILTERS.find((item) => item.id === filter)?.label ?? filter}
          </span>
        ))}
      </div>
    </div>
  );
}
