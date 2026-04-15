import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/server";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getAnthropic() {
  return new Anthropic();
}

type EmailVariant = "active" | "zero_activity" | "behind";

function getEmailVariant(
  messageCount: number,
  milestones: { title: string; status: string }[],
  questStartDate: string,
  shipDate: string | null
): EmailVariant {
  if (messageCount === 0) return "zero_activity";

  if (shipDate) {
    const now = new Date();
    const target = new Date(shipDate);
    const started = new Date(questStartDate);
    const totalDuration = target.getTime() - started.getTime();
    const elapsed = now.getTime() - started.getTime();
    const expectedProgress = elapsed / totalDuration;

    const completed = milestones.filter((m) => m.status === "completed").length;
    const actualProgress = milestones.length > 0 ? completed / milestones.length : 0;

    if (actualProgress < expectedProgress - 0.2) return "behind";
  }

  return "active";
}

function buildEmailHtml(
  variant: EmailVariant,
  parentName: string,
  teenName: string,
  questTitle: string,
  aiSummary: string,
  milestones: { title: string; status: string }[],
  shipDate: string | null
): string {
  const completed = milestones.filter((m) => m.status === "completed").length;
  const total = milestones.length;

  const statusBannerColor =
    variant === "active"
      ? "#dcfce7"
      : variant === "behind"
      ? "#fef3c7"
      : "#f5f5f5";
  const statusBannerTextColor =
    variant === "active"
      ? "#15803d"
      : variant === "behind"
      ? "#92400e"
      : "#525252";
  const statusText =
    variant === "active"
      ? "On Track"
      : variant === "behind"
      ? "Behind Schedule"
      : "No Activity This Week";

  const shipDayHtml = shipDate
    ? `<tr>
        <td style="padding: 16px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-radius: 12px; border: 1px solid #fde68a;">
            <tr>
              <td style="padding: 12px 16px; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: #1a1a1a;">
                🚀 <strong>Ship Day:</strong> ${new Date(shipDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const milestoneRows = milestones
    .map(
      (m) =>
        `<tr>
          <td style="padding: 4px 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; color: ${m.status === "completed" ? "#8a8a8a" : "#1a1a1a"};">
            ${m.status === "completed" ? "✅" : "⬜"} ${m.status === "completed" ? `<s>${m.title}</s>` : m.title}
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BuildQuest Weekly Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'DM Sans', Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #ede5d8; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 24px 16px; border-bottom: 1px solid #ede5d8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: 'Fraunces', Georgia, serif; font-size: 20px; font-weight: 700; color: #1a1a1a;">
                    🧭 BuildQuest
                  </td>
                  <td align="right" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8a8a8a; text-transform: uppercase; letter-spacing: 1px;">
                    Weekly Update
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status banner -->
          <tr>
            <td style="padding: 16px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${statusBannerColor}; border-radius: 8px;">
                <tr>
                  <td style="padding: 10px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; color: ${statusBannerTextColor}; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${statusText}
                  </td>
                  ${total > 0 ? `<td align="right" style="padding: 10px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${statusBannerTextColor};">${completed}/${total} milestones</td>` : ""}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 20px 24px 0; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; color: #404040;">
              Hi ${parentName},
            </td>
          </tr>

          <!-- AI summary -->
          <tr>
            <td style="padding: 12px 24px; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #2d2d2d;">
              ${aiSummary}
            </td>
          </tr>

          <!-- Milestones -->
          ${total > 0 ? `<tr>
            <td style="padding: 8px 24px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 0 16px 8px; font-family: 'Fraunces', Georgia, serif; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                    Milestones
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 16px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${milestoneRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>` : ""}

          <!-- Ship Day -->
          ${shipDayHtml}

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px 24px; border-top: 1px solid #ede5d8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #8a8a8a; line-height: 1.5;">
                    ${teenName} is working on: <strong style="color: #525252;">${questTitle}</strong><br>
                    This is an automated weekly report from BuildQuest.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWeeklyReports() {
  const supabase = createServiceRoleClient();

  const { data: quests } = await supabase
    .from("quests")
    .select(
      `
      id, title, description, status, started_at, target_ship_date,
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

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: messages } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("quest_id", quest.id)
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at");

    const { data: milestones } = await supabase
      .from("milestones")
      .select("title, status")
      .eq("quest_id", quest.id)
      .order("sort_order");

    const variant = getEmailVariant(
      messages?.length ?? 0,
      milestones ?? [],
      quest.started_at,
      quest.target_ship_date
    );

    const summaryPrompt = `You are writing the body of a weekly progress email for a parent about their teen's project. Variant: ${variant}.

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

${variant === "zero_activity" ? `IMPORTANT: Say "${teen.name} didn't log in this week" plainly. Then reassure that this is normal and give one specific parent tip (e.g. "ask to see what they've built so far").` : ""}
${variant === "behind" ? `IMPORTANT: Be honest about being behind schedule. Include a recovery suggestion with specific time estimates (e.g. "two 30-minute sessions this week").` : ""}
${variant === "active" ? "Include: what the teen worked on (be specific), skills demonstrated, and an encouraging note." : ""}

Write in a warm, honest voice. Under 200 words. Output ONLY the email body text (no HTML tags, no subject). Use short paragraphs.`;

    const summaryResponse = await getAnthropic().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: summaryPrompt }],
    });

    const firstBlock = summaryResponse.content[0];
    const emailBody = "text" in firstBlock ? firstBlock.text : "";

    const formattedBody = emailBody
      .split("\n\n")
      .map((p: string) => `<p style="margin: 0 0 12px 0;">${p.trim()}</p>`)
      .join("");

    const subject = `BuildQuest Weekly: ${teen.name}'s progress on "${quest.title}"`;

    const html = buildEmailHtml(
      variant,
      parent.name,
      teen.name,
      quest.title,
      formattedBody,
      milestones ?? [],
      quest.target_ship_date
    );

    await getResend().emails.send({
      from: process.env.FROM_EMAIL ?? "BuildQuest <onboarding@resend.dev>",
      to: parent.email,
      subject,
      html,
    });

    await supabase.from("weekly_emails").insert({
      teen_id: teen.id,
      parent_id: parent.id,
      subject,
      body_html: html,
    });

    sentCount++;
  }

  return { sent: sentCount };
}
