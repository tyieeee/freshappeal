import nodemailer from "nodemailer";

/**
 * Lazy SMTP transporter. If SMTP credentials aren't configured we log the
 * message to the console instead of throwing so checkout still succeeds.
 */
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail({ to, subject, html, text }: MailInput) {
  const t = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "no-reply@freshappeal.store";
  if (!t) {
    console.log(
      `[mailer] SMTP not configured. Would have sent email to ${to}\n  Subject: ${subject}\n  Body: ${text ?? html.replace(/<[^>]+>/g, "").slice(0, 300)}`,
    );
    return { ok: false, reason: "smtp-not-configured" as const };
  }
  try {
    const info = await t.sendMail({ from, to, subject, html, text });
    return { ok: true as const, messageId: info.messageId };
  } catch (err) {
    console.error("[mailer] sendMail failed:", err);
    return { ok: false as const, reason: "send-failed" as const };
  }
}
