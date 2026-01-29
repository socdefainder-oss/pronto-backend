import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here-change-in-production";

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }

    (req as any).userId = decoded.userId;
    (req as any).userRole = decoded.role;
    next();
  } catch (err) {
    console.error("Erro na autenticação admin:", err);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
