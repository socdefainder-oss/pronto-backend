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
  
  console.log("[GET /restaurants/:id] Restaurant fetched:", {
    id: restaurant.id,
    name: restaurant.name,
    logoUrl: restaurant.logoUrl,
    hasLogoUrl: !!restaurant.logoUrl
  });

  return res.json(restaurant);
});

// ========== ATUALIZAR RESTAURANTE ==========
restaurantRoutes.patch("/:id", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    phone: z.string().min(8).optional(),
    description: z.string().optional().nullable(),
    slogan: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    cnpj: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    openingHours: z.string().optional().nullable(),
    deliveryFee: z.number().int().min(0).optional().nullable(),
    minimumOrder: z.number().int().min(0).optional().nullable(),
    estimatedDeliveryTime: z.string().optional().nullable(),
    acceptsCard: z.boolean().optional(),
    acceptsPix: z.boolean().optional(),
    acceptsCash: z.boolean().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    console.error("[PATCH /restaurants/:id] Validation failed:", parsed.error.flatten());
    
    // Retorna erro formatado de forma mais amigável
    const errors = parsed.error.flatten();
    const fieldErrorKeys = Object.keys(errors.fieldErrors);
    const firstFieldKey = fieldErrorKeys[0];
    const firstFieldError = firstFieldKey ? (errors.fieldErrors as any)[firstFieldKey]?.[0] : undefined;
    const errorMessage = firstFieldError || "Dados inválidos";
    
    return res.status(400).json({ error: errorMessage, details: errors });
  }

  const ownerId = req.userId!;
  const { id } = req.params;
  const data = parsed.data;
  
  console.log("[PATCH /restaurants/:id] Updating restaurant:", {
    id,
    ownerId,
    logoUrl: data.logoUrl,
    hasLogoUrl: !!data.logoUrl
  });

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
  
  console.log("[PATCH /restaurants/:id] Restaurant updated:", {
    id: updated.id,
    name: updated.name,
    logoUrl: updated.logoUrl
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