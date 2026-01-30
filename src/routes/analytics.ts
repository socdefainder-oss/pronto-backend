import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { auth, AuthedRequest } from "../middlewares/auth.js";

const router = Router();

// GET /api/analytics/:restaurantId/sales-by-day
// Retorna vendas diárias dos últimos 30 dias
router.get("/:restaurantId/sales-by-day", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;
    const { days = "30" } = req.query;

    // Verificar permissão
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: req.userId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const daysCount = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    // Buscar pedidos do período
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
        status: { notIn: ["cancelled"] },
      },
      select: {
        createdAt: true,
        totalCents: true,
      },
    });

    // Agrupar por dia
    const salesByDay: Record<string, { date: string; revenue: number; orders: number }> = {};

    for (let i = 0; i < daysCount; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      salesByDay[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (salesByDay[dateStr]) {
        salesByDay[dateStr].revenue += order.totalCents;
        salesByDay[dateStr].orders += 1;
      }
    });

    // Converter para array e ordenar
    const result = Object.values(salesByDay).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar vendas por dia:", error);
    res.status(500).json({ error: "Erro ao buscar vendas por dia" });
  }
});

// GET /api/analytics/:restaurantId/peak-hours
// Retorna horários de pico (vendas por hora do dia)
router.get("/:restaurantId/peak-hours", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;
    const { days = "30" } = req.query;

    // Verificar permissão
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: req.userId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const daysCount = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Buscar pedidos
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
        status: { notIn: ["cancelled"] },
      },
      select: {
        createdAt: true,
        totalCents: true,
      },
    });

    // Agrupar por hora (0-23)
    const hourlyStats: Record<number, { hour: number; orders: number; revenue: number }> = {};

    for (let h = 0; h < 24; h++) {
      hourlyStats[h] = { hour: h, orders: 0, revenue: 0 };
    }

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyStats[hour].orders += 1;
      hourlyStats[hour].revenue += order.totalCents;
    });

    const result = Object.values(hourlyStats);

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar horários de pico:", error);
    res.status(500).json({ error: "Erro ao buscar horários de pico" });
  }
});

// GET /api/analytics/:restaurantId/top-products
// Retorna os produtos mais vendidos
router.get("/:restaurantId/top-products", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;
    const { limit = "10", days = "30" } = req.query;

    // Verificar permissão
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: req.userId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const daysCount = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Buscar itens de pedidos
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          createdAt: { gte: startDate },
          status: { notIn: ["cancelled"] },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            categoryId: true,
          },
        },
      },
    });

    // Agrupar por produto
    const productStats: Record<string, {
      productId: string;
      productName: string;
      categoryId: string | null;
      quantity: number;
      revenue: number;
      orders: number;
    }> = {};

    orderItems.forEach((item) => {
      const key = item.productId;
      if (!productStats[key]) {
        productStats[key] = {
          productId: item.productId,
          productName: item.productName,
          categoryId: item.product?.categoryId || null,
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
      }
      productStats[key].quantity += item.quantity;
      productStats[key].revenue += item.priceCents * item.quantity;
      productStats[key].orders += 1;
    });

    // Ordenar por quantidade e limitar
    const result = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, parseInt(limit as string));

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar top produtos:", error);
    res.status(500).json({ error: "Erro ao buscar top produtos" });
  }
});

