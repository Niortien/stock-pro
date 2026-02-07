'use server';

import { BASE_URL } from "@/baseurl/baseurl";
import { createSaleSchema, createSaleItemSchema, createCustomerSchema, CreateSaleSchema, CreateSaleItemSchema, CreateCustomerSchema } from './sale.schema';
import { Sale, SaleItem, Customer } from './sale.schema';

const origine: string = "Actions Ventes";

const SalesApi = {
  // Ventes
  create: { method: "POST", endpoint: () => `${BASE_URL}/sales` },
  getAll: { method: "GET", endpoint: () => `${BASE_URL}/sales` },
  getById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/sales/${id}` },
  update: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/sales/${id}` },
  delete: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/sales/${id}` },
  updateStatus: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/sales/${id}/status` },
  
  // Détails de vente
  addItem: { method: "POST", endpoint: (saleId: string) => `${BASE_URL}/sales/${saleId}/items` },
  updateItem: { method: "PATCH", endpoint: (saleId: string, itemId: string) => `${BASE_URL}/sales/${saleId}/items/${itemId}` },
  deleteItem: { method: "DELETE", endpoint: (saleId: string, itemId: string) => `${BASE_URL}/sales/${saleId}/items/${itemId}` },
  getItemsBySale: { method: "GET", endpoint: (saleId: string) => `${BASE_URL}/sales/${saleId}/items` },
  
  // Clients
  createCustomer: { method: "POST", endpoint: () => `${BASE_URL}/customers` },
  getAllCustomers: { method: "GET", endpoint: () => `${BASE_URL}/customers` },
  getCustomerById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/customers/${id}` },
  updateCustomer: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/customers/${id}` },
  deleteCustomer: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/customers/${id}` },
  
  // Statistiques
  getSalesStats: { method: "GET", endpoint: () => `${BASE_URL}/sales/stats` },
  getCustomerStats: { method: "GET", endpoint: () => `${BASE_URL}/customers/stats` },
  getTopProducts: { method: "GET", endpoint: () => `${BASE_URL}/sales/top-products` },
  getRecentSales: { method: "GET", endpoint: () => `${BASE_URL}/sales/recent` },
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

// CREATE SALE
export async function createSale(body: any) {
  // Vérifier si c'est l'ancien format ou le nouveau format
  const isOldFormat = body.productId !== undefined;
  
  if (isOldFormat) {
    // Pour l'ancien format, passer directement sans validation Zod
    // car createSaleSchema ne correspond pas à ce format
    return fetchJson(SalesApi.create.endpoint(), {
      method: SalesApi.create.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    // Pour le nouveau format, utiliser la validation Zod existante
    const parsed = createSaleSchema.safeParse(body);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues.map(issue => issue.message).join(", ") 
      };
    }

    return fetchJson(SalesApi.create.endpoint(), {
      method: SalesApi.create.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  }
}

// GET ALL SALES
export async function getAllSales() {
  return fetchJson<Sale[]>(SalesApi.getAll.endpoint(), { 
    method: SalesApi.getAll.method 
  });
}

// GET SALE BY ID
export async function getSaleById(id: string) {
  return fetchJson<Sale>(SalesApi.getById.endpoint(id), { method: SalesApi.getById.method });
}

// UPDATE SALE
export async function updateSale(id: string, body: any) {
  // Vérifier si c'est l'ancien format ou le nouveau format
  const isOldFormat = body.productId !== undefined;
  
  if (isOldFormat) {
    // Pour l'ancien format, passer directement sans validation Zod
    return fetchJson(SalesApi.update.endpoint(id), {
      method: SalesApi.update.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    // Pour le nouveau format, utiliser la validation Zod existante
    const parsed = createSaleSchema.safeParse(body);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues.map(issue => issue.message).join(", ") 
      };
    }

    return fetchJson(SalesApi.update.endpoint(id), {
      method: SalesApi.update.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  }
}

// DELETE SALE
export async function deleteSale(id: string) {
  return fetchJson(SalesApi.delete.endpoint(id), { method: SalesApi.delete.method });
}

// UPDATE SALE STATUS
export async function updateSaleStatus(id: string, status: string) {
  return fetchJson(SalesApi.updateStatus.endpoint(id), {
    method: SalesApi.updateStatus.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

// ADD SALE ITEM
export async function addSaleItem(saleId: string, body: CreateSaleItemSchema) {
  const parsed = createSaleItemSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(SalesApi.addItem.endpoint(saleId), {
    method: SalesApi.addItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET SALE ITEMS
export async function getSaleItems(saleId: string) {
  return fetchJson<SaleItem[]>(SalesApi.getItemsBySale.endpoint(saleId), { 
    method: SalesApi.getItemsBySale.method 
  });
}

// UPDATE SALE ITEM
export async function updateSaleItem(saleId: string, itemId: string, body: CreateSaleItemSchema) {
  const parsed = createSaleItemSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(SalesApi.updateItem.endpoint(saleId, itemId), {
    method: SalesApi.updateItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE SALE ITEM
export async function deleteSaleItem(saleId: string, itemId: string) {
  return fetchJson(SalesApi.deleteItem.endpoint(saleId, itemId), { method: SalesApi.deleteItem.method });
}

// CREATE CUSTOMER
export async function createCustomer(body: CreateCustomerSchema) {
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(SalesApi.createCustomer.endpoint(), {
    method: SalesApi.createCustomer.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL CUSTOMERS
export async function getAllCustomers() {
  return fetchJson<Customer[]>(SalesApi.getAllCustomers.endpoint(), { 
    method: SalesApi.getAllCustomers.method 
  });
}

// GET CUSTOMER BY ID
export async function getCustomerById(id: string) {
  return fetchJson<Customer>(SalesApi.getCustomerById.endpoint(id), { method: SalesApi.getCustomerById.method });
}

// UPDATE CUSTOMER
export async function updateCustomer(id: string, body: CreateCustomerSchema) {
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(SalesApi.updateCustomer.endpoint(id), {
    method: SalesApi.updateCustomer.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE CUSTOMER
export async function deleteCustomer(id: string) {
  return fetchJson(SalesApi.deleteCustomer.endpoint(id), { method: SalesApi.deleteCustomer.method });
}

// GET SALES STATS
export async function getSalesStats() {
  return fetchJson(SalesApi.getSalesStats.endpoint(), { method: SalesApi.getSalesStats.method });
}

// GET CUSTOMER STATS
export async function getCustomerStats() {
  return fetchJson(SalesApi.getCustomerStats.endpoint(), { method: SalesApi.getCustomerStats.method });
}

// GET TOP PRODUCTS
export async function getTopProducts() {
  return fetchJson(SalesApi.getTopProducts.endpoint(), { method: SalesApi.getTopProducts.method });
}

// GET RECENT SALES
export async function getRecentSales() {
  return fetchJson(SalesApi.getRecentSales.endpoint(), { method: SalesApi.getRecentSales.method });
}