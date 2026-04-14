"use client";

export function ShipDayBanner({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">🚀</span>
        <span className="text-xs font-semibold text-charcoal-700 font-mono uppercase tracking-wide">
          Ship Day
        </span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-amber-700 font-display">
          {daysLeft} {daysLeft === 1 ? "day" : "days"}
        </span>
        <span className="text-xs text-charcoal-400 ml-1">
          ({target.toLocaleDateString("en-US", { month: "short", day: "numeric" })})
        </span>
      </div>
    </div>
  );
}
