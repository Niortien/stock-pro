'use client'
import { useState } from 'react';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockProducts, mockSales } from '@/data/mockData';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Sale } from '@/types/type';

export default function SalesComponents() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    clientName: '',
    isPaid: 'true',
  });

  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.clientName && sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const paidSales = sales.filter(s => s.isPaid).reduce((sum, s) => sum + s.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = mockProducts.find(p => p.id === formData.productId);
    if (!product) return;

    const quantity = Number(formData.quantity);
    const total = quantity * product.unitPrice;

    const newSale: Sale = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.unitPrice,
      total,
      clientName: formData.clientName || undefined,
      date: new Date(),
      isPaid: formData.isPaid === 'true',
    };

    setSales([newSale, ...sales]);
    toast.success('Vente enregistrée avec succès');
    setFormData({ productId: '', quantity: '', clientName: '', isPaid: 'true' });
    setIsDialogOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion des Ventes"
        description="Enregistrez et suivez vos ventes"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nouvelle vente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enregistrer une vente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.unitPrice.toLocaleString()} FCFA
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Paiement</Label>
                    <Select value={formData.isPaid} onValueChange={(value) => setFormData({ ...formData, isPaid: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Payée</SelectItem>
                        <SelectItem value="false">À crédit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nom du client (optionnel)</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Ex: Restaurant Le Jardin"
                  />
                </div>
                {formData.productId && formData.quantity && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total de la vente</p>
                    <p className="text-2xl font-bold text-foreground">
                      {((mockProducts.find(p => p.id === formData.productId)?.unitPrice || 0) * Number(formData.quantity)).toLocaleString()} FCFA
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Enregistrer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total des ventes</p>
              <p className="text-2xl font-bold text-foreground">{totalSales.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ventes payées</p>
              <p className="text-2xl font-bold text-foreground">{paidSales.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">À récupérer</p>
              <p className="text-2xl font-bold text-foreground">{(totalSales - paidSales).toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une vente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Produit</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prix unit.</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{sale.productName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{sale.clientName || 'Client anonyme'}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{sale.quantity}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{sale.unitPrice.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 font-medium text-foreground">{sale.total.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(sale.date), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={sale.isPaid ? 'bg-success/20 text-success border-0' : 'bg-warning/20 text-warning border-0'}>
                      {sale.isPaid ? 'Payée' : 'À crédit'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
