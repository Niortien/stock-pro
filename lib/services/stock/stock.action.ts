'use server';

import { BASE_URL } from "@/baseurl/baseurl";
import { createProductSchema, createCategorySchema, createStockMovementSchema, CreateProductSchema, CreateCategorySchema, CreateStockMovementSchema } from './stock.schema';
import { Product, StockMovement, Category } from './stock.schema';

const origine: string = "Actions Stock";

const StockApi = {
  // Produits
  create: { method: "POST", endpoint: () => `${BASE_URL}/products` },
  getAll: { method: "GET", endpoint: () => `${BASE_URL}/products` },
  getById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/stock/products/${id}` },
  update: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/stock/products/${id}` },
  delete: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/products/${id}` },
  
  // Catégories
  createCategory: { method: "POST", endpoint: () => `${BASE_URL}/stock/categories` },
  getAllCategories: { method: "GET", endpoint: () => `${BASE_URL}/stock/categories` },
  getCategoryById: { method: "GET", endpoint: (id: string) => `${BASE_URL}/stock/categories/${id}` },
  updateCategory: { method: "PATCH", endpoint: (id: string) => `${BASE_URL}/stock/categories/${id}` },
  deleteCategory: { method: "DELETE", endpoint: (id: string) => `${BASE_URL}/stock/categories/${id}` },
  
  // Mouvements de stock
  createMovement: { method: "POST", endpoint: () => `${BASE_URL}/stock/movements` },
  getAllMovements: { method: "GET", endpoint: () => `${BASE_URL}/stock/movements` },
  getMovementsByProduct: { method: "GET", endpoint: (productId: string) => `${BASE_URL}/stock/movements?productId=${productId}` },
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

// CREATE PRODUCT
export async function createProduct(body: CreateProductSchema) {
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(StockApi.create.endpoint(), {
    method: StockApi.create.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL PRODUCTS
export async function getAllProducts() {
  return fetchJson<Product[]>(StockApi.getAll.endpoint(), { 
    method: StockApi.getAll.method 
  });
}

// GET PRODUCT BY ID
export async function getProductById(id: string) {
  return fetchJson<Product>(StockApi.getById.endpoint(id), { method: StockApi.getById.method });
}

// UPDATE PRODUCT
export async function updateProduct(id: string, body: CreateProductSchema) {
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(StockApi.update.endpoint(id), {
    method: StockApi.update.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE PRODUCT
export async function deleteProduct(id: string) {
  return fetchJson(StockApi.delete.endpoint(id), { method: StockApi.delete.method });
}

// CREATE CATEGORY
export async function createCategory(body: CreateCategorySchema) {
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(StockApi.createCategory.endpoint(), {
    method: StockApi.createCategory.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL CATEGORIES
export async function getAllCategories() {
  return fetchJson<Category[]>(StockApi.getAllCategories.endpoint(), { 
    method: StockApi.getAllCategories.method 
  });
}

// GET CATEGORY BY ID
export async function getCategoryById(id: string) {
  return fetchJson<Category>(StockApi.getCategoryById.endpoint(id), { method: StockApi.getCategoryById.method });
}

// UPDATE CATEGORY
export async function updateCategory(id: string, body: CreateCategorySchema) {
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(StockApi.updateCategory.endpoint(id), {
    method: StockApi.updateCategory.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// DELETE CATEGORY
export async function deleteCategory(id: string) {
  return fetchJson(StockApi.deleteCategory.endpoint(id), { method: StockApi.deleteCategory.method });
}

// CREATE STOCK MOVEMENT
export async function createStockMovement(body: CreateStockMovementSchema) {
  const parsed = createStockMovementSchema.safeParse(body);
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues.map((issue: any) => issue.message).join(", ") 
    };
  }

  return fetchJson(StockApi.createMovement.endpoint(), {
    method: StockApi.createMovement.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
}

// GET ALL STOCK MOVEMENTS
export async function getAllStockMovements() {
  return fetchJson<StockMovement[]>(StockApi.getAllMovements.endpoint(), { 
    method: StockApi.getAllMovements.method 
  });
}

// GET STOCK MOVEMENTS BY PRODUCT
export async function getStockMovementsByProduct(productId: string) {
  return fetchJson<StockMovement[]>(StockApi.getMovementsByProduct.endpoint(productId), { 
    method: StockApi.getMovementsByProduct.method 
  });
}
