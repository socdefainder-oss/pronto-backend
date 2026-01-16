import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { auth, type AuthedRequest } from "../middlewares/auth.js";

export const restaurantRoutes = Router();

// ========== CRIAÇÃO ==========
restaurantRoutes.post("/", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    phone: z.string().min(8),
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

// ========== LISTAR MEUS RESTAURANTES ==========
restaurantRoutes.get("/mine", auth, async (req: AuthedRequest, res) => {
  const ownerId = req.userId!;
  const restaurants = await prisma.restaurant.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
  return res.json({ restaurants });
});

// ========== PEGAR RESTAURANTE POR ID (PRIVADO) ==========
restaurantRoutes.get("/:id", auth, async (req: AuthedRequest, res) => {
  const ownerId = req.userId!;
  const { id } = req.params;

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id: id,
      ownerId: ownerId,
    },
  });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurante não encontrado ou não pertence a você" });
  }

  return res.json(restaurant);
});

// ========== ATUALIZAR RESTAURANTE ==========
restaurantRoutes.patch("/:id", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    phone: z.string().min(8).optional(),
    description: z.string().optional(),
    slogan: z.string().optional(),
    address: z.string().optional(),
    logoUrl: z.string().url().optional().or(z.literal("")),
    cnpj: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    openingHours: z.string().optional(),
    deliveryFee: z.number().int().min(0).optional().or(z.null()),
    minimumOrder: z.number().int().min(0).optional().or(z.null()),
    estimatedDeliveryTime: z.string().optional(),
    acceptsCard: z.boolean().optional(),
    acceptsPix: z.boolean().optional(),
    acceptsCash: z.boolean().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerId = req.userId!;
  const { id } = req.params;
  const data = parsed.data;

  // Verifica se restaurante existe e pertence ao usuário
  const restaurant = await prisma.restaurant.findFirst({
    where: { id, ownerId },
  });

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurante não encontrado" });
  }

  // Se slug foi alterado, verifica se já existe
  if (data.slug && data.slug !== restaurant.slug) {
    const slugExists = await prisma.restaurant.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists) return res.status(409).json({ error: "Slug já em uso" });
  }

  // Atualiza
  const updated = await prisma.restaurant.update({
    where: { id },
    data,
  });

  return res.json(updated);
});

// ========== PÚBLICO: PEGAR RESTAURANTE POR SLUG ==========
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