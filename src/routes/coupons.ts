import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { auth, AuthedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/coupons/restaurant/:restaurantId - Listar cupons de um restaurante
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

    const coupons = await prisma.coupon.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
    });

    res.json(coupons);
  } catch (error) {
    console.error("Erro ao listar cupons:", error);
    res.status(500).json({ error: "Erro ao listar cupons" });
  }
});

// POST /api/coupons - Criar novo cupom
router.post("/", auth, async (req: AuthedRequest, res) => {
  try {
    const {
      restaurantId,
      code,
      type,
      value,
      minOrderCents,
      maxUses,
      startDate,
      endDate,
    } = req.body;

    // Validações
    if (!restaurantId || !code || !type || !value) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    if (type !== "percentage" && type !== "fixed") {
      return res.status(400).json({ error: "Tipo inválido. Use 'percentage' ou 'fixed'" });
    }

    if (type === "percentage" && (value < 1 || value > 100)) {
      return res.status(400).json({ error: "Percentual deve estar entre 1 e 100" });
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

    // Verificar se o código já existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        restaurantId_code: {
          restaurantId,
          code: code.toUpperCase(),
        },
      },
    });

    if (existingCoupon) {
      return res.status(400).json({ error: "Código de cupom já existe" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        restaurantId,
        code: code.toUpperCase(),
        type,
        value: parseInt(value),
        minOrderCents: minOrderCents ? parseInt(minOrderCents) : 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    res.status(500).json({ error: "Erro ao criar cupom" });
  }
});

// PUT /api/coupons/:id - Atualizar cupom
router.put("/:id", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      minOrderCents,
      maxUses,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Verificar se o cupom existe e o usuário é dono
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId,
        },
      },
    });

    if (!existingCoupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    // Se está mudando o código, verificar se não há duplicata
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: {
          restaurantId_code: {
            restaurantId: existingCoupon.restaurantId,
            code: code.toUpperCase(),
          },
        },
      });

      if (duplicateCoupon) {
        return res.status(400).json({ error: "Código de cupom já existe" });
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(type && { type }),
        ...(value !== undefined && { value: parseInt(value) }),
        ...(minOrderCents !== undefined && { minOrderCents: parseInt(minOrderCents) }),
        ...(maxUses !== undefined && { maxUses: maxUses ? parseInt(maxUses) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(coupon);
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    res.status(500).json({ error: "Erro ao atualizar cupom" });
  }
});

// DELETE /api/coupons/:id - Deletar cupom
router.delete("/:id", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cupom existe e o usuário é dono
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId,
        },
      },
    });

    if (!existingCoupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar cupom:", error);
    res.status(500).json({ error: "Erro ao deletar cupom" });
  }
});

// POST /api/coupons/validate - Validar cupom (público - usado no checkout)
router.post("/validate", async (req, res) => {
  try {
    const { code, restaurantId, orderValueCents } = req.body;

    if (!code || !restaurantId || !orderValueCents) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        restaurantId_code: {
          restaurantId,
          code: code.toUpperCase(),
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    // Validações
    if (!coupon.isActive) {
      return res.status(400).json({ error: "Cupom inativo" });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return res.status(400).json({ error: "Cupom ainda não está ativo" });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return res.status(400).json({ error: "Cupom expirado" });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: "Cupom atingiu limite de usos" });
    }

    if (orderValueCents < coupon.minOrderCents) {
      return res.status(400).json({
        error: `Valor mínimo do pedido: R$ ${(coupon.minOrderCents / 100).toFixed(2)}`,
      });
    }

    // Calcular desconto
    let discountCents = 0;
    if (coupon.type === "percentage") {
      discountCents = Math.floor((orderValueCents * coupon.value) / 100);
    } else {
      discountCents = coupon.value;
    }

    // Garantir que o desconto não seja maior que o valor do pedido
    if (discountCents > orderValueCents) {
      discountCents = orderValueCents;
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discountCents,
      finalValueCents: orderValueCents - discountCents,
    });
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    res.status(500).json({ error: "Erro ao validar cupom" });
  }
});

export default router;
