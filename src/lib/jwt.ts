import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;
if (!secret) throw new Error("JWT_SECRET ausente");

export function signToken(payload: { userId: string }) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret) as { userId: string; iat: number; exp: number };
}
