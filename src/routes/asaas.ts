import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createCustomer, createCharge, getPixQrCode, createSubaccount, getAccountInfo } from '../lib/asaas';

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

    // Criar cobrança no ASAAS (usando subconta se configurada)
    const charge = await createCharge(
      chargeData, 
      order.restaurant.asaasSubaccountApiKey || undefined
    );

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

// ============ SUBCONTAS ASAAS ============

/**
 * POST /api/asaas/setup-subaccount
 * Criar e configurar subconta ASAAS para uma loja
 * Body: { restaurantId: string, splitPercentage?: number }
 */
router.post('/setup-subaccount', async (req, res) => {
  try {
    const { restaurantId, splitPercentage } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId é obrigatório' });
    }

    // Buscar restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    // Se já tem subconta ativa, retornar dados existentes
    if (restaurant.asaasSubaccountId && restaurant.asaasStatus === 'active') {
      return res.json({
        message: 'Subconta já configurada',
        subaccountId: restaurant.asaasSubaccountId,
        status: restaurant.asaasStatus,
      });
    }

    console.log(`📱 Criando subconta ASAAS para: ${restaurant.name}`);

    // Extrair CNPJ/CPF (remover caracteres especiais)
    const cnpjCpf = (restaurant.cnpj || '').replace(/\D/g, '');
    
    if (!cnpjCpf || cnpjCpf.length < 11) {
      return res.status(400).json({ 
        error: 'Restaurante precisa de CNPJ válido cadastrado' 
      });
    }

    // Preparar dados para criar subconta
    let normalizedPhone = (restaurant.phone || '').replace(/\D/g, '');
    if (normalizedPhone.startsWith('55') && normalizedPhone.length >= 12) {
      normalizedPhone = normalizedPhone.slice(2);
    }

    // Asaas espera celular brasileiro como DDD + 9 digitos (11 no total)
    let mobilePhone = normalizedPhone;
    if (mobilePhone.length === 10) {
      mobilePhone = `${mobilePhone.slice(0, 2)}9${mobilePhone.slice(2)}`;
    }
    if (mobilePhone.length !== 11) {
      mobilePhone = '11999999999';
    }

    const subaccountData = {
      name: restaurant.name,
      email: restaurant.email || `${restaurant.id}@subaccount.pronto`,
      loginEmail: restaurant.email || `${restaurant.id}@subaccount.pronto`,
      cpfCnpj: cnpjCpf,
      phone: normalizedPhone || '1133333333',
      mobilePhone,
      incomeValue: 5000,
      address: restaurant.address || 'Endereco nao informado',
      addressNumber: 'S/N',
      province: 'Centro',
      postalCode: '01310100',
      companyType: (restaurant.isMEI ? 'MEI' : 'LIMITED') as 'MEI' | 'LIMITED',
      site: restaurant.companyName || '',
      type: cnpjCpf.length === 14 ? 'COMPANY' : 'INDIVIDUAL',
    };

    // Criar subconta via API ASAAS
    const subaccount = await createSubaccount(subaccountData);

    // Salvar dados da subconta no banco
    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        asaasSubaccountId: subaccount.id,
        asaasSubaccountApiKey: subaccount.apiKey,
        asaasSplitPercentage: splitPercentage ? parseFloat(splitPercentage.toString()) : 5.0,
        asaasStatus: 'active',
        asaasCreatedAt: new Date(),
      },
    });

    console.log(`✅ Subconta criada: ${subaccount.id}`);

    return res.json({
      success: true,
      message: 'Subconta criada e configurada com sucesso',
      restaurant: {
        id: updated.id,
        name: updated.name,
        asaasSubaccountId: updated.asaasSubaccountId,
        asaasStatus: updated.asaasStatus,
        asaasSplitPercentage: updated.asaasSplitPercentage,
        asaasCreatedAt: updated.asaasCreatedAt,
      },
    });
  } catch (error: any) {
    console.error('❌ Erro ao configurar subconta:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro ao configurar subconta ASAAS'
    });
  }
});

/**
 * GET /api/asaas/restaurant/:restaurantId/subaccount
 * Obter status e informações da subconta
 */
router.get('/restaurant/:restaurantId/subaccount', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        asaasSubaccountId: true,
        asaasStatus: true,
        asaasSplitPercentage: true,
        asaasCreatedAt: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    if (!restaurant.asaasSubaccountId) {
      return res.json({
        message: 'Subconta não configurada',
        subaccountStatus: 'not-configured',
        restaurant,
      });
    }

    // Se tiver API key, buscar info da conta no ASAAS (opcional)
    // Descomente para validar subconta em tempo real
    /*
    const accountInfo = await getAccountInfo(restaurant.asaasSubaccountApiKey);
    */

    return res.json({
      success: true,
      restaurant: {
        ...restaurant,
        asaasSplitPercentage: parseFloat(restaurant.asaasSplitPercentage.toString()),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar info da subconta:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar informações da subconta'
    });
  }
});

/**
 * PUT /api/asaas/restaurant/:restaurantId/subaccount
 * Atualizar configurações da subconta (ex: splitPercentage)
 */
router.put('/restaurant/:restaurantId/subaccount', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { splitPercentage } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }

    if (!restaurant.asaasSubaccountId) {
      return res.status(400).json({ error: 'Subconta não configurada' });
    }

    if (splitPercentage !== undefined) {
      const percentage = parseFloat(splitPercentage.toString());
      if (percentage < 0 || percentage > 100) {
        return res.status(400).json({ error: 'Percentual deve estar entre 0 e 100' });
      }
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(splitPercentage !== undefined && { asaasSplitPercentage: splitPercentage }),
      },
      select: {
        id: true,
        name: true,
        asaasSubaccountId: true,
        asaasStatus: true,
        asaasSplitPercentage: true,
      },
    });

    return res.json({
      success: true,
      message: 'Subconta atualizada',
      restaurant: {
        ...updated,
        asaasSplitPercentage: parseFloat(updated.asaasSplitPercentage.toString()),
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar subconta:', error);
    return res.status(500).json({ error: 'Erro ao atualizar subconta' });
  }
});

export default router;
