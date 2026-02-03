import axios from 'axios';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = 'https://api.asaas.com/v3';

if (!ASAAS_API_KEY) {
  console.error('❌ ERRO: ASAAS_API_KEY não configurada! Configure a variável de ambiente.');
}

const asaasApi = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY,
  },
});

export interface CreateChargeData {
  customer: string; // ID do cliente no ASAAS
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'UNDEFINED';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string; // ID do pedido
  postalService?: boolean;
  
  // Para cartão de crédito
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

export interface CreateCustomerData {
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
}

export async function createCustomer(data: CreateCustomerData) {
  try {
    console.log('Criando cliente no ASAAS com dados:', JSON.stringify(data, null, 2));
    const response = await asaasApi.post('/customers', data);
    console.log('Cliente criado com sucesso:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar cliente no ASAAS:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    throw new Error(`Falha ao criar cliente no ASAAS: ${JSON.stringify(error.response?.data || error.message)}`);
  }
}

export async function createCharge(data: CreateChargeData) {
  try {
    const response = await asaasApi.post('/payments', data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar cobrança no ASAAS:', error.response?.data || error.message);
    throw new Error('Falha ao criar cobrança no ASAAS');
  }
}

export async function getCharge(chargeId: string) {
  try {
    const response = await asaasApi.get(`/payments/${chargeId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar cobrança no ASAAS:', error.response?.data || error.message);
    throw new Error('Falha ao buscar cobrança no ASAAS');
  }
}

export async function getPixQrCode(chargeId: string) {
  try {
    const response = await asaasApi.get(`/payments/${chargeId}/pixQrCode`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar QR Code PIX:', error.response?.data || error.message);
    throw new Error('Falha ao buscar QR Code PIX');
  }
}

export default asaasApi;
