import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { requireUser, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendOTPEmail(email: string, otp: string, subjectText: string, htmlIntro: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSender = process.env.SMTP_SENDER || smtpUser || "";

  const htmlContent = `
    <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
      <h2 style="color:#2563eb">HealthCare Pro</h2>
      <p>${htmlIntro}</p>
      <h1 style="letter-spacing:8px;color:#1d4ed8">${otp}</h1>
      <p style="color:#6b7280;font-size:13px">This OTP expires in 10 minutes. Do not share it with anyone.</p>
    </div>`;

  if (smtpHost && smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpSender.includes("<") ? smtpSender : `"HealthCare Pro" <${smtpSender}>`,
      to: email,
      subject: subjectText,
      html: htmlContent,
    });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY || "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "";

  if (apiKey.startsWith("xsmtpsib-")) {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: senderEmail,
        pass: apiKey,
      },
    });

    await transporter.sendMail({
      from: `"HealthCare Pro" <${senderEmail}>`,
      to: email,
      subject: subjectText,
      html: htmlContent,
    });
  } else if (apiKey) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "HealthCare Pro", email: senderEmail },
        to: [{ email }],
        subject: subjectText,
        htmlContent,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Brevo HTTP error: ${err}`);
    }
  }
}

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing?.isVerified) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          password: hashed,
          otp,
          otpExpiry,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          otp,
          otpExpiry,
        },
      });
    }

    console.log(`[OTP for ${email}]: ${otp}`);
    try {
      await sendOTPEmail(email, otp, "Your OTP for HealthCare Pro Registration", "Your OTP for registration is:");
    } catch (emailError: any) {
      console.warn(`[OTP Email Warning]: Could not send email via Brevo/SMTP: ${emailError.message}. Proceeding since OTP is logged to console.`);
    }

    return res.json({
      message: "OTP sent to your email",
      otp: process.env.NODE_ENV !== "production" ? otp : undefined
    });
  } catch (e: any) {
    console.error("[register]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in. Check your inbox for the OTP." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (!user.otp) return res.status(400).json({ error: "Invalid OTP" });
    const storedBuf = Buffer.from(user.otp.padEnd(6, " "));
    const inputBuf  = Buffer.from(otp.toString().padEnd(6, " "));
    const match = storedBuf.length === inputBuf.length &&
      crypto.timingSafeEqual(storedBuf, inputBuf);

    if (!match) return res.status(400).json({ error: "Invalid OTP" });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return res.json({ message: "Email verified successfully" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: "User with this email does not exist" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpiry,
      },
    });

    console.log(`[Forgot Password OTP for ${email}]: ${otp}`);
    try {
      await sendOTPEmail(email, otp, "Your OTP for HealthCare Pro Password Reset", "Your OTP to reset your password is:");
    } catch (emailError: any) {
      console.warn(`[OTP Email Warning]: Could not send forgot password email: ${emailError.message}. Proceeding since OTP is logged to console.`);
    }

    return res.json({
      message: "Reset OTP sent to your email",
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (e: any) {
    console.error("[forgot-password]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// POST /reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    if (!user.otp) return res.status(400).json({ error: "Invalid OTP" });
    const storedBuf = Buffer.from(user.otp.padEnd(6, " "));
    const inputBuf  = Buffer.from(otp.toString().padEnd(6, " "));
    const match = storedBuf.length === inputBuf.length &&
      crypto.timingSafeEqual(storedBuf, inputBuf);

    if (!match) return res.status(400).json({ error: "Invalid OTP" });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        otp: null,
        otpExpiry: null,
        isVerified: true,
      },
    });

    return res.json({ message: "Password reset successful. Please login." });
  } catch (e: any) {
    console.error("[reset-password]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// GET /me
router.get("/me", requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        bloodGroup: true,
        address: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /profile
router.put("/profile", requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, dob, bloodGroup, address } = req.body;

    if (!name?.trim())        return res.status(400).json({ error: "Full name is required" });
    if (!phone?.trim())       return res.status(400).json({ error: "Phone number is required" });
    if (!dob?.trim())         return res.status(400).json({ error: "Date of birth is required" });
    if (!bloodGroup?.trim())  return res.status(400).json({ error: "Blood group is required" });
    if (!address?.trim())     return res.status(400).json({ error: "Address is required" });

    if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    if (new Date(dob) >= new Date()) {
      return res.status(400).json({ error: "Date of birth cannot be in the future" });
    }

    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validBloodGroups.includes(bloodGroup.trim())) {
      return res.status(400).json({ error: "Invalid blood group" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        dob: dob.trim(),
        bloodGroup: bloodGroup.trim(),
        address: address.trim(),
      },
      select: {
        id: true, name: true, email: true, phone: true,
        dob: true, bloodGroup: true, address: true,
        avatar: true, isVerified: true, createdAt: true, updatedAt: true,
      },
    });

    return res.json({ user: updated, message: "Profile updated successfully" });
  } catch (e: any) {
    console.error("[profile PUT]", e.message);
    return res.status(500).json({ error: e.message });
  }
});

// POST /logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.json({ message: "Logged out successfully" });
});

export default router;
