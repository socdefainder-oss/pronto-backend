import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middlewares/adminAuth.js";

export const adminRoutes = Router();

// Listar todos os restaurantes
adminRoutes.get("/restaurants", adminAuth, async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ restaurants });
  } catch (err: any) {
    console.error("Erro ao listar restaurantes:", err);
    return res.status(500).json({ error: "Erro ao listar restaurantes" });
  }
});

// Ativar restaurante
adminRoutes.patch("/restaurants/:id/activate", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { isActive: true }
    });

    return res.json({ restaurant, message: "Restaurante ativado com sucesso" });
  } catch (err: any) {
    console.error("Erro ao ativar restaurante:", err);
    return res.status(500).json({ error: "Erro ao ativar restaurante" });
  }
});

// Bloquear restaurante
adminRoutes.patch("/restaurants/:id/block", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { isActive: false }
    });

    return res.json({ restaurant, message: "Restaurante bloqueado com sucesso" });
  } catch (err: any) {
    console.error("Erro ao bloquear restaurante:", err);
    return res.status(500).json({ error: "Erro ao bloquear restaurante" });
  }
});

// Remover restaurante
adminRoutes.delete("/restaurants/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.restaurant.delete({ where: { id } });

    return res.json({ message: "Restaurante removido com sucesso" });
  } catch (err: any) {
    console.error("Erro ao remover restaurante:", err);
    return res.status(500).json({ error: "Erro ao remover restaurante" });
  }
});

// Listar todos os usuários
adminRoutes.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { restaurants: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ users });
  } catch (err: any) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// Ativar usuário
adminRoutes.patch("/users/:id/activate", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: { id: true, name: true, email: true, isActive: true }
    });

    return res.json({ user, message: "Usuário ativado com sucesso" });
  } catch (err: any) {
    console.error("Erro ao ativar usuário:", err);
    return res.status(500).json({ error: "Erro ao ativar usuário" });
  }
});

// Bloquear usuário
adminRoutes.patch("/users/:id/block", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true }
    });

    return res.json({ user, message: "Usuário bloqueado com sucesso" });
  } catch (err: any) {
    console.error("Erro ao bloquear usuário:", err);
    return res.status(500).json({ error: "Erro ao bloquear usuário" });
  }
});

// Remover usuário
adminRoutes.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Não permitir remover o próprio admin
    if (id === (req as any).userId) {
      return res.status(400).json({ error: "Você não pode remover sua própria conta" });
    }
    
    await prisma.user.delete({ where: { id } });

    return res.json({ message: "Usuário removido com sucesso" });
  } catch (err: any) {
    console.error("Erro ao remover usuário:", err);
    return res.status(500).json({ error: "Erro ao remover usuário" });
  }
});
