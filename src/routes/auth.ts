import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { supabase } from "../lib/supabase.js";

export const authRoutes = Router();

/**
 * POST /api/auth/register-with-email
 * Registra usuário e envia email de confirmação via Supabase Auth
 */
authRoutes.post("/register-with-email", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;

  try {
    // Verifica se já existe no Prisma
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    // Se Supabase Auth estiver configurado, usa email verification
    if (supabase) {
      // Registra no Supabase Auth (envia email automaticamente)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${process.env.FRONTEND_URL || 'https://pronto-frontend-rust.vercel.app'}/auth/verify`,
        }
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        return res.status(400).json({ error: authError.message });
      }

      if (!authData.user) {
        return res.status(500).json({ error: 'Falha ao criar usuário' });
      }

      // Hash da senha para o banco
      const hash = await bcrypt.hash(password, 10);

      // Cria no Prisma com isActive=false até confirmar email
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
          isActive: false, // Só ativa após confirmar email
        }
      });

      return res.json({
        message: 'Cadastro realizado! Verifique seu email para confirmar.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          needsEmailVerification: true
        }
      });
    } else {
      // Fallback: registro sem email verification (quando Supabase não está configurado)
      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hash }
      });

      const token = signToken({ userId: user.id });
      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

/**
 * POST /api/auth/verify-email
 * Confirma o email após o usuário clicar no link
 */
authRoutes.post("/verify-email", async (req, res) => {
  const schema = z.object({
    token: z.string(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Token inválido' });
  }

  try {
    if (!supabase) {
      return res.status(400).json({ error: 'Email verification não disponível' });
    }

    // Verifica o token no Supabase
    const { data: { user }, error } = await supabase.auth.getUser(parsed.data.token);

    if (error || !user?.email) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Ativa o usuário no Prisma
    const updatedUser = await prisma.user.update({
      where: { email: user.email },
      data: { isActive: true }
    });

    // Gera token JWT para login automático
    const token = signToken({ userId: updatedUser.id, role: updatedUser.role });

    return res.json({
      message: 'Email verificado com sucesso!',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ error: 'Erro ao verificar email' });
  }
});

/**
 * POST /api/auth/register (mantido para compatibilidade)
 * Registro sem confirmação de email
 */
authRoutes.post("/register", async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "E-mail já cadastrado" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hash } });

  const token = signToken({ userId: user.id });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

authRoutes.post("/login", async (req, res) => {
  const schema = z.object({
    email: z.string().min(1),
    password: z.string().min(1)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
  
  if (!user.isActive) return res.status(403).json({ error: "Conta não verificada. Verifique seu email." });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

  const token = signToken({ userId: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
