"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromptChip } from "@/components/prompt-chip";

const suggestions = [
  "A website for my dog walking business",
  "A quiz app for my study group",
  "A weather dashboard for my family",
  "A personal portfolio to show colleges",
  "A recipe organizer for my favorite meals",
  "A tool to track my workout progress",
];

export default function NewQuestPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChipClick(label: string) {
    setDescription(label);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: description.trim(), description: description.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create quest");
      setLoading(false);
      return;
    }

    const { quest } = await res.json();
    router.push(`/quest/${quest.id}`);
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-display font-bold text-charcoal-900">
            BuildQuest
          </h1>
        </div>
      </header>

      {/* Main — first open screen: "What do you want to build?" */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧭</div>
            <h2 className="font-display text-3xl font-bold text-charcoal-900 leading-tight">
              What do you want to build?
            </h2>
            <p className="text-charcoal-500 mt-3">
              Tell your coach about your idea. It can be anything — a website,
              an app, a tool, a game. The only rule: you have to be excited about it.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            {error && (
              <div className="bg-bq-red-50 text-bq-red-700 px-4 py-3 rounded-xl text-sm border border-bq-red-100">
                {error}
              </div>
            )}

            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900 resize-none text-base placeholder:text-charcoal-300"
              placeholder="I want to build..."
            />

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <PromptChip key={s} label={s} onClick={handleChipClick} />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full py-3 px-4 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 disabled:opacity-40 transition text-base"
              style={{ boxShadow: "var(--bq-shadow-amber)" }}
            >
              {loading ? "Starting your quest..." : "Start Quest →"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
