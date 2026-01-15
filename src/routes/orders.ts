import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { auth, AuthedRequest } from "../middlewares/auth";

const ordersRoutes = Router();

// Criar novo pedido (público - não precisa autenticação)
ordersRoutes.post("/", async (req: AuthedRequest, res: Response) => {
  try {
    const {
      restaurantId,
      customer,
      address,
      items,
      paymentMethod,
      notes,
      deliveryFeeCents = 0,
      couponCode,
    } = req.body;

    // Validações básicas
    if (!restaurantId || !customer || !items || items.length === 0) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Buscar ou criar cliente
    let existingCustomer = await prisma.customer.findFirst({
      where: { phone: customer.phone },
    });

    if (!existingCustomer) {
      existingCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        },
      });
    }

    // Criar endereço se fornecido
    let customerAddress = null;
    if (address) {
      customerAddress = await prisma.customerAddress.create({
        data: {
          customerId: existingCustomer.id,
          street: address.street,
          number: address.number,
          complement: address.complement,
          district: address.district,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          isDefault: false,
        },
      });
    }

    // Buscar último número de pedido do restaurante
    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId },
      orderBy: { orderNumber: "desc" },
    });
    const orderNumber = (lastOrder?.orderNumber || 0) + 1;

    // Buscar produtos para validar preços
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        restaurantId,
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Produto(s) inválido(s)" });
    }

    // Calcular total e preparar itens
    let subtotalCents = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Produto não encontrado");

      const itemTotal = product.priceCents * item.quantity;
      subtotalCents += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        priceCents: product.priceCents,
        quantity: item.quantity,
        notes: item.notes,
      };
    });

    // Validar e aplicar cupom se fornecido
    let couponId = null;
    let discountCents = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: {
          restaurantId_code: {
            restaurantId,
            code: couponCode.toUpperCase(),
          },
        },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isDateValid = 
          (!coupon.startDate || now >= coupon.startDate) &&
          (!coupon.endDate || now <= coupon.endDate);
        
        const isUsageValid = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        const isMinOrderValid = subtotalCents >= coupon.minOrderCents;

        if (isDateValid && isUsageValid && isMinOrderValid) {
          couponId = coupon.id;
          
          if (coupon.type === "percentage") {
            discountCents = Math.floor((subtotalCents * coupon.value) / 100);
          } else {
            discountCents = coupon.value;
          }

          // Garantir que desconto não seja maior que subtotal
          if (discountCents > subtotalCents) {
            discountCents = subtotalCents;
          }

          // Incrementar contador de uso do cupom
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const totalCents = subtotalCents - discountCents + deliveryFeeCents;

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        restaurantId,
        customerId: existingCustomer.id,
        addressId: customerAddress?.id,
        couponId,
        orderNumber,
        subtotalCents,
        discountCents,
        totalCents,
        deliveryFeeCents,
        paymentMethod,
        notes,
        status: "pending",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        customer: true,
        address: true,
        coupon: true,
      },
    });

    return res.status(201).json(order);
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    return res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

// Listar pedidos de um restaurante (requer autenticação)
ordersRoutes.get("/restaurant/:restaurantId", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { status, page = "1", limit = "20" } = req.query;

    // Verificar se o usuário é dono do restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { restaurantId };

    if (status && typeof status === "string") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          address: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Erro ao listar pedidos:", error);
    return res.status(500).json({ error: "Erro ao listar pedidos" });
  }
});

// Buscar pedido específico
ordersRoutes.get("/:orderId", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        address: true,
        restaurant: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar se o usuário é dono do restaurante
    if (order.restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    return res.json(order);
  } catch (error: any) {
    console.error("Erro ao buscar pedido:", error);
    return res.status(500).json({ error: "Erro ao buscar pedido" });
  }
});

// Atualizar status do pedido
ordersRoutes.put("/:orderId/status", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivering",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar se o usuário é dono do restaurante
    if (order.restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
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
  } catch (error: any) {
    console.error("Erro ao atualizar pedido:", error);
    return res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
});

// Atualizar status de pagamento
ordersRoutes.put("/:orderId/payment", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ["pending", "paid", "failed"];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Status de pagamento inválido" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar se o usuário é dono do restaurante
    if (order.restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: {
        items: true,
        customer: true,
        address: true,
      },
    });

    return res.json(updatedOrder);
  } catch (error: any) {
    console.error("Erro ao atualizar pagamento:", error);
    return res.status(500).json({ error: "Erro ao atualizar pagamento" });
  }
});

// Estatísticas de pedidos
ordersRoutes.get("/restaurant/:restaurantId/stats", auth, async (req: AuthedRequest, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { period = "today" } = req.query; // today, week, month

    // Verificar se o usuário é dono do restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== req.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
      },
      include: {
        items: true,
      },
    });

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalCents, 0),
      averageTicket: orders.length > 0 
        ? Math.round(orders.reduce((sum, order) => sum + order.totalCents, 0) / orders.length)
        : 0,
      byStatus: {
        pending: orders.filter((o) => o.status === "pending").length,
        confirmed: orders.filter((o) => o.status === "confirmed").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        ready: orders.filter((o) => o.status === "ready").length,
        delivering: orders.filter((o) => o.status === "delivering").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
      },
      byPaymentStatus: {
        pending: orders.filter((o) => o.paymentStatus === "pending").length,
        paid: orders.filter((o) => o.paymentStatus === "paid").length,
        failed: orders.filter((o) => o.paymentStatus === "failed").length,
      },
    };

    return res.json(stats);
  } catch (error: any) {
    console.error("Erro ao buscar estatísticas:", error);
    return res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

export { ordersRoutes };
