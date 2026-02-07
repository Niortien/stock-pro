'use server';

import { BASE_URL } from "@/baseurl/baseurl";

const origine: string = "Statistiques Factures";

const InvoicesStatsApi = {
  getInvoicesStats: { method: "GET", endpoint: () => `${BASE_URL}/invoices/stats` },
  getOverdueInvoices: { method: "GET", endpoint: () => `${BASE_URL}/invoices/overdue` },
  getUnpaidInvoices: { method: "GET", endpoint: () => `${BASE_URL}/invoices/unpaid` },
  getInvoiceStatsByType: { method: "GET", endpoint: () => `${BASE_URL}/invoices/stats/by-type` },
  getInvoicesByPeriod: { method: "GET", endpoint: (period: string) => `${BASE_URL}/invoices/stats/period?period=${period}` },
  getRevenueByMonth: { method: "GET", endpoint: () => `${BASE_URL}/invoices/revenue/monthly` },
  getTopCustomers: { method: "GET", endpoint: () => `${BASE_URL}/invoices/top-customers` },
  getInvoiceAging: { method: "GET", endpoint: () => `${BASE_URL}/invoices/aging` },
  getPaymentStats: { method: "GET", endpoint: () => `${BASE_URL}/invoices/payment-stats` },
  getTaxSummary: { method: "GET", endpoint: () => `${BASE_URL}/invoices/tax-summary` },
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

// GET INVOICES STATS
export async function getInvoicesStats() {
  return fetchJson(InvoicesStatsApi.getInvoicesStats.endpoint(), { method: InvoicesStatsApi.getInvoicesStats.method });
}

// GET OVERDUE INVOICES
export async function getOverdueInvoices() {
  return fetchJson(InvoicesStatsApi.getOverdueInvoices.endpoint(), { method: InvoicesStatsApi.getOverdueInvoices.method });
}

// GET UNPAID INVOICES
export async function getUnpaidInvoices() {
  return fetchJson(InvoicesStatsApi.getUnpaidInvoices.endpoint(), { method: InvoicesStatsApi.getUnpaidInvoices.method });
}

// GET INVOICE STATS BY TYPE
export async function getInvoiceStatsByType() {
  return fetchJson(InvoicesStatsApi.getInvoiceStatsByType.endpoint(), { method: InvoicesStatsApi.getInvoiceStatsByType.method });
}

// GET INVOICES BY PERIOD
export async function getInvoicesByPeriod(period: string) {
  return fetchJson(InvoicesStatsApi.getInvoicesByPeriod.endpoint(period), { method: InvoicesStatsApi.getInvoicesByPeriod.method });
}

// GET REVENUE BY MONTH
export async function getRevenueByMonth() {
  return fetchJson(InvoicesStatsApi.getRevenueByMonth.endpoint(), { method: InvoicesStatsApi.getRevenueByMonth.method });
}

// GET TOP CUSTOMERS
export async function getTopCustomers() {
  return fetchJson(InvoicesStatsApi.getTopCustomers.endpoint(), { method: InvoicesStatsApi.getTopCustomers.method });
}

// GET INVOICE AGING
export async function getInvoiceAging() {
  return fetchJson(InvoicesStatsApi.getInvoiceAging.endpoint(), { method: InvoicesStatsApi.getInvoiceAging.method });
}

// GET PAYMENT STATS
export async function getPaymentStats() {
  return fetchJson(InvoicesStatsApi.getPaymentStats.endpoint(), { method: InvoicesStatsApi.getPaymentStats.method });
}

// GET TAX SUMMARY
export async function getTaxSummary() {
  return fetchJson(InvoicesStatsApi.getTaxSummary.endpoint(), { method: InvoicesStatsApi.getTaxSummary.method });
}
