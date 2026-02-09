import { z } from "zod";

// Facture
export const InvoiceSchema = z.object({
  id: z.string().optional(),
  reference: z.string().min(1, "La référence est requise"),
  customerId: z.string().min(1, "L'ID du client est requis"),
  saleId: z.string().optional(),
  purchaseId: z.string().optional(),
  type: z.enum(["SALE", "PURCHASE", "CREDIT_NOTE", "DEBIT_NOTE"]).default("SALE"),
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"]).default("DRAFT"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  totalAmount: z.number().min(0, "Le montant total doit être positif"),
  taxAmount: z.number().min(0, "Le montant de taxe doit être positif").default(0),
  discountAmount: z.number().min(0, "Le montant de remise doit être positif").default(0),
  finalAmount: z.number().min(0, "Le montant final doit être positif"),
  paidAmount: z.number().min(0).default(0),
  remainingAmount: z.number().min(0),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Article de facture
export const InvoiceItemSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string().min(1, "L'ID de la facture est requis"),
  productId: z.string().min(1, "L'ID du produit est requis"),
  description: z.string().min(1, "La description est requise"),
  quantity: z.number().min(1, "La quantité doit être positive"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  totalPrice: z.number().min(0, "Le prix total doit être positif"),
  taxRate: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  createdAt: z.date().optional(),
});

// Paiement de facture
export const InvoicePaymentSchema = z.object({
  id: z.string().optional(),
  invoiceId: z.string().min(1, "L'ID de la facture est requis"),
  amount: z.number().min(0, "Le montant doit être positif"),
  paymentDate: z.string().min(1, "La date de paiement est requise"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
});

// Client/Fournisseur pour factures
export const InvoiceContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom est requis"),
  type: z.enum(["CUSTOMER", "SUPPLIER"]),
  email: z.string().email("L'email doit être valide").optional(),
  phone: z.string().min(1, "Le téléphone est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  isActive: z.boolean().default(true),
  totalInvoices: z.number().min(0).default(0),
  paidInvoices: z.number().min(0).default(0),
  outstandingInvoices: z.number().min(0).default(0),
  lastInvoiceDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type InvoicePayment = z.infer<typeof InvoicePaymentSchema>;
export type InvoiceContact = z.infer<typeof InvoiceContactSchema>;

// Schémas de création pour les formulaires
export const createInvoiceSchema = InvoiceSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const createInvoiceItemSchema = InvoiceItemSchema.omit({ id: true, createdAt: true });
export const createInvoicePaymentSchema = InvoicePaymentSchema.omit({ id: true, createdAt: true });
export const createInvoiceContactSchema = InvoiceContactSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Schéma de mise à jour simplifié pour le composant
export const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().optional(),
  clientName: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number(),
  })).optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  date: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"]).optional(),
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceItemSchema = z.infer<typeof createInvoiceItemSchema>;
export type CreateInvoicePaymentSchema = z.infer<typeof createInvoicePaymentSchema>;
export type CreateInvoiceContactSchema = z.infer<typeof createInvoiceContactSchema>;
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
