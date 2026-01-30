import { Router } from "express";
import { prisma } from "../lib/prisma";
import { auth, type AuthedRequest } from "../middlewares/auth";

const router = Router();

// Obter pedidos da cozinha de um restaurante
router.get("/:restaurantId/orders", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, category } = req.query;

    // Verificar acesso ao restaurante
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: req.userId!,
      },
    });

    if (!restaurant) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Buscar pedidos em preparação (pending, confirmed, preparing, ready)
    const statusFilter = status
      ? { status: status as string }
      : {
          status: {
            in: ["pending", "confirmed", "preparing", "ready"],
          },
        };

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        ...statusFilter,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        address: {
          select: {
            id: true,
            street: true,
            number: true,
            district: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" }, // Urgentes primeiro
        { createdAt: "asc" }, // Mais antigos primeiro
      ],
    });

    // Filtrar por categoria se solicitado
    let filteredOrders = orders;
    if (category && typeof category === 'string') {
      filteredOrders = orders.filter((order) =>
        order.items.some((item) => 
          item.product.category?.id === category || 
          item.product.category?.name === category
        )
      );
    }

    return res.json(filteredOrders);
  } catch (error) {
    console.error("Erro ao buscar pedidos da cozinha:", error);
    return res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

// Atualizar status de um pedido
router.patch("/orders/:id/status", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar se o pedido pertence ao usuário
    const order = await prisma.order.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId!,
        },
      },
    });

    if (!order) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Atualizar timestamps baseado no status
    const updateData: any = { status };

    if (status === "preparing" && !order.prepStartedAt) {
      updateData.prepStartedAt = new Date();
    }

    if (status === "ready" && !order.readyAt) {
      updateData.readyAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        address: true,
      },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
});

// Atualizar prioridade de um pedido
router.patch("/orders/:id/priority", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    // Verificar se o pedido pertence ao usuário
    const order = await prisma.order.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId!,
        },
      },
    });

    if (!order) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { priority },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar prioridade:", error);
    return res.status(500).json({ error: "Erro ao atualizar prioridade" });
  }
});

// Atualizar observações da cozinha
router.patch("/orders/:id/notes", auth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { kitchenNotes } = req.body;

    // Verificar se o pedido pertence ao usuário
    const order = await prisma.order.findFirst({
      where: {
        id,
        restaurant: {
          ownerId: req.userId!,
        },
      },
    });

    if (!order) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { kitchenNotes },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar observações:", error);
    return res.status(500).json({ error: "Erro ao atualizar observações" });
  }
});

// Obter estatísticas da cozinha
router.get("/:restaurantId/stats", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;

    // Verificar acesso ao restaurante
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: req.userId!,
      },
    });

    if (!restaurant) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Contar pedidos por status (apenas ativos)
    const [pending, confirmed, preparing, ready] = await Promise.all([
      prisma.order.count({
        where: { restaurantId, status: "pending" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "confirmed" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "preparing" },
      }),
      prisma.order.count({
        where: { restaurantId, status: "ready" },
      }),
    ]);

    // Calcular tempo médio de preparo (pedidos finalizados hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { in: ["ready", "delivering", "delivered"] },
        prepStartedAt: { not: null },
        readyAt: { not: null },
        createdAt: { gte: today },
      },
      select: {
        prepStartedAt: true,
        readyAt: true,
      },
    });

    let averagePrepTimeMinutes = 0;
    if (completedOrders.length > 0) {
      const totalMinutes = completedOrders.reduce((sum, order) => {
        if (order.prepStartedAt && order.readyAt) {
          const diff = order.readyAt.getTime() - order.prepStartedAt.getTime();
          return sum + diff / 1000 / 60; // converter para minutos
        }
        return sum;
      }, 0);
      averagePrepTimeMinutes = Math.round(totalMinutes / completedOrders.length);
    }

    // Total de pedidos hoje
    const todayTotal = await prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: today },
      },
    });

    return res.json({
      pending,
      confirmed,
      preparing,
      ready,
      total: pending + confirmed + preparing + ready,
      averagePrepTimeMinutes,
      todayTotal,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

export default router;
