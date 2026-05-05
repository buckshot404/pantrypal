"use client";

import { PremiumBadge } from "@/components/premium-badge";

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUnlockPreview: () => void;
};

export function UpgradeModal({
  isOpen,
  onClose,
  onUnlockPreview
}: UpgradeModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-[#fff9f0] p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <PremiumBadge />
            <h2 className="mt-3 text-2xl font-semibold text-ink">Upgrade to PantryPal Plus</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Weekly planning turns tonight&apos;s ingredient dump into a full dinner roadmap with
              prep focus, leftovers, and less day-to-day decision fatigue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/10 bg-white px-3 py-1 text-sm font-semibold text-ink/70 transition hover:bg-ink/5"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] bg-white p-4">
            <p className="text-sm font-semibold text-ink">What Plus includes</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/72">
              <li>7-day dinner planning</li>
              <li>Prep guidance by day</li>
              <li>Leftover-aware scheduling</li>
              <li>More intentional premium workflow</li>
            </ul>
          </div>
          <div className="rounded-[1.2rem] bg-ink p-4 text-white">
            <p className="text-sm font-semibold text-white/80">Launch pricing</p>
            <p className="mt-2 text-4xl font-semibold">$8</p>
            <p className="text-sm text-white/72">per month</p>
            <p className="mt-3 text-sm leading-6 text-white/72">
              For demos, you can unlock a preview without real billing to showcase the flow.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onUnlockPreview}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-herb px-5 py-3 text-sm font-semibold text-white transition hover:bg-herb/90"
          >
            Unlock demo preview
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
