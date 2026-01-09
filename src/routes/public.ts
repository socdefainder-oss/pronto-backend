import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const publicRoutes = Router();

/**
 * GET /api/public/restaurants/:slug
 * Retorna dados públicos do restaurante pelo slug.
 */
publicRoutes.get("/restaurants/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({ error: "Slug is required" });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        description: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    return res.json(restaurant);
  } catch (err) {
    console.error("GET /api/public/restaurants/:slug error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
