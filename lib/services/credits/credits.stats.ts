'use server';

import { BASE_URL } from "@/baseurl/baseurl";

const origine: string = "Statistiques Créances";

const CreditsStatsApi = {
  getCreditsStats: { method: "GET", endpoint: () => `${BASE_URL}/credits/stats` },
  getOverdueCredits: { method: "GET", endpoint: () => `${BASE_URL}/credits/overdue` },
  getCustomerCreditsStats: { method: "GET", endpoint: () => `${BASE_URL}/credit-customers/stats` },
  getTopDebtors: { method: "GET", endpoint: () => `${BASE_URL}/credits/top-debtors` },
  getCreditsByPeriod: { method: "GET", endpoint: (period: string) => `${BASE_URL}/credits/stats/period?period=${period}` },
  getPaymentHistory: { method: "GET", endpoint: (customerId: string) => `${BASE_URL}/credit-customers/${customerId}/payment-history` },
  getCreditAging: { method: "GET", endpoint: () => `${BASE_URL}/credits/aging` },
  getCollectionRate: { method: "GET", endpoint: () => `${BASE_URL}/credits/collection-rate` },
  getMonthlyCollections: { method: "GET", endpoint: () => `${BASE_URL}/credits/monthly-collections` },
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

// GET CREDITS STATS
export async function getCreditsStats() {
  return fetchJson(CreditsStatsApi.getCreditsStats.endpoint(), { method: CreditsStatsApi.getCreditsStats.method });
}

// GET OVERDUE CREDITS
export async function getOverdueCredits() {
  return fetchJson(CreditsStatsApi.getOverdueCredits.endpoint(), { method: CreditsStatsApi.getOverdueCredits.method });
}

// GET CUSTOMER CREDITS STATS
export async function getCustomerCreditsStats() {
  return fetchJson(CreditsStatsApi.getCustomerCreditsStats.endpoint(), { method: CreditsStatsApi.getCustomerCreditsStats.method });
}

// GET TOP DEBTORS
export async function getTopDebtors() {
  return fetchJson(CreditsStatsApi.getTopDebtors.endpoint(), { method: CreditsStatsApi.getTopDebtors.method });
}

// GET CREDITS BY PERIOD
export async function getCreditsByPeriod(period: string) {
  return fetchJson(CreditsStatsApi.getCreditsByPeriod.endpoint(period), { method: CreditsStatsApi.getCreditsByPeriod.method });
}

// GET PAYMENT HISTORY
export async function getPaymentHistory(customerId: string) {
  return fetchJson(CreditsStatsApi.getPaymentHistory.endpoint(customerId), { method: CreditsStatsApi.getPaymentHistory.method });
}

// GET CREDIT AGING
export async function getCreditAging() {
  return fetchJson(CreditsStatsApi.getCreditAging.endpoint(), { method: CreditsStatsApi.getCreditAging.method });
}

// GET COLLECTION RATE
export async function getCollectionRate() {
  return fetchJson(CreditsStatsApi.getCollectionRate.endpoint(), { method: CreditsStatsApi.getCollectionRate.method });
}

// GET MONTHLY COLLECTIONS
export async function getMonthlyCollections() {
  return fetchJson(CreditsStatsApi.getMonthlyCollections.endpoint(), { method: CreditsStatsApi.getMonthlyCollections.method });
}
