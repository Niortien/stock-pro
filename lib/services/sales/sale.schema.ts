import { z } from "zod";

// Vente
export const SaleSchema = z.object({
  id: z.string().optional(),
  reference: z.string().min(1, "La référence est requise"),
  customerId: z.string().min(1, "L'ID du client est requis"),
  date: z.string().min(1, "La date est requise"),
  status: z.enum(["PENDING", "PAID", "CANCELLED", "REFUNDED"]).default("PENDING"),
  totalAmount: z.number().min(0, "Le montant total doit être positif"),
  discountAmount: z.number().min(0, "Le montant de remise doit être positif").default(0),
  taxAmount: z.number().min(0, "Le montant de taxe doit être positif").default(0),
  finalAmount: z.number().min(0, "Le montant final doit être positif"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).default("PENDING"),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Détail de vente
export const SaleItemSchema = z.object({
  id: z.string().optional(),
  saleId: z.string().min(1, "L'ID de la vente est requis"),
  productId: z.string().min(1, "L'ID du produit est requis"),
  quantity: z.number().min(1, "La quantité doit être positive"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  totalPrice: z.number().min(0, "Le prix total doit être positif"),
  discount: z.number().min(0, "La remise doit être positive").default(0),
  createdAt: z.date().optional(),
});

// Client
export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom du client est requis"),
  email: z.string().email("L'email doit être valide").optional(),
  phone: z.string().min(1, "Le téléphone est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().default(true),
  totalPurchases: z.number().min(0).default(0),
  lastPurchaseDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Sale = z.infer<typeof SaleSchema>;
export type SaleItem = z.infer<typeof SaleItemSchema>;
export type Customer = z.infer<typeof CustomerSchema>;

// Schémas de création pour les formulaires
export const createSaleSchema = SaleSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const createSaleItemSchema = SaleItemSchema.omit({ id: true, createdAt: true });
export const createCustomerSchema = CustomerSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type CreateSaleSchema = z.infer<typeof createSaleSchema>;
export type CreateSaleItemSchema = z.infer<typeof createSaleItemSchema>;
export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;