/**
 * AbacatePay Integration Library
 * Documentação: https://docs.abacatepay.com
 */

const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";

// Chave pública para validação HMAC do webhook
const WEBHOOK_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

// Tipos
export interface AbacatePayProduct {
  externalId: string;
  name: string;
  quantity: number;
  price: number; // em centavos
  description?: string;
}

export interface AbacatePayCustomer {
  name: string;
  email: string;
  cellphone?: string;
  taxId?: string; // CPF/CNPJ
}

export interface CreateBillingRequest {
  frequency: "ONE_TIME" | "MULTIPLE_PAYMENTS";
  methods: ("PIX" | "CARD")[];
  products: AbacatePayProduct[];
  returnUrl: string;
  completionUrl: string;
  customer?: AbacatePayCustomer;
  customerId?: string;
  allowCoupons?: boolean;
  coupons?: string[];
  externalId?: string;
  metadata?: Record<string, unknown>;
}

export interface BillingResponse {
  id: string;
  url: string;
  amount: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  devMode: boolean;
  methods: string[];
  frequency: string;
}

export interface AbacatePayResponse<T> {
  data: T | null;
  error: string | null;
}

export interface WebhookBillingPaidPayload {
  billing: {
    id: string;
    status: string;
    amount: number;
    devMode: boolean;
    fee: number;
    paidAt: string;
    customer: {
      id: string;
      metadata: {
        name: string;
        email: string;
        cellphone: string;
        taxId: string;
      };
    };
    products: {
      id: string;
      externalId: string;
      quantity: number;
    }[];
  };
  payment: {
    id: string;
    amount: number;
    fee: number;
    method: string;
  };
}

class AbacatePayClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      throw new Error("ABACATEPAY_API_KEY não configurada");
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AbacatePayResponse<T>> {
    const url = `${ABACATEPAY_API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    return data as AbacatePayResponse<T>;
  }

  /**
   * Cria uma nova cobrança/pagamento
   */
  async createBilling(
    params: CreateBillingRequest
  ): Promise<AbacatePayResponse<BillingResponse>> {
    return this.request<BillingResponse>("/billing/create", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Lista todas as cobranças
   */
  async listBillings(): Promise<AbacatePayResponse<BillingResponse[]>> {
    return this.request<BillingResponse[]>("/billing/list", {
      method: "GET",
    });
  }

  /**
   * Cria um novo cliente
   */
  async createCustomer(
    customer: AbacatePayCustomer
  ): Promise<AbacatePayResponse<{ id: string }>> {
    return this.request<{ id: string }>("/customer/create", {
      method: "POST",
      body: JSON.stringify(customer),
    });
  }

  /**
   * Lista todos os clientes
   */
  async listCustomers(): Promise<
    AbacatePayResponse<{ id: string; metadata: AbacatePayCustomer }[]>
  > {
    return this.request<{ id: string; metadata: AbacatePayCustomer }[]>(
      "/customer/list",
      {
        method: "GET",
      }
    );
  }

  /**
   * Cria um QR Code PIX para pagamento direto
   */
  async createPixQrCode(params: {
    amount: number; // em centavos
    expiresIn?: number; // segundos
    description?: string;
  }): Promise<
    AbacatePayResponse<{
      id: string;
      qrCode: string;
      qrCodeBase64: string;
      amount: number;
      status: string;
    }>
  > {
    return this.request("/pixQrCode/create", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Verifica status de um QR Code PIX
   */
  async checkPixQrCode(
    id: string
  ): Promise<AbacatePayResponse<{ id: string; status: string }>> {
    return this.request(`/pixQrCode/check?id=${id}`, {
      method: "GET",
    });
  }

  /**
   * Simula pagamento de um PIX (apenas em modo de desenvolvimento)
   */
  async simulatePixPayment(
    id: string
  ): Promise<AbacatePayResponse<{ success: boolean }>> {
    if (process.env.ABACATEPAY_DEV_MODE !== "true") {
      throw new Error("Simulação de pagamento só disponível em modo dev");
    }
    return this.request("/pixQrCode/simulate-payment", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }
}

/**
 * Valida o webhook do AbacatePay
 * Verifica o secret na query string
 */
export function validateWebhookSecret(
  querySecret: string | null
): boolean {
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !querySecret) {
    return false;
  }
  return querySecret === webhookSecret;
}

/**
 * Obtém a URL base da aplicação para callbacks
 */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"
  );
}

// Singleton do cliente
let abacatePayClient: AbacatePayClient | null = null;

export function getAbacatePayClient(): AbacatePayClient {
  if (!abacatePayClient) {
    abacatePayClient = new AbacatePayClient();
  }
  return abacatePayClient;
}

export { WEBHOOK_PUBLIC_KEY };
