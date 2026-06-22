import { PrismaClient } from "@prisma/client";
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

const prisma = new PrismaClient();
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, isVerified: true, createdAt: true }
});

console.log("=== Users in DB ===");
users.forEach(u => {
  console.log(`  Email: ${u.email}`);
  console.log(`  Name: ${u.name}`);
  console.log(`  Verified: ${u.isVerified}`);
  console.log(`  Created: ${u.createdAt}`);
  console.log("  ---");
});
console.log(`Total users: ${users.length}`);
await prisma.$disconnect();
