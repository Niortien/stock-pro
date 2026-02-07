import { z } from "zod";

// Créance
export const CreditSchema = z.object({
  id: z.string().optional(),
  clientName: z.string().min(1, "Le nom du client est requis"),
  amount: z.number().min(0, "Le montant doit être positif"),
  remainingAmount: z.number().min(0, "Le montant restant doit être positif"),
  description: z.string().optional(),
  date: z.string().min(1, "La date est requise"),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]).default("PENDING"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK"]).optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Paiement de créance
export const CreditPaymentSchema = z.object({
  id: z.string().optional(),
  creditId: z.string().min(1, "L'ID de la créance est requis"),
  amount: z.number().min(0, "Le montant doit être positif"),
  paymentDate: z.string().min(1, "La date de paiement est requise"),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHECK"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
});

// Client (pour les créances)
export const CreditCustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom du client est requis"),
  email: z.string().email("L'email doit être valide").optional(),
  phone: z.string().min(1, "Le téléphone est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean().default(true),
  totalCredits: z.number().min(0).default(0),
  paidCredits: z.number().min(0).default(0),
  outstandingCredits: z.number().min(0).default(0),
  lastCreditDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Credit = z.infer<typeof CreditSchema>;
export type CreditPayment = z.infer<typeof CreditPaymentSchema>;
export type CreditCustomer = z.infer<typeof CreditCustomerSchema>;

// Schémas de création pour les formulaires
export const createCreditSchema = CreditSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const createCreditPaymentSchema = CreditPaymentSchema.omit({ id: true, createdAt: true });
export const createCreditCustomerSchema = CreditCustomerSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type CreateCreditSchema = z.infer<typeof createCreditSchema>;
export type CreateCreditPaymentSchema = z.infer<typeof createCreditPaymentSchema>;
export type CreateCreditCustomerSchema = z.infer<typeof createCreditCustomerSchema>;
