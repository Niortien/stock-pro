import { z } from "zod";

// Produit
export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom du produit est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  quantity: z.number().int().min(0, "La quantité doit être un entier positif"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  minStock: z.number().min(0, "Le stock minimum doit être positif"),
  unit: z.string().min(1, "L'unité est requise"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Mouvement de stock
export const StockMovementSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "L'ID du produit est requis"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().min(1, "La quantité doit être positive"),
  reason: z.string().min(1, "La raison est requise"),
  reference: z.string().optional(),
  createdAt: z.date().optional(),
});

// Catégorie
export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  description: z.string().optional(),
  parent: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type StockMovement = z.infer<typeof StockMovementSchema>;
export type Category = z.infer<typeof CategorySchema>;

// Schémas de création pour les formulaires
export const createProductSchema = ProductSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const createCategorySchema = CategorySchema.omit({ id: true, createdAt: true, updatedAt: true });
export const createStockMovementSchema = StockMovementSchema.omit({ id: true, createdAt: true });

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type CreateStockMovementSchema = z.infer<typeof createStockMovementSchema>;
