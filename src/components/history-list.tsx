"use client";

type HistoryListProps = {
  items: string[];
  onSelect: (value: string) => void;
};

export function HistoryList({ items, onSelect }: HistoryListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-white/75 bg-white/80 p-5 shadow-card backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Recent searches</h2>
          <p className="text-sm text-ink/65">Tap one to refill the ingredient list.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-full border border-ink/10 bg-oat px-4 py-2 text-sm text-ink transition hover:border-herb hover:text-herb"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
