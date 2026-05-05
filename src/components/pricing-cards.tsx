import { PremiumBadge } from "@/components/premium-badge";

type PricingCardsProps = {
  onUpgradeClick: () => void;
};

export function PricingCards({ onUpgradeClick }: PricingCardsProps) {
  return (
    <section className="grid gap-3">
      <div className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
        <p className="text-base font-semibold text-ink">Plans</p>
        <div className="mt-4 grid gap-3">
          <article className="rounded-[1.2rem] border border-ink/10 bg-oat p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">PantryPal Free</p>
                <p className="mt-1 text-sm text-ink/65">Fast pantry-based meal ideas.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">$0</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/72">
              <li>3-5 meal suggestions</li>
              <li>Dietary filters</li>
              <li>Favorites and grocery checklist</li>
            </ul>
          </article>

          <article className="rounded-[1.2rem] border border-amber-200 bg-gradient-to-br from-[#fff4dd] via-[#fffaf0] to-[#f7efe0] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <PremiumBadge />
                <p className="mt-2 text-sm font-semibold text-ink">PantryPal Plus</p>
                <p className="mt-1 text-sm text-ink/65">Planning for the whole week, not just tonight.</p>
              </div>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">$8/mo</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/72">
              <li>Weekly meal planner</li>
              <li>Prep pacing and leftover strategy</li>
              <li>Premium planning workflow and badges</li>
            </ul>
            <button
              type="button"
              onClick={onUpgradeClick}
              className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              See upgrade flow
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
