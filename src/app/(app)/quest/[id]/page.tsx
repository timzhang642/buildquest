import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import QuestChat from "./quest-chat";

export default async function QuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.type !== "teen") redirect("/login");

  const supabase = createServiceRoleClient();

  const { data: quest } = await supabase
    .from("quests")
    .select("*")
    .eq("id", id)
    .eq("teen_id", session.id)
    .single();

  if (!quest) redirect("/dashboard");

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("quest_id", id)
    .order("sort_order");

  const { data: messages } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("quest_id", id)
    .neq("role", "system")
    .order("created_at");

  return (
    <QuestChat
      quest={quest}
      milestones={milestones ?? []}
      initialMessages={messages ?? []}
      teenId={session.id}
      teenName={session.name}
    />
  );
}
