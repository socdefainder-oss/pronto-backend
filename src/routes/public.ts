import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const publicRoutes = Router();

/**
 * GET /api/public/restaurants/:slug
 * Retorna dados públicos do restaurante pelo slug COM PRODUTOS E CATEGORIAS.
 */
publicRoutes.get("/restaurants/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({ error: "Slug é obrigatório" });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { createdAt: "asc" },
          include: {
            products: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" }
            }
          }
        },
        products: {
          where: { 
            isActive: true,
            categoryId: null 
          },
          orderBy: { sortOrder: "asc" }
        }
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    // Reorganiza os dados para facilitar no frontend
    const response = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      phone: restaurant.phone,
      description: restaurant.description,
      slogan: restaurant.slogan,
      address: restaurant.address,
      logoUrl: restaurant.logoUrl,
      cnpj: restaurant.cnpj,
      email: restaurant.email,
      openingHours: restaurant.openingHours,
      deliveryFee: restaurant.deliveryFee,
      minimumOrder: restaurant.minimumOrder,
      estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
      acceptsCard: restaurant.acceptsCard,
      acceptsPix: restaurant.acceptsPix,
      acceptsCash: restaurant.acceptsCash,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
      categories: restaurant.categories.map((cat: typeof restaurant.categories[number]) => ({
        id: cat.id,
        name: cat.name,
        sortOrder: cat.sortOrder,
        products: cat.products.map((p: typeof cat.products[number]) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.priceCents / 100, // Converte centavos para reais
          priceCents: p.priceCents,
          imageUrl: p.imageUrl,
          isActive: p.isActive
        }))
      })),
      productsWithoutCategory: restaurant.products.map((p: typeof restaurant.products[number]) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.priceCents / 100,
        priceCents: p.priceCents,
        imageUrl: p.imageUrl,
        isActive: p.isActive
      }))
    };

    return res.json(response);
  } catch (err) {
    console.error("GET /api/public/restaurants/:slug error", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/public/health
 * Health check público
 */
publicRoutes.get("/health", (_req, res) => {
  return res.json({ status: "ok", service: "pronto-public-api" });
});