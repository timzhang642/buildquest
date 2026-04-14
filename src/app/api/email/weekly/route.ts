import { NextRequest } from "next/server";
import { sendWeeklyReports } from "@/lib/email/weekly-report";

async function handleWeeklyEmail(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendWeeklyReports();
  return Response.json(result);
}

export const GET = handleWeeklyEmail;
export const POST = handleWeeklyEmail;
