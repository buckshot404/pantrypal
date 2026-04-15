"use client";

import { useEffect, useMemo, useState } from "react";
import { GROCERY_CHECKED_STORAGE_KEY } from "@/lib/constants";

type GroceryListProps = {
  items: string[];
};

export function GroceryList({ items }: GroceryListProps) {
  const [checked, setChecked] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem(GROCERY_CHECKED_STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      window.localStorage.removeItem(GROCERY_CHECKED_STORAGE_KEY);
      return [];
    }
  });

  const visibleCheckedCount = checked.filter((item) => items.includes(item)).length;

  useEffect(() => {
    const nextChecked = checked.filter((item) => items.includes(item));
    window.localStorage.setItem(GROCERY_CHECKED_STORAGE_KEY, JSON.stringify(nextChecked));
  }, [checked, items]);

  const progress = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }

    return Math.round((visibleCheckedCount / items.length) * 100);
  }, [items.length, visibleCheckedCount]);

  if (items.length === 0) {
    return null;
  }

  const toggleItem = (item: string) => {
    setChecked((current) =>
      current.includes(item)
        ? current.filter((entry) => entry !== item)
        : [...current.filter((entry) => items.includes(entry)), item]
    );
  };

  return (
    <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Tiny grocery list</h2>
          <p className="mt-1 text-sm text-ink/65">
            These are the most common extras across your meal ideas.
          </p>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
          {progress}% picked up
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggleItem(item)}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
              checked.includes(item)
                ? "bg-herb/10 text-herb"
                : "bg-citrus/18 text-amber-950 hover:bg-citrus/30"
            }`}
          >
            <span>{item}</span>
            <span className="text-xs font-semibold">{checked.includes(item) ? "Added" : "Need"}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink/65">
        {visibleCheckedCount} of {items.length} items marked.
      </p>
    </section>
  );
}
