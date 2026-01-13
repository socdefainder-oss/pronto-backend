import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { auth, type AuthedRequest } from "../middlewares/auth.js";

export const catalogRoutes = Router();

// ========== CATEGORIAS ==========

// Criar categoria
catalogRoutes.post("/categories", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    restaurantId: z.string().min(1),
    name: z.string().min(1),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Garante que o restaurante é do user
  const r = await prisma.restaurant.findFirst({
    where: { id: parsed.data.restaurantId, ownerId: req.userId! }
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const category = await prisma.category.create({
    data: {
      restaurantId: parsed.data.restaurantId,
      name: parsed.data.name,
      sortOrder: parsed.data.sortOrder ?? 0,
      isActive: parsed.data.isActive ?? true
    }
  });

  return res.json({ category });
});

// Listar categorias do restaurante
catalogRoutes.get("/categories/:restaurantId", auth, async (req: AuthedRequest, res) => {
  const { restaurantId } = req.params;

  const r = await prisma.restaurant.findFirst({ 
    where: { id: restaurantId, ownerId: req.userId! } 
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const categories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
  
  return res.json({ 
    categories: categories.map((cat: typeof categories[number]) => ({
      ...cat,
      productCount: cat._count.products
    }))
  });
});

// Atualizar categoria
catalogRoutes.patch("/categories/:id", auth, async (req: AuthedRequest, res) => {
  const { id } = req.params;

  const schema = z.object({
    name: z.string().min(1).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const category = await prisma.category.findUnique({ 
    where: { id },
    include: {
      restaurant: true
    }
  });
  
  if (!category) return res.status(404).json({ error: "Categoria não encontrada" });

  // Verifica permissão via restaurante
  if (category.restaurant.ownerId !== req.userId!) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  return res.json({ category: updated });
});

// Deletar categoria
catalogRoutes.delete("/categories/:id", auth, async (req: AuthedRequest, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({ 
    where: { id },
    include: { 
      restaurant: true,
      products: true
    }
  });
  
  if (!category) return res.status(404).json({ error: "Categoria não encontrada" });

  // Verifica permissão via restaurante
  if (category.restaurant.ownerId !== req.userId!) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  // Não permite excluir se houver produtos
  if (category.products.length > 0) {
    return res.status(400).json({ 
      error: "Não é possível excluir categorias com produtos. Mova os produtos primeiro." 
    });
  }

  await prisma.category.delete({ where: { id } });
  return res.json({ message: "Categoria excluída com sucesso" });
});

// ========== PRODUTOS ==========

// Criar produto
catalogRoutes.post("/products", auth, async (req: AuthedRequest, res) => {
  const schema = z.object({
    restaurantId: z.string().min(1),
    categoryId: z.string().optional().nullable(),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    priceCents: z.number().int().min(0),
    imageUrl: z.string().optional().nullable(), // REMOVIDO: .url()
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const r = await prisma.restaurant.findFirst({
    where: { id: parsed.data.restaurantId, ownerId: req.userId! }
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  // Se tiver categoryId, verifica se a categoria pertence ao restaurante
  if (parsed.data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { 
        id: parsed.data.categoryId,
        restaurantId: parsed.data.restaurantId
      }
    });
    if (!category) {
      return res.status(400).json({ error: "Categoria não encontrada ou não pertence a este restaurante" });
    }
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0
    },
    include: {
      category: true
    }
  });

  return res.json({ product });
});

// Listar produtos do restaurante
catalogRoutes.get("/products/:restaurantId", auth, async (req: AuthedRequest, res) => {
  const { restaurantId } = req.params;

  const r = await prisma.restaurant.findFirst({ 
    where: { id: restaurantId, ownerId: req.userId! } 
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const products = await prisma.product.findMany({
    where: { restaurantId },
    include: {
      category: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
  
  return res.json({ products });
});

// Atualizar produto
catalogRoutes.patch("/products/:id", auth, async (req: AuthedRequest, res) => {
  const { id } = req.params;

  const schema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    priceCents: z.number().int().min(0).optional(),
    imageUrl: z.string().optional().nullable(), // REMOVIDO: .url()
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().optional().nullable()
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Checa permissão via restaurante do produto
  const product = await prisma.product.findUnique({ 
    where: { id },
    include: {
      restaurant: true
    }
  });
  
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });

  if (product.restaurant.ownerId !== req.userId!) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  // Se tiver categoryId, verifica se a categoria pertence ao restaurante
  if (parsed.data.categoryId && parsed.data.categoryId !== product.categoryId) {
    const category = await prisma.category.findFirst({
      where: { 
        id: parsed.data.categoryId,
        restaurantId: product.restaurantId
      }
    });
    if (!category) {
      return res.status(400).json({ error: "Categoria não encontrada ou não pertence a este restaurante" });
    }
  }

  const updated = await prisma.product.update({ 
    where: { id }, 
    data: parsed.data,
    include: {
      category: true
    }
  });
  
  return res.json({ product: updated });
});

// Deletar produto
catalogRoutes.delete("/products/:id", auth, async (req: AuthedRequest, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ 
    where: { id },
    include: {
      restaurant: true
    }
  });
  
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });

  if (product.restaurant.ownerId !== req.userId!) {
    return res.status(403).json({ error: "Sem permissão" });
  }

  await prisma.product.delete({ where: { id } });
  return res.json({ message: "Produto excluído com sucesso" });
});

// ========== ESTATÍSTICAS ==========

// Estatísticas do cardápio
catalogRoutes.get("/stats/:restaurantId", auth, async (req: AuthedRequest, res) => {
  const { restaurantId } = req.params;

  const r = await prisma.restaurant.findFirst({ 
    where: { id: restaurantId, ownerId: req.userId! } 
  });
  if (!r) return res.status(403).json({ error: "Sem permissão" });

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId },
      select: { 
        id: true,
        isActive: true,
        _count: { select: { products: true } }
      }
    }),
    prisma.product.findMany({
      where: { restaurantId },
      select: { isActive: true }
    })
  ]);

  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c: typeof categories[number]) => c.isActive).length,
    totalProducts: products.length,
    activeProducts: products.filter((p: typeof products[number]) => p.isActive).length,
    productsByCategory: categories.map((cat: typeof categories[number]) => ({
      categoryId: cat.id,
      productCount: cat._count.products
    }))
  };

  return res.json({ stats });
});