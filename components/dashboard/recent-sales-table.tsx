
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/types/type';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentSalesTableProps {
  sales: Sale[];
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm animate-slide-up">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Ventes récentes</h3>
        <p className="text-sm text-muted-foreground">Les dernières transactions effectuées</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{sale.productName}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{sale.clientName || 'Client anonyme'}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{sale.quantity}</td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{sale.total.toLocaleString()} FCFA</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(new Date(sale.date), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={sale.isPaid ? 'default' : 'secondary'} className={sale.isPaid ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                    {sale.isPaid ? 'Payée' : 'En attente'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
