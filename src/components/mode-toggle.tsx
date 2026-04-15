"use client";

import type { PantryMode } from "@/types/meal";
import { MODE_COPY } from "@/lib/constants";

type ModeToggleProps = {
  value: PantryMode;
  onChange: (mode: PantryMode) => void;
};

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/70 bg-white/75 p-2 shadow-card backdrop-blur">
      <div className="grid grid-cols-2 gap-2">
        {(["lazy", "struggle"] as PantryMode[]).map((mode) => {
          const isActive = value === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              className={`rounded-2xl px-4 py-4 text-left transition ${
                isActive
                  ? "bg-ink text-white"
                  : "bg-transparent text-ink hover:bg-black/5"
              }`}
            >
              <p className="text-sm font-semibold">{MODE_COPY[mode].name}</p>
              <p
                className={`mt-1 text-sm leading-5 ${
                  isActive ? "text-white/80" : "text-ink/70"
                }`}
              >
                {MODE_COPY[mode].description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
