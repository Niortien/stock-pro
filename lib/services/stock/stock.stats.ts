'use server';

import { BASE_URL } from "@/baseurl/baseurl";

const origine: string = "Statistiques Stock";

const StockStatsApi = {
  getStockStats: { method: "GET", endpoint: () => `${BASE_URL}/stock/stats` },
  getLowStockProducts: { method: "GET", endpoint: () => `${BASE_URL}/stock/low-stock` },
  getOutStockProducts: { method: "GET", endpoint: () => `${BASE_URL}/stock/out-of-stock` },
  getTopSellingProducts: { method: "GET", endpoint: () => `${BASE_URL}/stock/top-selling` },
  getStockMovementsByPeriod: { method: "GET", endpoint: (period: string) => `${BASE_URL}/stock/movements/period?period=${period}` },
  getStockByCategory: { method: "GET", endpoint: () => `${BASE_URL}/stock/by-category` },
  getProductStockHistory: { method: "GET", endpoint: (productId: string) => `${BASE_URL}/stock/products/${productId}/history` },
  getStockValue: { method: "GET", endpoint: () => `${BASE_URL}/stock/value` },
  getStockTurnover: { method: "GET", endpoint: () => `${BASE_URL}/stock/turnover` },
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

// GET STOCK STATS
export async function getStockStats() {
  return fetchJson(StockStatsApi.getStockStats.endpoint(), { method: StockStatsApi.getStockStats.method });
}

// GET LOW STOCK PRODUCTS
export async function getLowStockProducts() {
  return fetchJson(StockStatsApi.getLowStockProducts.endpoint(), { method: StockStatsApi.getLowStockProducts.method });
}

// GET OUT OF STOCK PRODUCTS
export async function getOutStockProducts() {
  return fetchJson(StockStatsApi.getOutStockProducts.endpoint(), { method: StockStatsApi.getOutStockProducts.method });
}

// GET TOP SELLING PRODUCTS
export async function getTopSellingProducts() {
  return fetchJson(StockStatsApi.getTopSellingProducts.endpoint(), { method: StockStatsApi.getTopSellingProducts.method });
}

// GET STOCK MOVEMENTS BY PERIOD
export async function getStockMovementsByPeriod(period: string) {
  return fetchJson(StockStatsApi.getStockMovementsByPeriod.endpoint(period), { method: StockStatsApi.getStockMovementsByPeriod.method });
}

// GET STOCK BY CATEGORY
export async function getStockByCategory() {
  return fetchJson(StockStatsApi.getStockByCategory.endpoint(), { method: StockStatsApi.getStockByCategory.method });
}

// GET PRODUCT STOCK HISTORY
export async function getProductStockHistory(productId: string) {
  return fetchJson(StockStatsApi.getProductStockHistory.endpoint(productId), { method: StockStatsApi.getProductStockHistory.method });
}

// GET STOCK VALUE
export async function getStockValue() {
  return fetchJson(StockStatsApi.getStockValue.endpoint(), { method: StockStatsApi.getStockValue.method });
}

// GET STOCK TURNOVER
export async function getStockTurnover() {
  return fetchJson(StockStatsApi.getStockTurnover.endpoint(), { method: StockStatsApi.getStockTurnover.method });
}
