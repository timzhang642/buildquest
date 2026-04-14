import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createServiceRoleClient } from "@/lib/supabase/server";

async function getTeenId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("teen-session")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { payload } = await jwtVerify(token, secret);
    return payload.teenId as string;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const teenId = await getTeenId();
  if (!teenId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description } = body;

  if (!title || !description) {
    return Response.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  // Calculate ship date (6 weeks from now)
  const shipDate = new Date();
  shipDate.setDate(shipDate.getDate() + 42);

  const { data: quest, error } = await supabase
    .from("quests")
    .insert({
      teen_id: teenId,
      title,
      description,
      target_ship_date: shipDate.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: "Failed to create quest" }, { status: 500 });
  }

  // Create initial coach message
  await supabase.from("messages").insert({
    quest_id: quest.id,
    role: "assistant",
    content: `Hey! I'm your AI coach, and I'm excited to help you build "${title}." 🎯\n\nBefore we dive in, I want to understand your vision better. You said: "${description}"\n\nA few questions to get us started:\n1. **Who is this for?** Who would use what you're building?\n2. **What's the smallest version** that would still be useful? We want to ship something real, not plan forever.\n3. **Have you built anything like this before?** It's totally fine if not — just helps me know where to start.\n\nTake your time, answer what you can, and we'll figure out the rest together!`,
  });

  return Response.json({ quest });
}
