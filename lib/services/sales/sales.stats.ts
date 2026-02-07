'use server';

import { BASE_URL } from "@/baseurl/baseurl";

const origine: string = "Statistiques Ventes";

const SalesStatsApi = {
  getSalesStats: { method: "GET", endpoint: () => `${BASE_URL}/sales/stats` },
  getCustomerStats: { method: "GET", endpoint: () => `${BASE_URL}/customers/stats` },
  getTopProducts: { method: "GET", endpoint: () => `${BASE_URL}/sales/top-products` },
  getRecentSales: { method: "GET", endpoint: () => `${BASE_URL}/sales/recent` },
  getSalesByPeriod: { method: "GET", endpoint: (period: string) => `${BASE_URL}/sales/stats/period?period=${period}` },
  getSalesByCategory: { method: "GET", endpoint: () => `${BASE_URL}/sales/stats/by-category` },
  getCustomerPurchases: { method: "GET", endpoint: (customerId: string) => `${BASE_URL}/customers/${customerId}/purchases` },
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

// GET SALES STATS
export async function getSalesStats() {
  return fetchJson(SalesStatsApi.getSalesStats.endpoint(), { method: SalesStatsApi.getSalesStats.method });
}

// GET CUSTOMER STATS
export async function getCustomerStats() {
  return fetchJson(SalesStatsApi.getCustomerStats.endpoint(), { method: SalesStatsApi.getCustomerStats.method });
}

// GET TOP PRODUCTS
export async function getTopProducts() {
  return fetchJson(SalesStatsApi.getTopProducts.endpoint(), { method: SalesStatsApi.getTopProducts.method });
}

// GET RECENT SALES
export async function getRecentSales() {
  return fetchJson(SalesStatsApi.getRecentSales.endpoint(), { method: SalesStatsApi.getRecentSales.method });
}

// GET SALES BY PERIOD
export async function getSalesByPeriod(period: string) {
  return fetchJson(SalesStatsApi.getSalesByPeriod.endpoint(period), { method: SalesStatsApi.getSalesByPeriod.method });
}

// GET SALES BY CATEGORY
export async function getSalesByCategory() {
  return fetchJson(SalesStatsApi.getSalesByCategory.endpoint(), { method: SalesStatsApi.getSalesByCategory.method });
}

// GET CUSTOMER PURCHASES
export async function getCustomerPurchases(customerId: string) {
  return fetchJson(SalesStatsApi.getCustomerPurchases.endpoint(customerId), { method: SalesStatsApi.getCustomerPurchases.method });
}
