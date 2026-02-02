import mercadopago from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

if (!accessToken) {
  console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado');
}

// Configurar SDK do Mercado Pago
mercadopago.configure({
  access_token: accessToken,
});

export { mercadopago };
