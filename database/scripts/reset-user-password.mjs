// Usage: node scripts/reset-user-password.mjs <email> <newpassword>
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";

// Load .env from root directory
try {
  const env = readFileSync(new URL("../../.env", import.meta.url), "utf-8");
  env.split("\n").forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;
    const idx = clean.indexOf("=");
    if (idx === -1) return;
    const key = clean.slice(0, idx).trim();
    let val = clean.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  });
} catch (err) {
  console.warn("⚠️ Root .env file not found, using process.env directly:", err.message);
}

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: node scripts/reset-user-password.mjs <email> <newpassword>");
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters");
  process.exit(1);
}

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email } });

if (!user) {
  console.error(`No user found with email: ${email}`);
  await prisma.$disconnect();
  process.exit(1);
}

const hashed = await bcrypt.hash(newPassword, 10);
await prisma.user.update({
  where: { email },
  data: { password: hashed, isVerified: true },
});

console.log(`✅ Password reset for ${email}`);
console.log(`   New password: ${newPassword}`);
await prisma.$disconnect();
