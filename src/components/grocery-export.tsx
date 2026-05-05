"use client";

import { useState } from "react";
import { PremiumBadge } from "@/components/premium-badge";
import type { MealResponse } from "@/types/meal";

type GroceryExportProps = {
  exportData: MealResponse["groceryExport"] | null;
  isUnlocked: boolean;
  onOpenUpgrade: () => void;
};

export function GroceryExport({
  exportData,
  isUnlocked,
  onOpenUpgrade
}: GroceryExportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!exportData?.sections?.length) {
      return;
    }

    const text = exportData.sections
      .map((section) => `${section.category}\n${section.items.map((item) => `- ${item}`).join("\n")}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  if (!isUnlocked) {
    return (
      <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <PremiumBadge label="Plus export" />
            <p className="mt-2 text-base font-semibold text-ink">Smart grocery export</p>
          </div>
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            Unlock
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Group missing items into a cleaner export you can copy into notes, texts, or a shopping app.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PremiumBadge label="Plus export" />
          <p className="mt-2 text-base font-semibold text-ink">Smart grocery export</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!exportData?.sections?.length}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/45"
        >
          {copied ? "Copied" : "Copy list"}
        </button>
      </div>

      {exportData?.sections?.length ? (
        <div className="mt-4 grid gap-3">
          {exportData.sections.map((section) => (
            <div key={section.category} className="rounded-[1.15rem] bg-oat p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
                {section.category}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {section.items.map((item) => (
                  <span
                    key={`${section.category}-${item}`}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.15rem] border border-dashed border-ink/15 bg-white/60 p-4 text-sm leading-6 text-ink/65">
          Generate a weekly plan to see grouped grocery export sections.
        </div>
      )}
    </section>
  );
}
