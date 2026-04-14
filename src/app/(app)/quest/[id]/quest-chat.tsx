"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI: add user message immediately
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">
                {quest.title}
              </h1>
              {quest.target_ship_date && (
                <p className="text-xs text-gray-400">
                  Ship Day:{" "}
                  {new Date(quest.target_ship_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showMilestones ? "Hide" : "Milestones"}
            {milestones.length > 0 && (
              <span className="ml-1 text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                {milestones.filter((m) => m.status === "completed").length}/
                {milestones.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-4xl mx-auto w-full">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
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
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm resize-none text-gray-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Milestones sidebar */}
        {showMilestones && (
          <div className="w-72 border-l border-gray-100 bg-white p-4 overflow-y-auto flex-shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">
              Milestones
            </h3>
            {milestones.length === 0 ? (
              <p className="text-sm text-gray-400">
                No milestones yet. Your coach will help you create them as you
                plan your project.
              </p>
            ) : (
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    onClick={() =>
                      toggleMilestone(milestone.id, milestone.status)
                    }
                    className="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        milestone.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {milestone.status === "completed" && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${
                          milestone.status === "completed"
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
