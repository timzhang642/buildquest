import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { SignJWT } from "jose";

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const computed = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return computed === hash;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();

  const { data: teen } = await supabase
    .from("teens")
    .select("id, name, username, password_hash, parent_id")
    .eq("username", username)
    .single();

  if (!teen || !verifyPassword(password, teen.password_hash)) {
    return Response.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  // Create a simple JWT for teen session
  const secret = new TextEncoder().encode(
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const token = await new SignJWT({
    teenId: teen.id,
    name: teen.name,
    username: teen.username,
    parentId: teen.parent_id,
    role: "teen",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const response = NextResponse.json({
    teen: { id: teen.id, name: teen.name, username: teen.username },
  });

  response.cookies.set("teen-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
