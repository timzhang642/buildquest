import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createServiceRoleClient();

  if (session.type === "teen") {
    // Teen dashboard: show their quests
    const { data: quests } = await supabase
      .from("quests")
      .select("id, title, description, status, started_at, target_ship_date")
      .eq("teen_id", session.id)
      .order("started_at", { ascending: false });

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">BuildQuest</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Hey, {session.name}!
              </span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Quests</h2>
            <Link
              href="/quest/new"
              className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
            >
              Start New Quest
            </Link>
          </div>

          {!quests?.length ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to build something?
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Your AI coach will help you figure out what to build and guide
                you through every step.
              </p>
              <Link
                href="/quest/new"
                className="inline-block py-2.5 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
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
                  className="block bg-white rounded-xl border border-gray-100 p-6 hover:border-indigo-200 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {quest.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {quest.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        quest.status === "active"
                          ? "bg-green-50 text-green-700"
                          : quest.status === "completed"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {quest.status}
                    </span>
                  </div>
                  {quest.target_ship_date && (
                    <p className="text-xs text-gray-400 mt-3">
                      Ship Day:{" "}
                      {new Date(quest.target_ship_date).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Parent dashboard: show their teens and quest status
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">BuildQuest</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Hi, {session.name}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Teens</h2>
          <Link
            href="/enroll"
            className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
          >
            Enroll Another Teen
          </Link>
        </div>

        {!teens?.length ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No teens enrolled yet
            </h3>
            <p className="text-gray-500 mb-6">
              Enroll your teen to get them started with AI-coached project
              building.
            </p>
            <Link
              href="/enroll"
              className="inline-block py-2.5 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Enroll Teen
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {teens.map((teen: any) => (
              <div
                key={teen.id}
                className="bg-white rounded-xl border border-gray-100 p-6"
              >
                <h3 className="font-semibold text-gray-900 text-lg">
                  {teen.name}
                </h3>
                <p className="text-sm text-gray-400">@{teen.username}</p>

                {teen.quests?.length ? (
                  <div className="mt-4 space-y-2">
                    {teen.quests.map((quest: any) => (
                      <div
                        key={quest.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                      >
                        <span className="text-sm text-gray-700">
                          {quest.title}
                        </span>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            quest.status === "active"
                              ? "bg-green-50 text-green-700"
                              : quest.status === "completed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {quest.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 mt-3">
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
