import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";

function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { parentId, name, age, username, password } = body;

  if (!parentId || !name || !age || !username || !password) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (age < 13) {
    return Response.json(
      { error: "Teens must be at least 13 years old" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  // Verify parent exists
  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("id", parentId)
    .single();

  if (!parent) {
    return Response.json({ error: "Parent not found" }, { status: 404 });
  }

  // Check username uniqueness
  const { data: existing } = await supabase
    .from("teens")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return Response.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = `${salt}:${hashPassword(password, salt)}`;

  const { data: teen, error } = await supabase
    .from("teens")
    .insert({
      parent_id: parentId,
      name,
      age,
      username,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: "Failed to enroll teen" },
      { status: 500 }
    );
  }

  return Response.json({ teen: { id: teen.id, name: teen.name, username: teen.username } });
}
