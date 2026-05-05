type PremiumBadgeProps = {
  label?: string;
  tone?: "dark" | "light" | "accent";
};

export function PremiumBadge({
  label = "PantryPal Plus",
  tone = "accent"
}: PremiumBadgeProps) {
  const toneClasses =
    tone === "dark"
      ? "bg-white/14 text-white border border-white/15"
      : tone === "light"
        ? "bg-white text-ink border border-ink/10"
        : "bg-amber-100 text-amber-900 border border-amber-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClasses}`}
    >
      {label}
    </span>
  );
}
