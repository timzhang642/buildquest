"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "parent" },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Profile row is created automatically by database trigger on auth.users insert.
      // If email confirmation is required, session won't be established yet.
      if (data.session) {
        window.location.href = "/enroll";
      } else {
        // Email confirmation required
        setShowConfirmation(true);
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-charcoal-900">
            BuildQuest
          </h1>
          <p className="text-charcoal-500 mt-2">
            Sign up to enroll your teen in AI-coached project building
          </p>
        </div>

        {showConfirmation ? (
          <div
            className="bg-white rounded-2xl border border-cream-300 p-8 text-center space-y-4"
            style={{ boxShadow: "var(--bq-shadow-md)" }}
          >
            <div className="text-4xl">📬</div>
            <h2 className="text-xl font-display font-semibold text-charcoal-900">
              Check your email
            </h2>
            <p className="text-charcoal-600">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back to log in.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-amber-700 font-semibold hover:underline"
            >
              Go to login
            </Link>
          </div>
        ) : (
        <form
          onSubmit={handleSignup}
          className="bg-white rounded-2xl border border-cream-300 p-8 space-y-5"
          style={{ boxShadow: "var(--bq-shadow-md)" }}
        >
          <h2 className="text-xl font-display font-semibold text-charcoal-900">
            Parent Account
          </h2>

          {error && (
            <div className="bg-bq-red-50 text-bq-red-700 px-4 py-3 rounded-xl text-sm border border-bq-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-charcoal-700 mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="parent@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition text-charcoal-900"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 disabled:opacity-50 transition"
          >
            {loading ? "Creating account..." : "Create Parent Account"}
          </button>

          <p className="text-center text-sm text-charcoal-500">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-700 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </form>
        )}
      </div>
    </div>
  );
}
