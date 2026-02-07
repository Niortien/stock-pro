'use client'
import { useState, useEffect } from 'react';
import { Package, TrendingUp, ShoppingCart, CreditCard, AlertTriangle, FileText, BarChart3, PieChart, TrendingDown } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from './stat-card';
import { RecentSalesTable } from './recent-sales-table';
import { LowStockAlert } from './low-stock-alert';
import { getAllProducts } from '@/lib/services/stock/stock.action';
import { getAllSales } from '@/lib/services/sales/sale.action';
import { getAllPurchases } from '@/lib/services/purchases/purchase.action';
import { getAllCredits } from '@/lib/services/credits/credit.action';
import { getAllInvoices } from '@/lib/services/invoices/invoice.action';
import { toast } from 'sonner';

export default function DashboardComponent() {
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données depuis les API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les produits
        const productsResult = await getAllProducts();
        if (productsResult.success) {
          setProducts(productsResult.data);
        }

        // Charger les ventes
        const salesResult = await getAllSales();
        if (salesResult.success) {
          setSales(salesResult.data);
        }

        // Charger les achats
        const purchasesResult = await getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.data);
        }

        // Charger les crédits
        const creditsResult = await getAllCredits();
        if (creditsResult.success) {
          setCredits(creditsResult.data);
        }

        // Charger les factures
        const invoicesResult = await getAllInvoices();
        if (invoicesResult.success) {
          setInvoices(invoicesResult.data);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données du tableau de bord');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculer les statistiques
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalSales = sales.reduce((sum, s) => sum + (s.total || s.finalAmount || s.totalAmount || 0), 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || p.finalAmount || p.totalAmount || 0), 0);
  const totalCredits = credits.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalInvoices = invoices.reduce((sum, i) => sum + (i.total || i.finalAmount || 0), 0);
  const lowStockCount = products.filter(p => (p.quantity || 0) <= (p.minStock || 0)).length;

  // Données pour les graphiques
  const salesByCategory = sales.reduce((acc, sale) => {
    const category = sale.category || 'Autre';
    acc[category] = (acc[category] || 0) + (sale.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const stockByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Autre';
    acc[category] = (acc[category] || 0) + (product.quantity || 0);
    return acc;
  }, {} as Record<string, number>);

  const creditStatusData = {
    'En attente': credits.filter(c => c.status === 'PENDING').length,
    'Partielle': credits.filter(c => c.status === 'PARTIAL').length,
    'Payée': credits.filter(c => c.status === 'PAID').length,
  };

  const invoiceStatusData = {
    'Brouillon': invoices.filter(i => i.status === 'DRAFT').length,
    'Envoyée': invoices.filter(i => i.status === 'SENT').length,
    'Payée': invoices.filter(i => i.status === 'PAID').length,
  };

  // Composant de graphique en barres
  const BarChart = ({ data, title, color = 'blue' }: { data: Record<string, number>; title: string; color?: string }) => {
    const maxValue = Math.max(...Object.values(data), 1);
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-emerald-500',
      amber: 'bg-amber-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
    };

    return (
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <div className="space-y-3">
          {Object.entries(data).map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-20 text-sm text-muted-foreground truncate">{label}</div>
              <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm font-medium text-right">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Composant de graphique circulaire
  const PieChartComponent = ({ data, title }: { data: Record<string, number>; title: string }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500'];
    
    return (
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          {title}
        </h3>
        <div className="space-y-3">
          {Object.entries(data).map(([label, value], index) => {
            const percentage = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                <div className="flex-1 text-sm">{label}</div>
                <div className="text-sm font-medium">{value} ({percentage.toFixed(1)}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Tableau de bord" 
        description="Vue d'ensemble de votre activité"
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              title="Total Produits"
              value={products.length}
              subtitle="Types de produits"
              icon={Package}
              variant="primary"
            />
            <StatCard
              title="Stock Total"
              value={totalStock.toLocaleString()}
              subtitle="Unités en stock"
              icon={Package}
              variant="default"
            />
            <StatCard
              title="Ventes"
              value={`${(totalSales / 1000).toFixed(0)}K`}
              subtitle="FCFA ce mois"
              icon={TrendingUp}
              trend={{ value: 12, isPositive: true }}
              variant="success"
            />
            <StatCard
              title="Achats"
              value={`${(totalPurchases / 1000).toFixed(0)}K`}
              subtitle="FCFA ce mois"
              icon={ShoppingCart}
              trend={{ value: 8, isPositive: false }}
              variant="warning"
            />
            <StatCard
              title="Créances"
              value={`${(totalCredits / 1000).toFixed(0)}K`}
              subtitle="FCFA à récupérer"
              icon={CreditCard}
              variant="warning"
            />
            <StatCard
              title="Stock Faible"
              value={lowStockCount}
              subtitle="Produits à commander"
              icon={AlertTriangle}
              variant={lowStockCount > 0 ? 'danger' : 'success'}
            />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <BarChart 
          data={salesByCategory} 
          title="Ventes par catégorie" 
          color="green" 
        />
        <BarChart 
          data={stockByCategory} 
          title="Stock par catégorie" 
          color="blue" 
        />
        <PieChartComponent 
          data={creditStatusData} 
          title="Statut des créances" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PieChartComponent 
          data={invoiceStatusData} 
          title="Statut des factures" 
        />
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Résumé financier
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm font-medium text-emerald-800">Total Ventes</span>
              <span className="text-lg font-bold text-emerald-600">{totalSales.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Total Achats</span>
              <span className="text-lg font-bold text-blue-600">{totalPurchases.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-amber-800">Créances</span>
              <span className="text-lg font-bold text-amber-600">{totalCredits.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-800">Factures</span>
              <span className="text-lg font-bold text-purple-600">{totalInvoices.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentSalesTable sales={sales} />
        </div>
        <div>
          <LowStockAlert products={products} />
        </div>
      </div>
        </>
      )}
    </div>
  );
}
