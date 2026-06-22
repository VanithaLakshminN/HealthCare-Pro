import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
  admin?: { adminId: string; email: string; role: string };
}

export function requireUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

export function optionalUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.user = decoded;
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.adminToken;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No admin token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; email: string; role: string };
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid admin token" });
  }
}
