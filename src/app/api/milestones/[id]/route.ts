import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !["pending", "in_progress", "completed"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const update: Record<string, unknown> = { status };
  if (status === "completed") {
    update.completed_at = new Date().toISOString();
  } else {
    update.completed_at = null;
  }

  const { error } = await supabase
    .from("milestones")
    .update(update)
    .eq("id", id);

  if (error) {
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
