'use client'
import { Package, TrendingUp, ShoppingCart, CreditCard, AlertTriangle, FileText } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { mockProducts, mockSales, mockPurchases, mockCredits } from '@/data/mockData';
import { StatCard } from './stat-card';
import { RecentSalesTable } from './recent-sales-table';
import { LowStockAlert } from './low-stock-alert';

export default function DashboardComponent() {
  const totalStock = mockProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalSales = mockSales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = mockPurchases.reduce((sum, p) => sum + p.total, 0);
  const totalCredits = mockCredits.filter(c => c.status !== 'paid').reduce((sum, c) => sum + c.remainingAmount, 0);
  const lowStockCount = mockProducts.filter(p => p.quantity <= p.minStock).length;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Tableau de bord" 
        description="Vue d'ensemble de votre activité"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Total Produits"
          value={mockProducts.length}
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
          <RecentSalesTable sales={mockSales} />
        </div>
        <div>
          <LowStockAlert products={mockProducts} />
        </div>
      </div>
    </div>
  );
}
