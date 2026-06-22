import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export function getUserFromToken(): { userId: string; email: string } | null {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export function getAdminFromToken(): { adminId: string; email: string; role: string } | null {
  try {
    const token = cookies().get("adminToken")?.value;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!) as { adminId: string; email: string; role: string };
  } catch {
    return null;
  }
}
