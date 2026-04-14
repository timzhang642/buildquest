import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServiceRoleClient();

  if (session.type === "teen") {
    const { data: quests } = await supabase
      .from("quests")
      .select("id, title, description, status, started_at, target_ship_date")
      .eq("teen_id", session.id)
      .order("started_at", { ascending: false });

    return (
      <div className="min-h-screen bg-cream-100">
        <header className="bg-white border-b border-cream-300 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-display font-bold text-charcoal-900">
              BuildQuest
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-charcoal-500">
                Hey, {session.name}!
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-charcoal-400 hover:text-charcoal-700 transition"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-charcoal-900">
              Your Quests
            </h2>
            <Link
              href="/quest/new"
              className="py-2 px-4 bg-amber-500 text-charcoal-900 rounded-lg font-semibold hover:bg-amber-400 transition text-sm"
            >
              Start New Quest
            </Link>
          </div>

          {!quests?.length ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
              <div className="text-4xl mb-4">🧭</div>
              <h3 className="text-lg font-display font-semibold text-charcoal-900 mb-2">
                Ready to build something?
              </h3>
              <p className="text-charcoal-500 mb-6 max-w-md mx-auto">
                Your AI coach will help you figure out what to build and guide
                you through every step.
              </p>
              <Link
                href="/quest/new"
                className="inline-block py-2.5 px-6 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 transition"
                style={{ boxShadow: "0 4px 16px rgba(245,158,11,0.2)" }}
              >
                Start Your First Quest
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quests.map((quest) => (
                <Link
                  key={quest.id}
                  href={`/quest/${quest.id}`}
                  className="block bg-white rounded-xl border border-cream-300 p-6 hover:border-amber-300 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-charcoal-900">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">
                        {quest.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full font-mono uppercase tracking-wide ${
                        quest.status === "active"
                          ? "bg-sage-50 text-sage-700"
                          : quest.status === "completed"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-charcoal-50 text-charcoal-500"
                      }`}
                    >
                      {quest.status}
                    </span>
                  </div>
                  {quest.target_ship_date && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="text-xs">🚀</span>
                      <p className="text-xs text-charcoal-400 font-mono">
                        Ship Day:{" "}
                        {new Date(quest.target_ship_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Parent dashboard
  const { data: teens } = await supabase
    .from("teens")
    .select(
      `
      id, name, username,
      quests (id, title, status, started_at)
    `
    )
    .eq("parent_id", session.id);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-charcoal-900">
            BuildQuest
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-charcoal-500">
              Hi, {session.name}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-charcoal-400 hover:text-charcoal-700 transition"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-charcoal-900">
            Your Teens
          </h2>
          <Link
            href="/enroll"
            className="py-2 px-4 bg-amber-500 text-charcoal-900 rounded-lg font-semibold hover:bg-amber-400 transition text-sm"
          >
            Enroll Another Teen
          </Link>
        </div>

        {!teens?.length ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-300">
            <h3 className="text-lg font-display font-semibold text-charcoal-900 mb-2">
              No teens enrolled yet
            </h3>
            <p className="text-charcoal-500 mb-6">
              Enroll your teen to get them started with AI-coached project
              building.
            </p>
            <Link
              href="/enroll"
              className="inline-block py-2.5 px-6 bg-amber-500 text-charcoal-900 rounded-xl font-bold hover:bg-amber-400 transition"
            >
              Enroll Teen
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {teens.map((teen: any) => (
              <div
                key={teen.id}
                className="bg-white rounded-xl border border-cream-300 p-6"
              >
                <h3 className="font-display font-semibold text-charcoal-900 text-lg">
                  {teen.name}
                </h3>
                <p className="text-sm text-charcoal-400 font-mono">@{teen.username}</p>

                {teen.quests?.length ? (
                  <div className="mt-4 space-y-2">
                    {teen.quests.map((quest: any) => (
                      <div
                        key={quest.id}
                        className="flex items-center justify-between bg-cream-100 rounded-lg px-4 py-3"
                      >
                        <span className="text-sm text-charcoal-700">
                          {quest.title}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full font-mono uppercase tracking-wide ${
                            quest.status === "active"
                              ? "bg-sage-50 text-sage-700"
                              : quest.status === "completed"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-charcoal-50 text-charcoal-500"
                          }`}
                        >
                          {quest.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400 mt-3">
                    No quests started yet
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
