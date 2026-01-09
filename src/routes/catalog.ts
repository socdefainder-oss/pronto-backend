import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { auth, type AuthedRequest } from "../middlewares/auth.js";

export const catalogRoutes = Router();

// categorias
catalogRoutes.post("/categories", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    restaurantId: z.string().min(1),
    name: z.string().min(1),
    sortOrder: z.number().int().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // garante que o restaurante é do user
  const r = await prisma.restaurant.findFirst({
    where: { id: parsed.data.restaurantId, ownerId: req.userId! }
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const category = await prisma.category.create({
    data: {
      restaurantId: parsed.data.restaurantId,
      name: parsed.data.name,
      sortOrder: parsed.data.sortOrder ?? 0
    }
  });

  return res.json({ category });
});

catalogRoutes.get("/categories/:restaurantId", auth, async (req: AuthedRequest, res) => {
  const { restaurantId } = req.params;

  const r = await prisma.restaurant.findFirst({ where: { id: restaurantId, ownerId: req.userId! } });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const categories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" }
  });
  return res.json({ categories });
});

// produtos
catalogRoutes.post("/products", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    restaurantId: z.string().min(1),
    categoryId: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    priceCents: z.number().int().min(0),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const r = await prisma.restaurant.findFirst({
    where: { id: parsed.data.restaurantId, ownerId: req.userId! }
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0
    }
  });

  return res.json({ product });
});

catalogRoutes.get("/products/:restaurantId", auth, async (req: AuthedRequest, res) => {
  const { restaurantId } = req.params;

  const r = await prisma.restaurant.findFirst({ where: { id: restaurantId, ownerId: req.userId! } });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const products = await prisma.product.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" }
  });
  return res.json({ products });
});

catalogRoutes.patch("/products/:id", auth, async (req: AuthedRequest, res) => {
  const { id } = req.params;

  const schema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    priceCents: z.number().int().min(0).optional(),
    imageUrl: z.string().url().optional().nullable(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().optional().nullable()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // checa permissão via restaurante do produto
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });

  const r = await prisma.restaurant.findFirst({
    where: { id: product.restaurantId, ownerId: req.userId! }
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const updated = await prisma.product.update({ where: { id }, data: parsed.data });
  return res.json({ product: updated });
});

catalogRoutes.delete("/products/:id", auth, async (req: AuthedRequest, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });

  const r = await prisma.restaurant.findFirst({
    where: { id: product.restaurantId, ownerId: req.userId! }
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  await prisma.product.delete({ where: { id } });
  return res.json({ ok: true });
});
