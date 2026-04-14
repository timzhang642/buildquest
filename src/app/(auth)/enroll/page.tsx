"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EnrollPage() {
  const [teenName, setTeenName] = useState("");
  const [age, setAge] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const ageNum = parseInt(age, 10);
    if (ageNum < 13) {
      setError("Teens must be at least 13 years old to use BuildQuest.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to enroll a teen.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/enroll-teen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parentId: user.id,
        name: teenName,
        age: ageNum,
        username,
        password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Enrollment failed");
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl border border-cream-300 p-8" style={{ boxShadow: "var(--bq-shadow-md)" }}>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-2">
              {teenName} is enrolled!
            </h2>
            <p className="text-charcoal-500 mb-6">
              They can now log in with username <strong className="text-charcoal-900">{username}</strong> and
              start their first quest.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-charcoal-400">
                Share these login details with {teenName}:
              </p>
              <div className="bg-cream-100 rounded-xl p-4 text-left text-sm font-mono">
                <p>
                  <span className="text-charcoal-400">Username:</span>{" "}
                  <strong className="text-charcoal-900">{username}</strong>
                </p>
                <p>
                  <span className="text-charcoal-400">Password:</span>{" "}
                  <strong className="text-charcoal-900">{password}</strong>
                </p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="mt-6 inline-block py-2.5 px-6 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 transition"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-charcoal-900">
            Enroll Your Teen
          </h1>
          <p className="text-charcoal-500 mt-2">
            Create a login for your teen so they can start building
          </p>
        </div>

        <form
          onSubmit={handleEnroll}
          className="bg-white rounded-2xl border border-cream-300 p-8 space-y-5"
          style={{ boxShadow: "var(--bq-shadow-md)" }}
        >
          {error && (
            <div className="bg-bq-red-50 text-bq-red-700 px-4 py-3 rounded-xl text-sm border border-bq-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="teenName" className="block text-sm font-medium text-charcoal-700 mb-1">
              Teen&apos;s Name
            </label>
            <input
              id="teenName"
              type="text"
              required
              value={teenName}
              onChange={(e) => setTeenName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="Alex"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-charcoal-700 mb-1">
              Age
            </label>
            <input
              id="age"
              type="number"
              required
              min={13}
              max={19}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="14"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-charcoal-700 mb-1">
              Username (for teen login)
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              pattern="[a-zA-Z0-9_-]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="alex_builds"
            />
            <p className="text-xs text-charcoal-400 mt-1">
              Letters, numbers, hyphens, underscores only
            </p>
          </div>

          <div>
            <label htmlFor="teenPassword" className="block text-sm font-medium text-charcoal-700 mb-1">
              Password (for teen login)
            </label>
            <input
              id="teenPassword"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 disabled:opacity-50 transition"
          >
            {loading ? "Enrolling..." : "Enroll Teen"}
          </button>
        </form>
      </div>
    </div>
  );
}
