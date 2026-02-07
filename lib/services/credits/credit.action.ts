'use server';

import { BASE_URL } from "@/baseurl/baseurl";
import { createCreditSchema, createCreditPaymentSchema, createCreditCustomerSchema, CreateCreditSchema, CreateCreditPaymentSchema, CreateCreditCustomerSchema } from './credit.schema';
import { Credit, CreditPayment, CreditCustomer } from './credit.schema';

const origine: string = "Actions Créances";

const CreditApi = {
  // Créances
  create: { method: "POST", endpoint: () => `${BASE_URL}/credits` },
  getAll: { method: "GET", endpoint: () => `${BASE_URL}/credits` },
  getById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/credits/${id}` },
  update: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/credits/${id}` },
  delete: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/credits/${id}` },
  updateStatus: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/credits/${id}/status` },
  
  // Paiements de créances
  addPayment: { method: "POST", endpoint: (creditId: string) => `${BASE_URL}/credits/${creditId}/payments` },
  getPayments: { method: "GET", endpoint: (creditId: string) => `${BASE_URL}/credits/${creditId}/payments` },
  updatePayment: { method: "PATCH", endpoint: (creditId: string, paymentId: string) => `${BASE_URL}/credits/${creditId}/payments/${paymentId}` },
  deletePayment: { method: "DELETE", endpoint: (creditId: string, paymentId: string) => `${BASE_URL}/credits/${creditId}/payments/${paymentId}` },
  
  // Clients (pour les créances)
  createCustomer: { method: "POST", endpoint: () => `${BASE_URL}/credit-customers` },
  getAllCustomers: { method: "GET", endpoint: () => `${BASE_URL}/credit-customers` },
  getCustomerById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/credit-customers/${id}` },
  updateCustomer: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/credit-customers/${id}` },
  deleteCustomer: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/credit-customers/${id}` },
  getCustomerCredits: { method: "GET", endpoint: (customerId: string) => `${BASE_URL}/credit-customers/${customerId}/credits` },
};

// Fonction générique pour gérer les fetch JSON
async function fetchJson<T>(url: string, options: RequestInit): Promise<
  { success: true; data: T } | { success: false; error: string }
> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData: { message?: string } | null = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Erreur côté serveur, origine: ${origine}`,
      };
    }

    const data: T = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    let message = "Erreur inconnue";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    return {
      success: false,
      error: message || `Erreur inattendue dans ${origine}`,
    };
  }
}

// CREATE CREDIT
export async function createCredit(body: CreateCreditSchema) {
  const parsed = createCreditSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(CreditApi.create.endpoint(), {
    method: CreditApi.create.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL CREDITS
export async function getAllCredits() {
  return fetchJson<Credit[]>(CreditApi.getAll.endpoint(), { 
    method: CreditApi.getAll.method 
  });
}

// GET CREDIT BY ID
export async function getCreditById(id: string) {
  return fetchJson<Credit>(CreditApi.getById.endpoint(id), { method: CreditApi.getById.method });
}

// UPDATE CREDIT
export async function updateCredit(id: string, body: CreateCreditSchema) {
  const parsed = createCreditSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(CreditApi.update.endpoint(id), {
    method: CreditApi.update.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE CREDIT
export async function deleteCredit(id: string) {
  return fetchJson(CreditApi.delete.endpoint(id), { method: CreditApi.delete.method });
}

// UPDATE CREDIT STATUS
export async function updateCreditStatus(id: string, status: string) {
  return fetchJson(CreditApi.updateStatus.endpoint(id), {
    method: CreditApi.updateStatus.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

// ADD CREDIT PAYMENT
export async function addCreditPayment(creditId: string, body: CreateCreditPaymentSchema) {
  const parsed = createCreditPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(CreditApi.addPayment.endpoint(creditId), {
    method: CreditApi.addPayment.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET CREDIT PAYMENTS
export async function getCreditPayments(creditId: string) {
  return fetchJson<CreditPayment[]>(CreditApi.getPayments.endpoint(creditId), { 
    method: CreditApi.getPayments.method 
  });
}

// UPDATE CREDIT PAYMENT
export async function updateCreditPayment(creditId: string, paymentId: string, body: CreateCreditPaymentSchema) {
  const parsed = createCreditPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(CreditApi.updatePayment.endpoint(creditId, paymentId), {
    method: CreditApi.updatePayment.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE CREDIT PAYMENT
export async function deleteCreditPayment(creditId: string, paymentId: string) {
  return fetchJson(CreditApi.deletePayment.endpoint(creditId, paymentId), { method: CreditApi.deletePayment.method });
}

// CREATE CREDIT CUSTOMER
export async function createCreditCustomer(body: CreateCreditCustomerSchema) {
  const parsed = createCreditCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(CreditApi.createCustomer.endpoint(), {
    method: CreditApi.createCustomer.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL CREDIT CUSTOMERS
export async function getAllCreditCustomers() {
  return fetchJson<CreditCustomer[]>(CreditApi.getAllCustomers.endpoint(), { 
    method: CreditApi.getAllCustomers.method 
  });
}

// GET CREDIT CUSTOMER BY ID
export async function getCreditCustomerById(id: string) {
  return fetchJson<CreditCustomer>(CreditApi.getCustomerById.endpoint(id), { method: CreditApi.getCustomerById.method });
}

// UPDATE CREDIT CUSTOMER
export async function updateCreditCustomer(id: string, body: CreateCreditCustomerSchema) {
  const parsed = createCreditCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(CreditApi.updateCustomer.endpoint(id), {
    method: CreditApi.updateCustomer.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE CREDIT CUSTOMER
export async function deleteCreditCustomer(id: string) {
  return fetchJson(CreditApi.deleteCustomer.endpoint(id), { method: CreditApi.deleteCustomer.method });
}

// GET CUSTOMER CREDITS
export async function getCustomerCredits(customerId: string) {
  return fetchJson<Credit[]>(CreditApi.getCustomerCredits.endpoint(customerId), { method: CreditApi.getCustomerCredits.method });
}
