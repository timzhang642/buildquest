"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"parent" | "teen">("parent");

  async function handleParentLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleTeenLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/teen-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: identifier, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-charcoal-900">
            BuildQuest
          </h1>
          <p className="text-charcoal-500 mt-2">Welcome back</p>
        </div>

        <div className="bg-white rounded-2xl border border-cream-300 p-8 space-y-5" style={{ boxShadow: "var(--bq-shadow-md)" }}>
          {/* Toggle */}
          <div className="flex rounded-lg bg-cream-200 p-1">
            <button
              type="button"
              onClick={() => setMode("parent")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                mode === "parent"
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-500"
              }`}
            >
              Parent
            </button>
            <button
              type="button"
              onClick={() => setMode("teen")}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${
                mode === "teen"
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-500"
              }`}
            >
              Teen
            </button>
          </div>

          {error && (
            <div className="bg-bq-red-50 text-bq-red-700 px-4 py-3 rounded-xl text-sm border border-bq-red-100">
              {error}
            </div>
          )}

          <form
            onSubmit={mode === "parent" ? handleParentLogin : handleTeenLogin}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-charcoal-700 mb-1"
              >
                {mode === "parent" ? "Email" : "Username"}
              </label>
              <input
                id="identifier"
                type={mode === "parent" ? "email" : "text"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
                placeholder={
                  mode === "parent" ? "parent@example.com" : "your-username"
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-charcoal-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 disabled:opacity-50 transition"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-amber-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
