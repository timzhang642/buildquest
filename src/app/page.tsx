import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-charcoal-900 tracking-tight">
            BuildQuest
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-charcoal-500 hover:text-charcoal-900 transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm py-2 px-4 bg-amber-500 text-charcoal-900 rounded-lg font-semibold hover:bg-amber-400 transition shadow-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-5xl font-bold text-charcoal-900 leading-tight tracking-tight">
            Your teen builds real projects.
            <br />
            <span className="text-amber-600">AI coaches them through it.</span>
          </h2>
          <p className="text-xl text-charcoal-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            BuildQuest gives your 13+ teen a personal AI coach that helps them
            pick a project, break it into steps, and actually finish it. You get
            a weekly progress report. No nagging required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="py-3 px-8 bg-amber-500 text-charcoal-900 rounded-xl font-bold text-lg hover:bg-amber-400 transition"
              style={{ boxShadow: "var(--bq-shadow-amber)" }}
            >
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Exemplar cards — social proof */}
        <div className="mt-20 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-none">
          {[
            { name: "Sofia, 14", project: "Neighborhood book exchange website", weeks: 5, emoji: "📚" },
            { name: "Marcus, 16", project: "Weather dashboard for his farm", weeks: 4, emoji: "🌾" },
            { name: "Priya, 13", project: "Quiz app for her study group", weeks: 6, emoji: "🧠" },
          ].map((exemplar) => (
            <div
              key={exemplar.name}
              className="flex-shrink-0 snap-center w-72 bg-white rounded-2xl p-6 border border-cream-300"
              style={{ boxShadow: "var(--bq-shadow-sm)" }}
            >
              <div className="text-3xl mb-3">{exemplar.emoji}</div>
              <p className="text-charcoal-900 font-semibold text-sm">
                {exemplar.name}
              </p>
              <p className="text-charcoal-500 text-sm mt-1">
                {exemplar.project}
              </p>
              <p className="text-amber-600 text-xs font-semibold mt-3 font-mono uppercase tracking-wide">
                Shipped in {exemplar.weeks} weeks
              </p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-cream-300">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="font-display font-semibold text-charcoal-900 text-lg mb-2">
              Teen picks their project
            </h3>
            <p className="text-charcoal-500 text-sm leading-relaxed">
              No boring templates. Your teen decides what to build — a website,
              an app, a tool. The coach helps them scope it.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-cream-300">
            <div className="text-3xl mb-4">🧭</div>
            <h3 className="font-display font-semibold text-charcoal-900 text-lg mb-2">
              AI coach guides every step
            </h3>
            <p className="text-charcoal-500 text-sm leading-relaxed">
              Kind, specific, helpful feedback. Never writes code for them.
              Always pushes them toward shipping something real.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-cream-300">
            <div className="text-3xl mb-4">📬</div>
            <h3 className="font-display font-semibold text-charcoal-900 text-lg mb-2">
              You get weekly updates
            </h3>
            <p className="text-charcoal-500 text-sm leading-relaxed">
              Every Sunday: what they worked on, skills they demonstrated, honest
              progress assessment. No dashboard to check.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cream-300 py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-charcoal-400">
          BuildQuest — AI-coached project building for teens
        </div>
      </footer>
    </div>
  );
}
