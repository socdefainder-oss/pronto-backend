import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { auth, AuthedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/banners/restaurant/:restaurantId - Listar banners de um restaurante (autenticado)
router.get("/restaurant/:restaurantId", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;

    // Verificar se o usuário é dono do restaurante
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: req.userId,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const banners = await prisma.banner.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    res.json(banners);
  } catch (error) {
    console.error("Erro ao listar banners:", error);
    res.status(500).json({ error: "Erro ao listar banners" });
  }
});

// GET /api/banners/public/:restaurantId/active - Listar banners ativos (público)
router.get("/public/:restaurantId/active", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        restaurantId,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    res.json(banners);
  } catch (error) {
    console.error("Erro ao listar banners públicos:", error);
    res.status(500).json({ error: "Erro ao listar banners" });
  }
});

// POST /api/banners - Criar novo banner
router.post("/", auth, async (req: AuthedRequest, res) => {
  try {
    const {
      restaurantId,
      title,
      description,
      imageUrl,
      linkUrl,
      backgroundColor,
      textColor,
      position,
      sortOrder,
      startDate,
      endDate,
    } = req.body;

    // Validações
    if (!restaurantId || !title) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    // Verificar se o usuário é dono do restaurante
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: req.userId,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const banner = await prisma.banner.create({
      data: {
        restaurantId,
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        backgroundColor: backgroundColor || "#10b981",
        textColor: textColor || "#ffffff",
        position: position || "top",
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Erro ao criar banner:", error);
    res.status(500).json({ error: "Erro ao criar banner" });
  }
});

// PUT /api/banners/:id - Atualizar banner
router.put("/:id", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      backgroundColor,
      textColor,
      position,
      sortOrder,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Verificar se o banner existe e o usuário é dono
    const existingBanner = await prisma.banner.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId,
        },
      },
    });

    if (!existingBanner) {
      return res.status(404).json({ error: "Banner não encontrado" });
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(textColor !== undefined && { textColor }),
        ...(position !== undefined && { position }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(banner);
  } catch (error) {
    console.error("Erro ao atualizar banner:", error);
    res.status(500).json({ error: "Erro ao atualizar banner" });
  }
});

// DELETE /api/banners/:id - Deletar banner
router.delete("/:id", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se o banner existe e o usuário é dono
    const existingBanner = await prisma.banner.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId,
        },
      },
    });

    if (!existingBanner) {
      return res.status(404).json({ error: "Banner não encontrado" });
    }

    await prisma.banner.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar banner:", error);
    res.status(500).json({ error: "Erro ao deletar banner" });
  }
});

export default router;
