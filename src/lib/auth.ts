import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createClient } from "@/lib/supabase/server";

export type UserSession =
  | { type: "parent"; id: string; email: string; name: string }
  | { type: "teen"; id: string; name: string; username: string; parentId: string };

export async function getSession(): Promise<UserSession | null> {
  // Check teen session first (cookie-based JWT)
  const cookieStore = await cookies();
  const teenToken = cookieStore.get("teen-session")?.value;

  if (teenToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { payload } = await jwtVerify(teenToken, secret);
      return {
        type: "teen",
        id: payload.teenId as string,
        name: payload.name as string,
        username: payload.username as string,
        parentId: payload.parentId as string,
      };
    } catch {
      // Invalid token — fall through to parent check
    }
  }

  // Check Supabase parent session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      type: "parent",
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? "Parent",
    };
  }

  return null;
}
