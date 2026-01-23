'use client'
import { useState } from 'react';
import { Plus, Search, ShoppingCart } from 'lucide-react';
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
import { mockProducts, mockPurchases } from '@/data/mockData';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Purchase } from '@/types/type';

export default function PurchasesComponent() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    supplierName: '',
    isPaid: 'true',
  });

  const filteredPurchases = purchases.filter(purchase =>
    purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const paidPurchases = purchases.filter(p => p.isPaid).reduce((sum, p) => sum + p.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = mockProducts.find(p => p.id === formData.productId);
    if (!product) return;

    const quantity = Number(formData.quantity);
    const unitPrice = Number(formData.unitPrice);
    const total = quantity * unitPrice;

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      total,
      supplierName: formData.supplierName,
      date: new Date(),
      isPaid: formData.isPaid === 'true',
    };

    setPurchases([newPurchase, ...purchases]);
    toast.success('Achat enregistré avec succès');
    setFormData({ productId: '', quantity: '', unitPrice: '', supplierName: '', isPaid: 'true' });
    setIsDialogOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion des Achats"
        description="Enregistrez vos achats fournisseurs"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nouvel achat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enregistrer un achat</DialogTitle>
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
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplierName">Fournisseur</Label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="Ex: SOBRADIS"
                    required
                  />
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
                    <Label htmlFor="unitPrice">Prix unitaire</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      placeholder="FCFA"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Paiement</Label>
                  <Select value={formData.isPaid} onValueChange={(value) => setFormData({ ...formData, isPaid: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Payé</SelectItem>
                      <SelectItem value="false">À payer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.quantity && formData.unitPrice && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total de l&apos;achat</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(Number(formData.quantity) * Number(formData.unitPrice)).toLocaleString()} FCFA
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
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total des achats</p>
              <p className="text-2xl font-bold text-foreground">{totalPurchases.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <ShoppingCart className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Achats payés</p>
              <p className="text-2xl font-bold text-foreground">{paidPurchases.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <ShoppingCart className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">À payer</p>
              <p className="text-2xl font-bold text-foreground">{(totalPurchases - paidPurchases).toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un achat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Purchases Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Produit</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Prix unit.</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{purchase.productName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.supplierName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.quantity}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.unitPrice.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 font-medium text-foreground">{purchase.total.toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {format(new Date(purchase.date), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={purchase.isPaid ? 'bg-success/20 text-success border-0' : 'bg-destructive/20 text-destructive border-0'}>
                      {purchase.isPaid ? 'Payé' : 'À payer'}
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
