import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { auth, type AuthedRequest } from "../middlewares/auth.js";

export const restaurantRoutes = Router();

// Criar restaurante (dono logado)
restaurantRoutes.post("/", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    phone: z.string().min(8), // ex: 5511999999999
    description: z.string().optional(),
    address: z.string().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerId = req.userId!;
  const data = parsed.data;

  const exists = await prisma.restaurant.findUnique({ where: { slug: data.slug } });
  if (exists) return res.status(409).json({ error: "Slug já em uso" });

  const restaurant = await prisma.restaurant.create({
    data: { ...data, ownerId }
  });

  return res.json({ restaurant });
});

// Meus restaurantes
restaurantRoutes.get("/mine", auth, async (req: AuthedRequest, res) => {
  const ownerId = req.userId!;
  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
  return res.json({ restaurants });
});

// Público: pegar restaurante por slug + categorias + produtos ativos
restaurantRoutes.get("/public/:slug", async (req, res) => {
  const { slug } = req.params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: { orderBy: { sortOrder: "asc" } },
      products: { where: { isActive: true }, orderBy: { sortOrder: "asc" } }
    }
  });

  if (!restaurant) return res.status(404).json({ error: "Restaurante não encontrado" });
  return res.json({ restaurant });
});
