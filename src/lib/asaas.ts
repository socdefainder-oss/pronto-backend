import axios from 'axios';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmM0MjMzMDZkLTVlYjMtNDk0OC1iYTNjLWFkNzVmZTEyMjMyNjo6JGFhY2hfOWY5OGUxZTUtZmRhNi00OGUzLTg5MjgtMGNlNjRmYTViMGVj';
const ASAAS_BASE_URL = 'https://api.asaas.com/v3';

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
    const response = await asaasApi.post('/customers', data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar cliente no ASAAS:', error.response?.data || error.message);
    throw new Error('Falha ao criar cliente no ASAAS');
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
