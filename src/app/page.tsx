import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">BuildQuest</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 leading-tight">
            Your teen builds real projects.
            <br />
            <span className="text-indigo-600">AI coaches them through it.</span>
          </h2>
          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            BuildQuest gives your 13+ teen a personal AI coach that helps them
            pick a project, break it into steps, and actually finish it. You get
            a weekly progress report. No nagging required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="py-3 px-8 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="text-3xl mb-4">&#127919;</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              Teen picks their project
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              No boring templates. Your teen decides what to build — a website,
              an app, a tool. The coach helps them scope it.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="text-3xl mb-4">&#129302;</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              AI coach guides every step
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Kind, specific, helpful feedback. Never writes code for them.
              Always pushes them toward shipping something real.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="text-3xl mb-4">&#128231;</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              You get weekly updates
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Every Sunday: what they worked on, skills they demonstrated, honest
              progress assessment. No dashboard to check.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-gray-400">
          BuildQuest — AI-coached project building for teens
        </div>
      </footer>
    </div>
  );
}
