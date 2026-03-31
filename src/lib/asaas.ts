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

export async function createCharge(data: CreateChargeData, subaccountApiKey?: string) {
  try {
    let response;
    
    if (subaccountApiKey) {
      // Usar API key da subconta se fornecida
      response = await axios.post(`${ASAAS_BASE_URL}/payments`, data, {
        headers: {
          'Content-Type': 'application/json',
          'access_token': subaccountApiKey,
        },
      });
    } else {
      // Usar API global (master account)
      response = await asaasApi.post('/payments', data);
    }
    
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

/**
 * Criar subconta ASAAS para uma loja
 * Retorna { id: string, apiKey: string }
 */
export async function createSubaccount(data: {
  name: string;
  email: string;
  loginEmail: string;
  cpfCnpj: string;
  birthDate?: string;
  phone: string;
  mobilePhone: string;
  incomeValue: number;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string;
  postalCode: string;
  companyType?: 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION';
  site?: string;
  type?: string;
}) {
  try {
    console.log('Criando subconta ASAAS:', data.name);
    const response = await asaasApi.post('/accounts', {
      name: data.name,
      email: data.email,
      loginEmail: data.loginEmail,
      cpfCnpj: data.cpfCnpj,
      birthDate: data.birthDate,
      phone: data.phone,
      mobilePhone: data.mobilePhone,
      incomeValue: data.incomeValue,
      address: data.address,
      addressNumber: data.addressNumber,
      complement: data.complement,
      province: data.province,
      postalCode: data.postalCode,
      companyType: data.companyType,
      site: data.site || '',
      type: data.type || 'INDIVIDUAL',
    });
    
    console.log('✅ Subconta criada:', response.data.id);
    return {
      id: response.data.id,
      apiKey: response.data.apiKey,
      name: response.data.name,
      email: response.data.email,
    };
  } catch (error: any) {
    console.error('❌ Erro ao criar subconta ASAAS:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(`Falha ao criar subconta ASAAS: ${error.response?.data?.errors?.[0]?.description || error.message}`);
  }
}

/**
 * Criar cobrança usando API Key de subconta
 * Útil quando você quer fazer pagamentos em nome da subconta
 */
export async function createChargeForSubaccount(
  subaccountApiKey: string,
  data: CreateChargeData
) {
  try {
    const response = await axios.post(`${ASAAS_BASE_URL}/payments`, data, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': subaccountApiKey,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar cobrança na subconta:', error.response?.data || error.message);
    throw new Error('Falha ao criar cobrança na subconta ASAAS');
  }
}

/**
 * Configurar split de pagamentos
 * Parte do pagamento vai para subconta, parte para conta master
 */
export interface SplitConfig {
  walletId: string; // ID da carteira da subconta
  splitConfig: Array<{
    walletId: string; // Para onde vai o split
    percentualValue: number; // Percentual (0-100)
  }>;
}

export async function configureSplit(
  subaccountApiKey: string,
  splitConfig: SplitConfig
) {
  try {
    console.log('Configurando split para subconta...');
    // Nota: O split é configurado geralmente na conta master
    // Esta é uma função de referência - verifique a documentação do ASAAS
    const response = await axios.post(
      `${ASAAS_BASE_URL}/myWalletSplits`,
      splitConfig,
      {
        headers: {
          'Content-Type': 'application/json',
          'access_token': subaccountApiKey,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Erro ao configurar split:', error.response?.data || error.message);
    throw new Error('Falha ao configurar split ASAAS');
  }
}

/**
 * Obter informações da conta/subconta
 */
export async function getAccountInfo(apiKey: string) {
  try {
    const response = await axios.get(`${ASAAS_BASE_URL}/myInfo`, {
      headers: {
        'access_token': apiKey,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar info da conta:', error.response?.data || error.message);
    throw new Error('Falha ao buscar informações da conta');
  }
}

export default asaasApi;
