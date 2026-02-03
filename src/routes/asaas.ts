import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createCustomer, createCharge, getPixQrCode } from '../lib/asaas';

const router = Router();

// Criar pagamento (PIX ou Cartão)
router.post('/create', async (req, res) => {
  try {
    const { orderId, paymentMethod, cardData } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        restaurant: true,
        items: {
          include: { product: true }
        },
        address: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Criar ou buscar cliente no ASAAS
    let asaasCustomerId = order.customer.asaasCustomerId;
    
    if (!asaasCustomerId) {
      const customerData: any = {
        name: order.customer.name,
        email: order.customer.email || undefined,
        phone: order.customer.phone || undefined,
        mobilePhone: order.customer.phone || undefined,
        cpfCnpj: order.customer.cpfCnpj || undefined,
        externalReference: order.customer.id,
      };

      if (order.address) {
        customerData.address = order.address.street;
        customerData.addressNumber = order.address.number;
        customerData.complement = order.address.complement || undefined;
        customerData.province = order.address.district;
        customerData.postalCode = order.address.zipCode || undefined;
      }

      const asaasCustomer = await createCustomer(customerData);
      asaasCustomerId = asaasCustomer.id;

      // Salvar o ID do cliente ASAAS
      await prisma.customer.update({
        where: { id: order.customer.id },
        data: { asaasCustomerId },
      });
    }

    // Preparar dados da cobrança
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Vencimento para amanhã
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const chargeData: any = {
      customer: asaasCustomerId,
      billingType: paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
      value: order.totalCents / 100, // Converter de centavos para reais
      dueDate: dueDateStr,
      description: `Pedido #${order.id.substring(0, 8)} - ${order.restaurant.name}`,
      externalReference: order.id,
    };

    // Se for cartão de crédito, adicionar dados do cartão
    if (paymentMethod === 'credit_card' && cardData) {
      chargeData.creditCard = {
        holderName: cardData.holderName,
        number: cardData.number.replace(/\s/g, ''),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        ccv: cardData.ccv,
      };

      // Garantir que todos os campos obrigatórios estejam presentes
      const cpfCnpj = (cardData.holderInfo?.cpfCnpj || order.customer.cpfCnpj || '').replace(/\D/g, '');
      let postalCode = (order.address?.zipCode || '').replace(/\D/g, '');
      let addressNumber = order.address?.number || 'S/N';
      const phone = (order.customer.phone || '').replace(/\D/g, '');

      // Se não tem CEP do cliente (retirada), usar CEP genérico para validação ASAAS
      // O ASAAS exige CEP para antifraude, mas em retirada não precisamos do endereço real do cliente
      if (!postalCode || postalCode.length !== 8) {
        postalCode = '01310100'; // CEP genérico válido para validação
        addressNumber = '1';
      }

      if (!cpfCnpj || cpfCnpj.length < 11) {
        return res.status(400).json({ error: 'CPF/CNPJ é obrigatório para pagamento com cartão' });
      }

      if (!phone || phone.length < 10) {
        return res.status(400).json({ error: 'Telefone válido é obrigatório para pagamento com cartão' });
      }

      chargeData.creditCardHolderInfo = {
        name: cardData.holderName, // Usar o nome do cartão, não do cliente
        email: order.customer.email || 'nao-informado@email.com',
        cpfCnpj: cpfCnpj,
        postalCode: postalCode,
        addressNumber: addressNumber,
        phone: phone,
      };

      console.log('Dados do cartão:', JSON.stringify(chargeData.creditCard, null, 2));
      console.log('Dados do titular do cartão:', JSON.stringify(chargeData.creditCardHolderInfo, null, 2));
    }

    // Criar cobrança no ASAAS
    const charge = await createCharge(chargeData);

    // Atualizar pedido com ID da cobrança
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: charge.id,
        paymentStatus: charge.status === 'CONFIRMED' ? 'PAID' : 'PENDING',
      },
    });

    // Se for PIX, buscar QR Code
    let pixData = null;
    if (paymentMethod === 'pix') {
      pixData = await getPixQrCode(charge.id);
    }

    return res.json({
      success: true,
      chargeId: charge.id,
      status: charge.status,
      invoiceUrl: charge.invoiceUrl,
      bankSlipUrl: charge.bankSlipUrl,
      pixQrCodeUrl: pixData?.encodedImage,
      pixCopyPaste: pixData?.payload,
    });
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao processar pagamento' });
  }
});

// Buscar status do pagamento
router.get('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const order = await prisma.order.findFirst({
      where: { paymentId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    return res.json({
      paymentId,
      status: order.paymentStatus,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Erro ao buscar status do pagamento:', error);
    return res.status(500).json({ error: 'Erro ao buscar status do pagamento' });
  }
});

export default router;
