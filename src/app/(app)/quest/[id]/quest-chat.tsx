"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChatBubble, TypingIndicator } from "@/components/chat-bubble";
import { MilestoneCard } from "@/components/milestone-card";
import { ProgressRing } from "@/components/progress-ring";
import { ShipDayBanner } from "@/components/ship-day-banner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  sort_order: number;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  status: string;
  started_at: string;
  target_ship_date: string | null;
};

export default function QuestChat({
  quest,
  milestones: initialMilestones,
  initialMessages,
  teenId,
  teenName,
}: {
  quest: Quest;
  milestones: Milestone[];
  initialMessages: Message[];
  teenId: string;
  teenName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questId: quest.id,
          teenId,
          message: userMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I had trouble responding. Try sending your message again.",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  }

  async function toggleMilestone(milestoneId: string, currentStatus: string) {
    const newStatus =
      currentStatus === "completed" ? "pending" : "completed";
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId ? { ...m, status: newStatus } : m
      )
    );

    await fetch(`/api/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  return (
    <div className="h-screen flex flex-col bg-cream-100">
      {/* Header with milestone context */}
      <header className="bg-white border-b border-cream-300 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-charcoal-400 hover:text-charcoal-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-display font-semibold text-charcoal-900 text-sm">
                {quest.title}
              </h1>
              {milestones.length > 0 && (
                <p className="text-xs text-charcoal-400">
                  Milestone {completedMilestones + 1} of {milestones.length}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="text-sm text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5"
          >
            {showMilestones ? "Hide" : "Progress"}
            {milestones.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                {completedMilestones}/{milestones.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Ship Day banner */}
      {quest.target_ship_date && (
        <div className="px-4 pt-3 max-w-4xl mx-auto w-full">
          <ShipDayBanner targetDate={quest.target_ship_date} />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden max-w-4xl mx-auto w-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🧭</div>
                <p className="text-charcoal-600 font-display font-semibold text-lg">
                  Your coach is ready
                </p>
                <p className="text-charcoal-400 text-sm mt-1 max-w-sm mx-auto">
                  Tell your coach about your project idea. They&apos;ll help you figure out the first step.
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 flex-shrink-0">
            <form onSubmit={sendMessage} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message to your coach..."
                rows={1}
                className="flex-1 px-4 py-2.5 rounded-xl border border-charcoal-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-sm resize-none text-charcoal-900 placeholder:text-charcoal-300"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="px-4 py-2.5 bg-amber-500 text-charcoal-900 rounded-xl font-semibold hover:bg-amber-400 disabled:opacity-40 transition text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Milestones sidebar */}
        {showMilestones && (
          <div className="w-80 border-l border-cream-300 bg-white p-5 overflow-y-auto flex-shrink-0">
            {/* Progress ring */}
            {milestones.length > 0 && (
              <div className="flex justify-center mb-6">
                <ProgressRing completed={completedMilestones} total={milestones.length} />
              </div>
            )}

            <h3 className="font-display font-semibold text-charcoal-900 text-sm mb-4">
              Milestones
            </h3>
            {milestones.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-charcoal-400">
                  No milestones yet. Your coach will help you create them as you
                  plan your project.
                </p>
              </div>
            ) : (
              <div>
                {milestones.map((milestone, i) => (
                  <MilestoneCard
                    key={milestone.id}
                    title={milestone.title}
                    description={milestone.description}
                    status={milestone.status as "pending" | "active" | "completed"}
                    index={i}
                    total={milestones.length}
                    onToggle={() => toggleMilestone(milestone.id, milestone.status)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
