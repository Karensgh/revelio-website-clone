import { NextResponse } from "next/server";

// Fields Framer adds to the form as invisible spam traps. Real visitors never fill them in.
const honeypots = ["website", "company", "subject", "title", "description", "feedback", "notes", "details", "remarks", "comments"];

/**
 * Receives the "Ready to Launch" contact form and forwards it as JSON to
 * CONTACT_WEBHOOK_URL (a Slack/Zapier/Make/Formspree webhook, for example).
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

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    console.error("CONTACT_WEBHOOK_URL is not set; contact form submission was not delivered.");
    return NextResponse.json({ ok: false, error: "Form delivery is not configured" }, { status: 503 });
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(submission)
  });
  if (!response.ok) {
    console.error("Contact webhook failed", response.status, await response.text());
    return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
