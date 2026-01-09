import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.js";

export type AuthedRequest = Request & { userId?: string };

export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  const token = header.replace("Bearer ", "");
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
