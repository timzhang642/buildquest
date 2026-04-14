import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic();

export async function sendWeeklyReports() {
  const supabase = createServiceRoleClient();

  // Get all active quests with teen and parent info
  const { data: quests } = await supabase
    .from("quests")
    .select(
      `
      id, title, description, status, started_at,
      teens!inner (id, name, parent_id,
        parents!inner (id, email, name)
      )
    `
    )
    .eq("status", "active");

  if (!quests?.length) return { sent: 0 };

  let sentCount = 0;

  for (const quest of quests) {
    const teen = (quest as any).teens;
    const parent = teen.parents;

    // Get messages from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: messages } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("quest_id", quest.id)
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at");

    // Get milestone status
    const { data: milestones } = await supabase
      .from("milestones")
      .select("title, status")
      .eq("quest_id", quest.id)
      .order("sort_order");

    // Generate summary with Claude Haiku
    const summaryPrompt = `You are writing a weekly progress email for a parent about their teen's project.

Teen name: ${teen.name}
Project: ${quest.title} - ${quest.description}
Messages this week: ${messages?.length ?? 0}
${
  messages?.length
    ? `Recent activity summary:\n${messages
        .slice(-10)
        .map((m: any) => `[${m.role}]: ${m.content.substring(0, 200)}`)
        .join("\n")}`
    : "No activity this week."
}

Milestones:
${milestones?.map((m: any) => `- [${m.status}] ${m.title}`).join("\n") ?? "No milestones yet."}

Write a warm, honest parent email. Include:
1. What the teen worked on this week (be specific)
2. Current milestone status
3. Learning signals (skills demonstrated)
4. Honest engagement assessment

If zero activity, say "${teen.name} didn't log in this week" — no fake progress.
Keep it under 300 words. Use plain language. Be honest but encouraging.
Output ONLY the email body in HTML (no subject, no wrapper).`;

    const summaryResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: summaryPrompt }],
    });

    const firstBlock = summaryResponse.content[0];
    const emailBody = "text" in firstBlock ? firstBlock.text : "";

    const subject = `BuildQuest Weekly: ${teen.name}'s progress on "${quest.title}"`;

    // Send email
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "BuildQuest <noreply@buildquest.app>",
      to: parent.email,
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #6366f1;">BuildQuest Weekly Update</h2>
          <p style="color: #666;">Hi ${parent.name},</p>
          ${emailBody}
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 13px;">
            This is an automated weekly report from BuildQuest.
            ${teen.name} is working on: ${quest.title}
          </p>
        </div>
      `,
    });

    // Log the email
    await supabase.from("weekly_emails").insert({
      teen_id: teen.id,
      parent_id: parent.id,
      subject,
      body_html: emailBody,
    });

    sentCount++;
  }

  return { sent: sentCount };
}