// GET /api/analytics/:restaurantId/revenue-by-category
// Retorna faturamento por categoria
router.get("/:restaurantId/revenue-by-category", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;
    const { days = "30" } = req.query;

    // Verificar permissão
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: req.userId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const daysCount = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Buscar categorias do restaurante
    const categories = await prisma.category.findMany({
      where: { restaurantId },
      select: { id: true, name: true },
    });

    // Buscar itens de pedidos com produtos
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          createdAt: { gte: startDate },
          status: { notIn: ["cancelled"] },
        },
      },
      include: {
        product: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    // Agrupar por categoria
    const categoryStats: Record<string, {
      categoryId: string | null;
      categoryName: string;
      revenue: number;
      quantity: number;
    }> = {
      uncategorized: {
        categoryId: null,
        categoryName: "Sem categoria",
        revenue: 0,
        quantity: 0,
      },
    };

    categories.forEach((cat) => {
      categoryStats[cat.id] = {
        categoryId: cat.id,
        categoryName: cat.name,
        revenue: 0,
        quantity: 0,
      };
    });

    orderItems.forEach((item) => {
      const catId = item.product?.categoryId || "uncategorized";
      if (!categoryStats[catId]) {
        categoryStats[catId] = {
          categoryId: item.product?.categoryId || null,
          categoryName: "Desconhecida",
          revenue: 0,
          quantity: 0,
        };
      }
      categoryStats[catId].revenue += item.priceCents * item.quantity;
      categoryStats[catId].quantity += item.quantity;
    });

    // Filtrar apenas categorias com vendas
    const result = Object.values(categoryStats)
      .filter((cat) => cat.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar receita por categoria:", error);
    res.status(500).json({ error: "Erro ao buscar receita por categoria" });
  }
});

// GET /api/analytics/:restaurantId/customer-insights
// Retorna insights sobre clientes (frequência, ticket, etc)
router.get("/:restaurantId/customer-insights", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;
    const { days = "30" } = req.query;

    // Verificar permissão
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: req.userId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    const daysCount = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    // Buscar pedidos com clientes
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
        status: { notIn: ["cancelled"] },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Estatísticas de clientes
    const customerStats: Record<string, {
      customerId: string;
      customerName: string;
      customerPhone: string;
      orderCount: number;
      totalSpent: number;
      averageTicket: number;
    }> = {};

    orders.forEach((order) => {
      const key = order.customerId;
      if (!customerStats[key]) {
        customerStats[key] = {
          customerId: order.customer.id,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          orderCount: 0,
          totalSpent: 0,
          averageTicket: 0,
        };
      }
      customerStats[key].orderCount += 1;
      customerStats[key].totalSpent += order.totalCents;
    });

    // Calcular ticket médio
    Object.values(customerStats).forEach((stat) => {
      stat.averageTicket = Math.round(stat.totalSpent / stat.orderCount);
    });

    // Top clientes (por total gasto)
    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Estatísticas gerais
    const totalCustomers = Object.keys(customerStats).length;
    const newCustomers = orders.filter((o) => {
      const customerOrders = orders.filter((ord) => ord.customerId === o.customerId);
      return customerOrders.length === 1;
    }).length;

    const returningCustomers = totalCustomers - newCustomers;

    const result = {
      totalCustomers,
      newCustomers,
      returningCustomers,
      topCustomers,
    };

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar insights de clientes:", error);
    res.status(500).json({ error: "Erro ao buscar insights de clientes" });
  }
});

// GET /api/analytics/:restaurantId/overview
// Retorna overview geral com múltiplas métricas
router.get("/:restaurantId/overview", auth, async (req: AuthedRequest, res) => {
  try {
    const { restaurantId } = req.params;

    // Verificar permissão
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, ownerId: req.userId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante não encontrado" });
    }

    // Últimos 30 dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Buscar todas as informações necessárias
    const [orders, products, customers] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId, createdAt: { gte: startDate } },
      }),
      prisma.product.findMany({
        where: { restaurantId },
      }),
      prisma.customer.findMany({
        where: {
          orders: {
            some: { restaurantId },
          },
        },
      }),
    ]);

    const completedOrders = orders.filter((o) => o.status === "delivered");

    const result = {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalCents, 0),
      averageTicket: orders.length > 0
        ? Math.round(orders.reduce((sum, o) => sum + o.totalCents, 0) / orders.length)
        : 0,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      totalCustomers: customers.length,
      cancellationRate: orders.length > 0
        ? Math.round((orders.filter((o) => o.status === "cancelled").length / orders.length) * 100)
        : 0,
    };

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar overview:", error);
    res.status(500).json({ error: "Erro ao buscar overview" });
  }
});

export default router;
