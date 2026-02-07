'use client'
import { useState, useEffect } from 'react';
import { Package, TrendingUp, ShoppingCart, CreditCard, AlertTriangle, FileText } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from './stat-card';
import { RecentSalesTable } from './recent-sales-table';
import { LowStockAlert } from './low-stock-alert';
import { getAllProducts } from '@/lib/services/stock/stock.action';
import { getAllSales } from '@/lib/services/sales/sale.action';
import { getAllPurchases } from '@/lib/services/purchases/purchase.action';
import { toast } from 'sonner';

export default function DashboardComponent() {
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
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
  const totalCredits = sales.filter(s => !s.isPaid && s.paymentStatus !== 'PAID').reduce((sum, s) => sum + (s.total || s.finalAmount || s.totalAmount || 0), 0);
  const lowStockCount = products.filter(p => (p.quantity || 0) <= (p.minStock || 0)).length;

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
          variant="default"
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
