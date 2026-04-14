"use client";

export function PromptChip({
  label,
  onClick,
}: {
  label: string;
  onClick: (label: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(label)}
      className="px-4 py-2 rounded-full border border-charcoal-200 bg-white text-sm text-charcoal-700 hover:border-amber-400 hover:bg-amber-50 hover:text-charcoal-900 transition active:scale-95"
      style={{ transitionDuration: "var(--bq-duration-fast)" }}
    >
      {label}
    </button>
  );
}
