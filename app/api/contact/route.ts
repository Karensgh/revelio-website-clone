import { NextResponse } from "next/server";

// Fields Framer adds to the form as invisible spam traps. Real visitors never fill them in.
const honeypots = ["website", "company", "subject", "title", "description", "feedback", "notes", "details", "remarks", "comments"];

/**
 * Receives the "Ready to Launch" contact form and delivers it by email
 * (RESEND_API_KEY + CONTACT_TO_EMAIL) and/or as JSON to CONTACT_WEBHOOK_URL.
 */
export async function POST(request: Request) {
  const form = await request.formData();

  if (honeypots.some((name) => String(form.get(name) ?? "").trim() !== "")) {
    return NextResponse.json({ ok: true });
  }

  // "message" appears twice: the real textarea first, then a honeypot.
  const [message = "", messageTrap = ""] = form.getAll("message").map(String);
  if (messageTrap.trim() !== "") return NextResponse.json({ ok: true });

  const submission = {
    firstName: String(form.get("first_name") ?? "").trim(),
    lastName: String(form.get("last_name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    company: String(form.get("company_name") ?? "").trim(),
    interests: [form.get("startup use case") && "Startup Use Case", form.get("enterprise use case") && "Enterprise Use Case"].filter(Boolean),
    message: message.trim(),
    submittedAt: new Date().toISOString()
  };

  if (!submission.firstName || !submission.lastName || !/^\S+@\S+\.\S+$/.test(submission.email) || !submission.company) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const deliveries: Promise<void>[] = [];
  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) deliveries.push(sendEmail(submission));
  if (process.env.CONTACT_WEBHOOK_URL) deliveries.push(sendWebhook(process.env.CONTACT_WEBHOOK_URL, submission));
  if (deliveries.length === 0) {
    // Demo mode: accept the submission so the form shows its success state.
    console.warn("No delivery configured (RESEND_API_KEY + CONTACT_TO_EMAIL or CONTACT_WEBHOOK_URL); submission accepted but not sent.");
    return NextResponse.json({ ok: true });
  }

  try {
    await Promise.all(deliveries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

type Submission = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  interests: unknown[];
  message: string;
  submittedAt: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Emails the submission via Resend (https://resend.com). Replies go straight to the visitor. */
async function sendEmail(submission: Submission) {
  const rows: [string, string][] = [
    ["Name", `${submission.firstName} ${submission.lastName}`],
    ["Email", submission.email],
    ["Company", submission.company],
    ["Interested in", submission.interests.join(", ") || "Not specified"],
    ["Message", submission.message || "(none)"],
    ["Submitted", submission.submittedAt]
  ];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Revelio Website <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL!.split(",").map((address) => address.trim()),
      reply_to: submission.email,
      subject: `New contact form submission from ${submission.firstName} ${submission.lastName} (${submission.company})`,
      text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
      html: `<table cellpadding="6">${rows
        .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`)
        .join("")}</table>`
    })
  });
  if (!response.ok) throw new Error(`Resend failed: ${response.status} ${await response.text()}`);
}

async function sendWebhook(url: string, submission: Submission) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(submission)
  });
  if (!response.ok) throw new Error(`Contact webhook failed: ${response.status} ${await response.text()}`);
}
