'use server';

import { BASE_URL } from "@/baseurl/baseurl";

const origine: string = "Statistiques Achats";

const PurchasesStatsApi = {
  getPurchasesStats: { method: "GET", endpoint: () => `${BASE_URL}/purchases/stats` },
  getSupplierStats: { method: "GET", endpoint: () => `${BASE_URL}/suppliers/stats` },
  getTopSuppliers: { method: "GET", endpoint: () => `${BASE_URL}/purchases/top-suppliers` },
  getRecentPurchases: { method: "GET", endpoint: () => `${BASE_URL}/purchases/recent` },
  getPurchasesByPeriod: { method: "GET", endpoint: (period: string) => `${BASE_URL}/purchases/stats/period?period=${period}` },
  getPurchasesByCategory: { method: "GET", endpoint: () => `${BASE_URL}/purchases/stats/by-category` },
  getSupplierPurchases: { method: "GET", endpoint: (supplierId: string) => `${BASE_URL}/suppliers/${supplierId}/purchases` },
  getPendingPurchases: { method: "GET", endpoint: () => `${BASE_URL}/purchases/pending` },
  getOverduePurchases: { method: "GET", endpoint: () => `${BASE_URL}/purchases/overdue` },
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

// GET PURCHASES STATS
export async function getPurchasesStats() {
  return fetchJson(PurchasesStatsApi.getPurchasesStats.endpoint(), { method: PurchasesStatsApi.getPurchasesStats.method });
}

// GET SUPPLIER STATS
export async function getSupplierStats() {
  return fetchJson(PurchasesStatsApi.getSupplierStats.endpoint(), { method: PurchasesStatsApi.getSupplierStats.method });
}

// GET TOP SUPPLIERS
export async function getTopSuppliers() {
  return fetchJson(PurchasesStatsApi.getTopSuppliers.endpoint(), { method: PurchasesStatsApi.getTopSuppliers.method });
}

// GET RECENT PURCHASES
export async function getRecentPurchases() {
  return fetchJson(PurchasesStatsApi.getRecentPurchases.endpoint(), { method: PurchasesStatsApi.getRecentPurchases.method });
}

// GET PURCHASES BY PERIOD
export async function getPurchasesByPeriod(period: string) {
  return fetchJson(PurchasesStatsApi.getPurchasesByPeriod.endpoint(period), { method: PurchasesStatsApi.getPurchasesByPeriod.method });
}

// GET PURCHASES BY CATEGORY
export async function getPurchasesByCategory() {
  return fetchJson(PurchasesStatsApi.getPurchasesByCategory.endpoint(), { method: PurchasesStatsApi.getPurchasesByCategory.method });
}

// GET SUPPLIER PURCHASES
export async function getSupplierPurchases(supplierId: string) {
  return fetchJson(PurchasesStatsApi.getSupplierPurchases.endpoint(supplierId), { method: PurchasesStatsApi.getSupplierPurchases.method });
}

// GET PENDING PURCHASES
export async function getPendingPurchases() {
  return fetchJson(PurchasesStatsApi.getPendingPurchases.endpoint(), { method: PurchasesStatsApi.getPendingPurchases.method });
}

// GET OVERDUE PURCHASES
export async function getOverduePurchases() {
  return fetchJson(PurchasesStatsApi.getOverduePurchases.endpoint(), { method: PurchasesStatsApi.getOverduePurchases.method });
}
