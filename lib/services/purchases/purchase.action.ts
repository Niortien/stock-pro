'use server';

import { BASE_URL } from "@/baseurl/baseurl";
import { createPurchaseSchema, createPurchaseItemSchema, createSupplierSchema, CreatePurchaseSchema, CreatePurchaseItemSchema, CreateSupplierSchema } from './purchase.schema';
import { Purchase, PurchaseItem, Supplier } from './purchase.schema';

const origine: string = "Actions Achats";

const PurchaseApi = {
  // Achats
  create: { method: "POST", endpoint: () => `${BASE_URL}/purchases` },
  getAll: { method: "GET", endpoint: () => `${BASE_URL}/purchases` },
  getById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/purchases/${id}` },
  update: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/purchases/${id}` },
  delete: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/purchases/${id}` },
  updateStatus: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/purchases/${id}/status` },
  receivePurchase: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/purchases/${id}/receive` },
  
  // Détails d'achat
  addItem: { method: "POST", endpoint: (purchaseId: string) => `${BASE_URL}/purchases/${purchaseId}/items` },
  updateItem: { method: "PATCH", endpoint: (purchaseId: string, itemId: string) => `${BASE_URL}/purchases/${purchaseId}/items/${itemId}` },
  deleteItem: { method: "DELETE", endpoint: (purchaseId: string, itemId: string) => `${BASE_URL}/purchases/${purchaseId}/items/${itemId}` },
  getItemsByPurchase: { method: "GET", endpoint: (purchaseId: string) => `${BASE_URL}/purchases/${purchaseId}/items` },
  receiveItem: { method: "PATCH", endpoint: (purchaseId: string, itemId: string) => `${BASE_URL}/purchases/${purchaseId}/items/${itemId}/receive` },
  
  // Fournisseurs
  createSupplier: { method: "POST", endpoint: () => `${BASE_URL}/suppliers` },
  getAllSuppliers: { method: "GET", endpoint: () => `${BASE_URL}/suppliers` },
  getSupplierById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/suppliers/${id}` },
  updateSupplier: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/suppliers/${id}` },
  deleteSupplier: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/suppliers/${id}` },
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

// CREATE PURCHASE
export async function createPurchase(body: any) {
  // Vérifier si c'est l'ancien format ou le nouveau format
  const isOldFormat = body.productId !== undefined;
  
  if (isOldFormat) {
    // Pour l'ancien format, passer directement sans validation Zod
    // car createPurchaseSchema ne correspond pas à ce format
    return fetchJson(PurchaseApi.create.endpoint(), {
      method: PurchaseApi.create.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    // Pour le nouveau format, utiliser la validation Zod existante
    const parsed = createPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues.map(issue => issue.message).join(", ") 
      };
    }

    return fetchJson(PurchaseApi.create.endpoint(), {
      method: PurchaseApi.create.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  }
}

// GET ALL PURCHASES
export async function getAllPurchases() {
  return fetchJson<Purchase[]>(PurchaseApi.getAll.endpoint(), { 
    method: PurchaseApi.getAll.method 
  });
}

// GET PURCHASE BY ID
export async function getPurchaseById(id: string) {
  return fetchJson<Purchase>(PurchaseApi.getById.endpoint(id), { method: PurchaseApi.getById.method });
}

// UPDATE PURCHASE COMPLETE
export async function updatePurchaseComplete(id: string, body: any) {
  // Vérifier si c'est l'ancien format ou le nouveau format
  const isOldFormat = body.productId !== undefined;
  
  if (isOldFormat) {
    // Pour l'ancien format, passer directement sans validation Zod
    return fetchJson(PurchaseApi.update.endpoint(id), {
      method: PurchaseApi.update.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    // Pour le nouveau format, utiliser la validation Zod
    const parsed = createPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues.map(issue => issue.message).join(", ") 
      };
    }

    return fetchJson(PurchaseApi.update.endpoint(id), {
      method: PurchaseApi.update.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  }
}

// DELETE PURCHASE
export async function deletePurchase(id: string) {
  return fetchJson(PurchaseApi.delete.endpoint(id), { method: PurchaseApi.delete.method });
}

// UPDATE PURCHASE STATUS
export async function updatePurchaseStatus(id: string, status: string) {
  // Utiliser l'endpoint PATCH /purchases/:id avec le statut
  const updateData = {
    // Pour l'ancien format (isPaid)
    isPaid: status === 'PAID',
    // Pour le nouveau format (paymentStatus) - si le backend le supporte
    ...(status !== 'PAID' && status !== 'PENDING' && { paymentStatus: status })
  };

  return fetchJson(PurchaseApi.update.endpoint(id), {
    method: PurchaseApi.update.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
}

// RECEIVE PURCHASE
export async function receivePurchase(id: string, body: { receivedDate: string; notes?: string }) {
  return fetchJson(PurchaseApi.receivePurchase.endpoint(id), {
    method: PurchaseApi.receivePurchase.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ADD PURCHASE ITEM
export async function addPurchaseItem(purchaseId: string, body: CreatePurchaseItemSchema) {
  const parsed = createPurchaseItemSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(PurchaseApi.addItem.endpoint(purchaseId), {
    method: PurchaseApi.addItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET PURCHASE ITEMS
export async function getPurchaseItems(purchaseId: string) {
  return fetchJson<PurchaseItem[]>(PurchaseApi.getItemsByPurchase.endpoint(purchaseId), { 
    method: PurchaseApi.getItemsByPurchase.method 
  });
}

// UPDATE PURCHASE ITEM
export async function updatePurchaseItem(purchaseId: string, itemId: string, body: CreatePurchaseItemSchema) {
  const parsed = createPurchaseItemSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(PurchaseApi.updateItem.endpoint(purchaseId, itemId), {
    method: PurchaseApi.updateItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE PURCHASE ITEM
export async function deletePurchaseItem(purchaseId: string, itemId: string) {
  return fetchJson(PurchaseApi.deleteItem.endpoint(purchaseId, itemId), { method: PurchaseApi.deleteItem.method });
}

// RECEIVE PURCHASE ITEM
export async function receivePurchaseItem(purchaseId: string, itemId: string, body: { receivedQuantity: number }) {
  return fetchJson(PurchaseApi.receiveItem.endpoint(purchaseId, itemId), {
    method: PurchaseApi.receiveItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// CREATE SUPPLIER
export async function createSupplier(body: CreateSupplierSchema) {
  const parsed = createSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(PurchaseApi.createSupplier.endpoint(), {
    method: PurchaseApi.createSupplier.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL SUPPLIERS
export async function getAllSuppliers() {
  return fetchJson<Supplier[]>(PurchaseApi.getAllSuppliers.endpoint(), { 
    method: PurchaseApi.getAllSuppliers.method 
  });
}

// GET SUPPLIER BY ID
export async function getSupplierById(id: string) {
  return fetchJson<Supplier>(PurchaseApi.getSupplierById.endpoint(id), { method: PurchaseApi.getSupplierById.method });
}

// UPDATE SUPPLIER
export async function updateSupplier(id: string, body: CreateSupplierSchema) {
  const parsed = createSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map(issue => issue.message).join(", ") 
    };
  }

  return fetchJson(PurchaseApi.updateSupplier.endpoint(id), {
    method: PurchaseApi.updateSupplier.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE SUPPLIER
export async function deleteSupplier(id: string) {
  return fetchJson(PurchaseApi.deleteSupplier.endpoint(id), { method: PurchaseApi.deleteSupplier.method });
}
