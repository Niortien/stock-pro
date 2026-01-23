import { Credit, Invoice, Product, Purchase, Sale } from "@/types/type";


export const mockProducts: Product[] = [
  { id: '1', name: 'Coca-Cola 33cl', category: 'Sodas', quantity: 150, unitPrice: 500, minStock: 50, unit: 'bouteilles', createdAt: new Date() },
  { id: '2', name: 'Fanta Orange 33cl', category: 'Sodas', quantity: 120, unitPrice: 500, minStock: 50, unit: 'bouteilles', createdAt: new Date() },
  { id: '3', name: 'Eau Minérale 1.5L', category: 'Eau', quantity: 200, unitPrice: 350, minStock: 100, unit: 'bouteilles', createdAt: new Date() },
  { id: '4', name: 'Jus de Mangue 1L', category: 'Jus', quantity: 45, unitPrice: 1200, minStock: 30, unit: 'bouteilles', createdAt: new Date() },
  { id: '5', name: 'Bière Flag 65cl', category: 'Bières', quantity: 80, unitPrice: 800, minStock: 40, unit: 'bouteilles', createdAt: new Date() },
  { id: '6', name: 'Sprite 33cl', category: 'Sodas', quantity: 90, unitPrice: 500, minStock: 50, unit: 'bouteilles', createdAt: new Date() },
  { id: '7', name: 'Red Bull 25cl', category: 'Énergisantes', quantity: 25, unitPrice: 1500, minStock: 20, unit: 'canettes', createdAt: new Date() },
  { id: '8', name: 'Vin Rouge 75cl', category: 'Vins', quantity: 30, unitPrice: 5000, minStock: 15, unit: 'bouteilles', createdAt: new Date() },
];

export const mockSales: Sale[] = [
  { id: '1', productId: '1', productName: 'Coca-Cola 33cl', quantity: 24, unitPrice: 500, total: 12000, clientName: 'Restaurant Le Jardin', date: new Date('2024-12-10'), isPaid: true },
  { id: '2', productId: '3', productName: 'Eau Minérale 1.5L', quantity: 48, unitPrice: 350, total: 16800, clientName: 'Hôtel Palm Beach', date: new Date('2024-12-10'), isPaid: true },
  { id: '3', productId: '5', productName: 'Bière Flag 65cl', quantity: 36, unitPrice: 800, total: 28800, clientName: 'Bar Le Sunset', date: new Date('2024-12-09'), isPaid: false },
  { id: '4', productId: '2', productName: 'Fanta Orange 33cl', quantity: 12, unitPrice: 500, total: 6000, date: new Date('2024-12-09'), isPaid: true },
];

export const mockPurchases: Purchase[] = [
  { id: '1', productId: '1', productName: 'Coca-Cola 33cl', quantity: 100, unitPrice: 400, total: 40000, supplierName: 'SOBRADIS', date: new Date('2024-12-08'), isPaid: true },
  { id: '2', productId: '3', productName: 'Eau Minérale 1.5L', quantity: 200, unitPrice: 280, total: 56000, supplierName: 'Source Vitale', date: new Date('2024-12-07'), isPaid: false },
  { id: '3', productId: '5', productName: 'Bière Flag 65cl', quantity: 120, unitPrice: 650, total: 78000, supplierName: 'Brasseries du Cameroun', date: new Date('2024-12-05'), isPaid: true },
];

export const mockCredits: Credit[] = [
  { id: '1', clientName: 'Restaurant Le Jardin', amount: 50000, remainingAmount: 25000, description: 'Commande du 05/12', date: new Date('2024-12-05'), dueDate: new Date('2024-12-20'), status: 'partial' },
  { id: '2', clientName: 'Bar Le Sunset', amount: 28800, remainingAmount: 28800, description: 'Achat bières', date: new Date('2024-12-09'), dueDate: new Date('2024-12-25'), status: 'pending' },
  { id: '3', clientName: 'Épicerie Central', amount: 15000, remainingAmount: 0, description: 'Sodas variés', date: new Date('2024-12-01'), dueDate: new Date('2024-12-15'), status: 'paid' },
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'FAC-2024-001',
    clientName: 'Restaurant Le Jardin',
    items: [
      { productId: '1', productName: 'Coca-Cola 33cl', quantity: 24, unitPrice: 500, total: 12000 },
      { productId: '2', productName: 'Fanta Orange 33cl', quantity: 24, unitPrice: 500, total: 12000 },
    ],
    subtotal: 24000,
    tax: 4560,
    total: 28560,
    date: new Date('2024-12-10'),
    status: 'paid',
  },
  {
    id: '2',
    invoiceNumber: 'FAC-2024-002',
    clientName: 'Hôtel Palm Beach',
    items: [
      { productId: '3', productName: 'Eau Minérale 1.5L', quantity: 100, unitPrice: 350, total: 35000 },
    ],
    subtotal: 35000,
    tax: 6650,
    total: 41650,
    date: new Date('2024-12-11'),
    status: 'sent',
  },
];
