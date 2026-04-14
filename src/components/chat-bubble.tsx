"use client";

export type ChatRole = "user" | "assistant" | "system";

export function ChatBubble({
  role,
  content,
}: {
  role: ChatRole;
  content: string;
}) {
  if (role === "system") {
    return (
      <div className="flex justify-center">
        <div className="bg-cream-200 text-charcoal-600 text-xs px-4 py-2 rounded-full max-w-[85%]">
          {content}
        </div>
      </div>
    );
  }

  const isCoach = role === "assistant";

  return (
    <div className={`flex ${isCoach ? "justify-start" : "justify-end"}`}>
      {isCoach && (
        <div className="flex-shrink-0 mr-2 mt-1 w-7 h-7 rounded-full bg-charcoal-800 flex items-center justify-center text-sm">
          🧭
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
          isCoach
            ? "bg-charcoal-800 text-charcoal-50 rounded-[var(--bq-radius-coach)]"
            : "bg-amber-400 text-charcoal-900 rounded-[var(--bq-radius-teen)]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex-shrink-0 mr-2 mt-1 w-7 h-7 rounded-full bg-charcoal-800 flex items-center justify-center text-sm">
        🧭
      </div>
      <div className="bg-charcoal-800 rounded-[var(--bq-radius-coach)] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="bq-typing-dot w-2 h-2 bg-charcoal-400 rounded-full" />
          <span className="bq-typing-dot w-2 h-2 bg-charcoal-400 rounded-full" />
          <span className="bq-typing-dot w-2 h-2 bg-charcoal-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
