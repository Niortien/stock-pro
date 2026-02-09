'use server';

import { BASE_URL } from "@/baseurl/baseurl";
import { createInvoiceSchema, createInvoiceItemSchema, createInvoicePaymentSchema, createInvoiceContactSchema, updateInvoiceSchema, CreateInvoiceSchema, CreateInvoiceItemSchema, CreateInvoicePaymentSchema, CreateInvoiceContactSchema, UpdateInvoiceSchema } from './invoice.schema';
import { Invoice, InvoiceItem, InvoicePayment, InvoiceContact } from './invoice.schema';

const origine: string = "Actions Factures";

const InvoiceApi = {
  // Factures
  create: { method: "POST", endpoint: () => `${BASE_URL}/invoices` },
  getAll: { method: "GET", endpoint: () => `${BASE_URL}/invoices` },
  getById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/invoices/${id}` },
  update: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/invoices/${id}` },
  delete: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/invoices/${id}` },
  updateStatus: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/invoices/${id}/status` },
  sendInvoice: { method: "POST", endpoint: (id: string) => `${BASE_URL}/invoices/${id}/send` },
  generatePdf: { method: "GET", endpoint: (id: string) => `${BASE_URL}/invoices/${id}/pdf` },
  
  // Articles de facture
  addItem: { method: "POST", endpoint: (invoiceId: string) => `${BASE_URL}/invoices/${invoiceId}/items` },
  getItems: { method: "GET", endpoint: (invoiceId: string) => `${BASE_URL}/invoices/${invoiceId}/items` },
  updateItem: { method: "PATCH", endpoint: (invoiceId: string, itemId: string) => `${BASE_URL}/invoices/${invoiceId}/items/${itemId}` },
  deleteItem: { method: "DELETE", endpoint: (invoiceId: string, itemId: string) => `${BASE_URL}/invoices/${invoiceId}/items/${itemId}` },
  
  // Paiements de facture
  addPayment: { method: "POST", endpoint: (invoiceId: string) => `${BASE_URL}/invoices/${invoiceId}/payments` },
  getPayments: { method: "GET", endpoint: (invoiceId: string) => `${BASE_URL}/invoices/${invoiceId}/payments` },
  updatePayment: { method: "PATCH", endpoint: (invoiceId: string, paymentId: string) => `${BASE_URL}/invoices/${invoiceId}/payments/${paymentId}` },
  deletePayment: { method: "DELETE", endpoint: (invoiceId: string, paymentId: string) => `${BASE_URL}/invoices/${invoiceId}/payments/${paymentId}` },
  
  // Contacts (clients/fournisseurs)
  createContact: { method: "POST", endpoint: () => `${BASE_URL}/invoice-contacts` },
  getAllContacts: { method: "GET", endpoint: () => `${BASE_URL}/invoice-contacts` },
  getContactById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/invoice-contacts/${id}` },
  updateContact: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/invoice-contacts/${id}` },
  deleteContact: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/invoice-contacts/${id}` },
  getContactInvoices: { method: "GET", endpoint: (contactId: string) => `${BASE_URL}/invoice-contacts/${contactId}/invoices` },
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

// CREATE INVOICE
export async function createInvoice(body: any) {
  // Vérifier si c'est l'ancien format ou le nouveau format
  const isOldFormat = body.invoiceNumber !== undefined;
  
  if (isOldFormat) {
    // Pour l'ancien format, passer directement sans validation Zod
    return fetchJson(InvoiceApi.create.endpoint(), {
      method: InvoiceApi.create.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    // Pour le nouveau format, utiliser la validation Zod existante
    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return { 
        success: false, 
        error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
      };
    }

    return fetchJson(InvoiceApi.create.endpoint(), {
      method: InvoiceApi.create.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  }
}

// GET ALL INVOICES
export async function getAllInvoices() {
  return fetchJson<Invoice[]>(InvoiceApi.getAll.endpoint(), { 
    method: InvoiceApi.getAll.method 
  });
}

// GET INVOICE BY ID
export async function getInvoiceById(id: string) {
  return fetchJson<Invoice>(InvoiceApi.getById.endpoint(id), { method: InvoiceApi.getById.method });
}

// UPDATE INVOICE
export async function updateInvoice(id: string, body: UpdateInvoiceSchema) {
  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.update.endpoint(id), {
    method: InvoiceApi.update.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE INVOICE
export async function deleteInvoice(id: string) {
  return fetchJson(InvoiceApi.delete.endpoint(id), { method: InvoiceApi.delete.method });
}

// UPDATE INVOICE STATUS
export async function updateInvoiceStatus(id: string, status: string) {
  return fetchJson(InvoiceApi.updateStatus.endpoint(id), {
    method: InvoiceApi.updateStatus.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

// SEND INVOICE
export async function sendInvoice(id: string, body: { email: string; subject?: string; message?: string }) {
  return fetchJson(InvoiceApi.sendInvoice.endpoint(id), {
    method: InvoiceApi.sendInvoice.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// GENERATE INVOICE PDF
export async function generateInvoicePdf(id: string) {
  return fetchJson(InvoiceApi.generatePdf.endpoint(id), { method: InvoiceApi.generatePdf.method });
}

// ADD INVOICE ITEM
export async function addInvoiceItem(invoiceId: string, body: CreateInvoiceItemSchema) {
  const parsed = createInvoiceItemSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.addItem.endpoint(invoiceId), {
    method: InvoiceApi.addItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET INVOICE ITEMS
export async function getInvoiceItems(invoiceId: string) {
  return fetchJson<InvoiceItem[]>(InvoiceApi.getItems.endpoint(invoiceId), { 
    method: InvoiceApi.getItems.method 
  });
}

// UPDATE INVOICE ITEM
export async function updateInvoiceItem(invoiceId: string, itemId: string, body: CreateInvoiceItemSchema) {
  const parsed = createInvoiceItemSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.updateItem.endpoint(invoiceId, itemId), {
    method: InvoiceApi.updateItem.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE INVOICE ITEM
export async function deleteInvoiceItem(invoiceId: string, itemId: string) {
  return fetchJson(InvoiceApi.deleteItem.endpoint(invoiceId, itemId), { method: InvoiceApi.deleteItem.method });
}

// ADD INVOICE PAYMENT
export async function addInvoicePayment(invoiceId: string, body: CreateInvoicePaymentSchema) {
  const parsed = createInvoicePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.addPayment.endpoint(invoiceId), {
    method: InvoiceApi.addPayment.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET INVOICE PAYMENTS
export async function getInvoicePayments(invoiceId: string) {
  return fetchJson<InvoicePayment[]>(InvoiceApi.getPayments.endpoint(invoiceId), { 
    method: InvoiceApi.getPayments.method 
  });
}

// UPDATE INVOICE PAYMENT
export async function updateInvoicePayment(invoiceId: string, paymentId: string, body: CreateInvoicePaymentSchema) {
  const parsed = createInvoicePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.updatePayment.endpoint(invoiceId, paymentId), {
    method: InvoiceApi.updatePayment.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE INVOICE PAYMENT
export async function deleteInvoicePayment(invoiceId: string, paymentId: string) {
  return fetchJson(InvoiceApi.deletePayment.endpoint(invoiceId, paymentId), { method: InvoiceApi.deletePayment.method });
}

// CREATE INVOICE CONTACT
export async function createInvoiceContact(body: CreateInvoiceContactSchema) {
  const parsed = createInvoiceContactSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.createContact.endpoint(), {
    method: InvoiceApi.createContact.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL INVOICE CONTACTS
export async function getAllInvoiceContacts() {
  return fetchJson<InvoiceContact[]>(InvoiceApi.getAllContacts.endpoint(), { 
    method: InvoiceApi.getAllContacts.method 
  });
}

// GET INVOICE CONTACT BY ID
export async function getInvoiceContactById(id: string) {
  return fetchJson<InvoiceContact>(InvoiceApi.getContactById.endpoint(id), { method: InvoiceApi.getContactById.method });
}

// UPDATE INVOICE CONTACT
export async function updateInvoiceContact(id: string, body: CreateInvoiceContactSchema) {
  const parsed = createInvoiceContactSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(InvoiceApi.updateContact.endpoint(id), {
    method: InvoiceApi.updateContact.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE INVOICE CONTACT
export async function deleteInvoiceContact(id: string) {
  return fetchJson(InvoiceApi.deleteContact.endpoint(id), { method: InvoiceApi.deleteContact.method });
}

// GET CONTACT INVOICES
export async function getContactInvoices(contactId: string) {
  return fetchJson<Invoice[]>(InvoiceApi.getContactInvoices.endpoint(contactId), { method: InvoiceApi.getContactInvoices.method });
}
