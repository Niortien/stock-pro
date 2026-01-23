export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  minStock: number;
  unit: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  clientName?: string;
  date: Date;
  isPaid: boolean;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  supplierName: string;
  date: Date;
  isPaid: boolean;
}

export interface Credit {
  id: string;
  clientName: string;
  amount: number;
  remainingAmount: number;
  description: string;
  date: Date;
  dueDate: Date;
  status: 'pending' | 'partial' | 'paid';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: Date;
  status: 'draft' | 'sent' | 'paid';
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalSales: number;
  totalPurchases: number;
  totalCredits: number;
  lowStockProducts: number;
}
