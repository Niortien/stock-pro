import { z } from "zod";

// Achat
export const PurchaseSchema = z.object({
  id: z.string().optional(),
  reference: z.string().min(1, "La référence est requise"),
  supplierId: z.string().min(1, "L'ID du fournisseur est requis"),
  date: z.string().min(1, "La date est requise"),
  status: z.enum(["PENDING", "RECEIVED", "CANCELLED", "PARTIAL"]).default("PENDING"),
  totalAmount: z.number().min(0, "Le montant total doit être positif"),
  discountAmount: z.number().min(0, "Le montant de remise doit être positif").default(0),
  taxAmount: z.number().min(0, "Le montant de taxe doit être positif").default(0),
  finalAmount: z.number().min(0, "Le montant final doit être positif"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).default("PENDING"),
  expectedDeliveryDate: z.string().optional(),
  actualDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Détail d'achat
export const PurchaseItemSchema = z.object({
  id: z.string().optional(),
  purchaseId: z.string().min(1, "L'ID de l'achat est requis"),
  productId: z.string().min(1, "L'ID du produit est requis"),
  quantity: z.number().min(1, "La quantité doit être positive"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  totalPrice: z.number().min(0, "Le prix total doit être positif"),
  discount: z.number().min(0, "La remise doit être positive").default(0),
  receivedQuantity: z.number().min(0).default(0),
  createdAt: z.date().optional(),
});

// Fournisseur
export const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom du fournisseur est requis"),
  email: z.string().email("L'email doit être valide").optional(),
  phone: z.string().min(1, "Le téléphone est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().default(true),
  totalPurchases: z.number().min(0).default(0),
  lastPurchaseDate: z.date().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;
export type PurchaseItem = z.infer<typeof PurchaseItemSchema>;
export type Supplier = z.infer<typeof SupplierSchema>;

// Schémas de création pour les formulaires
export const createPurchaseSchema = PurchaseSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const createPurchaseItemSchema = PurchaseItemSchema.omit({ id: true, createdAt: true });
export const createSupplierSchema = SupplierSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;
export type CreatePurchaseItemSchema = z.infer<typeof createPurchaseItemSchema>;
export type CreateSupplierSchema = z.infer<typeof createSupplierSchema>;
