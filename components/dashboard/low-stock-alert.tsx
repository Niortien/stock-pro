
import { Product } from '@/types/type';
import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);

  if (lowStockProducts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm animate-slide-up">
        <h3 className="text-lg font-semibold text-foreground mb-4">Alertes de stock</h3>
        <div className="flex items-center justify-center py-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm text-muted-foreground">Tous les produits ont un stock suffisant</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm animate-slide-up">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Alertes de stock</h3>
        <p className="text-sm text-muted-foreground">{lowStockProducts.length} produit(s) en stock faible</p>
      </div>
      <div className="divide-y divide-border">
        {lowStockProducts.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive "  />
              </div>
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-destructive">{product.quantity} {product.unit}</p>
              <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
