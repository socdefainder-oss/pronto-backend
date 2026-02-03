import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Webhook do ASAAS
router.post('/asaas', async (req, res) => {
  try {
    const event = req.body.event;
    const payment = req.body.payment;

    console.log('📩 Webhook ASAAS recebido:', event, payment?.id);

    if (!payment?.id) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Buscar pedido pelo paymentId
    const order = await prisma.order.findFirst({
      where: { paymentId: payment.id },
    });

    if (!order) {
      console.log('⚠️ Pedido não encontrado para paymentId:', payment.id);
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Mapear status do ASAAS para nosso sistema
    let paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' = 'PENDING';
    
    switch (event) {
      case 'PAYMENT_CREATED':
        paymentStatus = 'PENDING';
        break;
      case 'PAYMENT_AWAITING_RISK_ANALYSIS':
        paymentStatus = 'PENDING';
        break;
      case 'PAYMENT_APPROVED_BY_RISK_ANALYSIS':
        paymentStatus = 'PENDING';
        break;
      case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
        paymentStatus = 'FAILED';
        break;
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED_IN_CASH':
        paymentStatus = 'PAID';
        break;
      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_DELETED':
        paymentStatus = 'FAILED';
        break;
      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_REFUND_IN_PROGRESS':
        paymentStatus = 'REFUNDED';
        break;
      case 'PAYMENT_CHARGEBACK_REQUESTED':
      case 'PAYMENT_CHARGEBACK_DISPUTE':
        paymentStatus = 'FAILED';
        break;
      default:
        console.log('⚠️ Evento não mapeado:', event);
    }

    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus },
    });

    console.log(`✅ Pedido ${order.id} atualizado para status: ${paymentStatus}`);

    return res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro no webhook ASAAS:', error);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

export default router;
