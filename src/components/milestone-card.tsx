"use client";

export type MilestoneStatus = "pending" | "active" | "completed";

export function MilestoneCard({
  title,
  description,
  status,
  index,
  total,
  onToggle,
}: {
  title: string;
  description?: string | null;
  status: MilestoneStatus;
  index: number;
  total: number;
  onToggle?: () => void;
}) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLast = index === total - 1;

  return (
    <div className="flex gap-3">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
            isCompleted
              ? "bg-sage-500 border-sage-500"
              : isActive
              ? "border-amber-500 bg-amber-50"
              : "border-charcoal-200 bg-white"
          }`}
        >
          {isCompleted && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-6 ${isCompleted ? "bg-sage-300" : "bg-charcoal-100"}`} />
        )}
      </div>

      {/* Content */}
      <div className="pb-6">
        <p
          className={`text-sm font-medium ${
            isCompleted
              ? "line-through text-charcoal-400"
              : isActive
              ? "text-charcoal-900"
              : "text-charcoal-600"
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-charcoal-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
