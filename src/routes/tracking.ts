import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Buscar pedido por ID para acompanhamento
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            phone: true,
            logoUrl: true,
            address: true,
            slug: true,
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Retornar dados do pedido
    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      totalCents: order.totalCents,
      deliveryFeeCents: order.deliveryFeeCents,
      notes: order.notes,
      prepStartedAt: order.prepStartedAt,
      readyAt: order.readyAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      restaurant: order.restaurant,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
      },
      address: order.address,
      items: order.items.map(item => ({
        quantity: item.quantity,
        priceCents: item.priceCents,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        observations: item.observations,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

export default router;
