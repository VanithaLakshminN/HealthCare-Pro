import { Router } from "express";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, optionalUser, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

async function sendReplyEmail(to: string, userName: string, subject: string, originalMessage: string, adminReply: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSender = process.env.SMTP_SENDER || smtpUser || "";

  const htmlBody = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff">
      <div style="margin-bottom:20px">
        <h2 style="color:#2563eb;margin:0 0 4px 0">HealthCare Pro</h2>
        <p style="color:#6b7280;font-size:13px;margin:0">Support Team Response</p>
      </div>
      <p style="color:#111827;font-size:15px">Hi <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:14px">We have responded to your query. Here is our reply:</p>

      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="color:#14532d;font-size:13px;font-weight:600;margin:0 0 8px 0">Admin Reply:</p>
        <p style="color:#166534;font-size:14px;margin:0;white-space:pre-wrap">${adminReply}</p>
      </div>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
        <p style="color:#6b7280;font-size:12px;font-weight:600;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.05em">Your Original Query</p>
        <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 4px 0">Subject: ${subject}</p>
        <p style="color:#6b7280;font-size:13px;margin:0;white-space:pre-wrap">${originalMessage}</p>
      </div>

      <p style="color:#6b7280;font-size:13px;margin:16px 0 0 0">
        If you have further questions, feel free to contact us again through our website.<br/>
        <strong style="color:#2563eb">HealthCare Pro Support Team</strong>
      </p>
    </div>
  `;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: smtpSender.includes("<") ? smtpSender : `"HealthCare Pro" <${smtpSender}>`,
      to,
      subject: `Re: ${subject} — HealthCare Pro Support`,
      html: htmlBody,
    });
    return;
  }

  // Fallback: Brevo API
  const apiKey = process.env.BREVO_API_KEY || "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "";
  if (!apiKey || !senderEmail) throw new Error("No email provider configured");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "HealthCare Pro", email: senderEmail },
      to: [{ email: to, name: userName }],
      subject: `Re: ${subject} — HealthCare Pro Support`,
      htmlContent: htmlBody,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo error: ${err}`);
  }
}

// POST /
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (!body.name || !body.email || !body.subject || !body.message) {
      return res.status(400).json({ error: "Name, email, subject and message are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const contact = await prisma.contact.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        subject: body.subject.trim(),
        message: body.message.trim(),
        status: "pending",
      },
    });

    return res.status(201).json({
      message: "Query submitted successfully",
      contact: { ...contact, _id: contact.id },
    });
  } catch (e: any) {
    console.error("[contact POST]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// GET /
router.get("/", optionalUser, async (req: AuthenticatedRequest, res) => {
  try {
    // Admin check: read adminToken cookie manually if needed, or check req.cookies
    const adminToken = req.cookies?.adminToken;
    if (adminToken) {
      // Allow admin access
      const queries = await prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json({
        queries: queries.map((q) => ({ ...q, _id: q.id })),
      });
    }

    // User check: logged-in user gets only THEIR queries
    if (req.user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { email: true },
      });
      if (!dbUser) return res.status(404).json({ error: "User not found" });

      const queries = await prisma.contact.findMany({
        where: { email: dbUser.email },
        orderBy: { createdAt: "desc" },
      });
      return res.json({
        queries: queries.map((q) => ({ ...q, _id: q.id })),
      });
    }

    return res.status(401).json({ error: "Unauthorized" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /:id
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;

    if (!adminReply?.trim()) {
      return res.status(400).json({ error: "Reply message cannot be empty" });
    }

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Query not found" });

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        adminReply: adminReply.trim(),
        status: status || "addressed",
        repliedAt: new Date(),
      },
    });

    try {
      await sendReplyEmail(
        existing.email,
        existing.name,
        existing.subject,
        existing.message,
        adminReply.trim()
      );
      console.log(`[contact reply] Email sent to ${existing.email}`);
    } catch (emailErr: any) {
      console.warn(`[contact reply] Email failed for ${existing.email}: ${emailErr.message}`);
    }

    return res.json({
      contact: { ...contact, _id: contact.id },
      emailSent: true,
    });
  } catch (e: any) {
    console.error("[contact PUT]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

export default router;
