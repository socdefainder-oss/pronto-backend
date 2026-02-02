import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { mercadopago } from "../lib/mercadopago.js";

export const paymentRoutes = Router();

// Criar preferência de pagamento (PIX ou cartão)
paymentRoutes.post("/create", async (req, res) => {
  const schema = z.object({
    orderId: z.string(),
    paymentMethod: z.enum(['pix', 'credit_card']).optional().default('pix'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { orderId, paymentMethod } = parsed.data;

  try {
    // Buscar pedido
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        restaurant: true,
        customer: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Criar preferência no Mercado Pago
    const preference = {
      items: order.items.map(item => ({
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.priceCents / 100,
        currency_id: 'BRL',
      })),
      payer: {
        name: order.customer.name,
        email: order.customer.email || 'cliente@pronto.app',
        phone: {
          number: order.customer.phone || '',
        },
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        failure: `${process.env.FRONTEND_URL}/payment/failure?order_id=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?order_id=${orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      external_reference: orderId,
      payment_methods: {
        excluded_payment_types: paymentMethod === 'pix' ? [{ id: 'credit_card' }, { id: 'debit_card' }] : [],
        installments: 1,
      },
    };

    const response = await mercadopago.preferences.create(preference);

    // Atualizar pedido com preference_id
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: response.body.id,
        paymentStatus: 'pending',
      },
    });

    return res.json({
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      sandboxInitPoint: response.body.sandbox_init_point,
    });
  } catch (error: any) {
    console.error("[CREATE PAYMENT] Erro:", error);
    return res.status(500).json({ error: error.message || "Erro ao criar pagamento" });
  }
});

// Webhook para notificações do Mercado Pago
paymentRoutes.post("/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log("[WEBHOOK MP] Notificação recebida:", { type, data });

    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar informações do pagamento
      const payment = await mercadopago.payment.findById(paymentId);
      const externalReference = payment.body.external_reference; // orderId

      console.log("[WEBHOOK MP] Pagamento:", {
        id: paymentId,
        status: payment.body.status,
        orderId: externalReference,
      });

      // Atualizar status do pedido
      if (externalReference) {
        let newStatus = 'pending';
        let newPaymentStatus = payment.body.status;

        if (payment.body.status === 'approved') {
          newStatus = 'preparing'; // Pedido aprovado vai para cozinha
          newPaymentStatus = 'approved';
        } else if (payment.body.status === 'rejected') {
          newPaymentStatus = 'rejected';
        }

        await prisma.order.update({
          where: { id: externalReference },
          data: {
            status: newStatus,
            paymentStatus: newPaymentStatus,
            paymentId: paymentId.toString(),
          },
        });

        console.log("[WEBHOOK MP] Pedido atualizado:", {
          orderId: externalReference,
          status: newStatus,
          paymentStatus: newPaymentStatus,
        });
      }
    }

    return res.status(200).send('OK');
  } catch (error: any) {
    console.error("[WEBHOOK MP] Erro:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Consultar status de pagamento
paymentRoutes.get("/status/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentId: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Se tem paymentId, buscar detalhes no Mercado Pago
    let paymentDetails = null;
    if (order.paymentId) {
      try {
        const payment = await mercadopago.payment.findById(Number(order.paymentId));
        paymentDetails = {
          status: payment.body.status,
          statusDetail: payment.body.status_detail,
          paymentMethod: payment.body.payment_method_id,
          transactionAmount: payment.body.transaction_amount,
        };
      } catch (err) {
        console.error("[PAYMENT STATUS] Erro ao buscar no MP:", err);
      }
    }

    return res.json({
      order,
      payment: paymentDetails,
    });
  } catch (error: any) {
    console.error("[PAYMENT STATUS] Erro:", error);
    return res.status(500).json({ error: error.message });
  }
});
