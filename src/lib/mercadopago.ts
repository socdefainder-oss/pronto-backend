import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

if (!accessToken) {
  console.warn('⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado');
}

// Configurar SDK do Mercado Pago (v2.x)
const client = new MercadoPagoConfig({
  accessToken: accessToken,
});

export const preference = new Preference(client);
export const payment = new Payment(client);
