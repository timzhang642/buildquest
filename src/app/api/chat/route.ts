import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { buildMessages } from "@/lib/ai/coach";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { questId, message, teenId } = body;

  if (!questId || !message || !teenId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Verify quest belongs to teen
  const { data: quest, error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("teen_id", teenId)
    .single();

  if (questError || !quest) {
    return Response.json({ error: "Quest not found" }, { status: 404 });
  }

  // Get milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("title, status")
    .eq("quest_id", questId)
    .order("sort_order");

  // Get conversation history (last 50 messages for context window management)
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("quest_id", questId)
    .neq("role", "system")
    .order("created_at", { ascending: true })
    .limit(50);

  // Save user message
  await supabase.from("messages").insert({
    quest_id: questId,
    role: "user",
    content: message,
  });

  // Build messages for Claude
  const messages = buildMessages(
    quest.title,
    quest.description,
    milestones ?? [],
    (history ?? []) as { role: "user" | "assistant"; content: string }[],
    message
  );

  // Call Claude
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1024,
    system: messages[0].content,
    messages: messages.slice(1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const firstBlock = response.content[0];
  const assistantMessage =
    "text" in firstBlock ? firstBlock.text : "";

  // Save assistant response
  await supabase.from("messages").insert({
    quest_id: questId,
    role: "assistant",
    content: assistantMessage,
  });

  return Response.json({ message: assistantMessage });
}
