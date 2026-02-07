'use client'
import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, Trash2, Edit } from 'lucide-react';
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
import { createSale, getAllSales, deleteSale, updateSale } from '@/lib/services/sales/sale.action';
import { getAllProducts } from '@/lib/services/stock/stock.action';
import { Sale } from '@/lib/services/sales/sale.schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function SalesComponents() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    clientName: '',
    isPaid: 'true',
  });

  // Charger les ventes et produits depuis le serveur au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les ventes
        const salesResult = await getAllSales();
        if (salesResult.success) {
          setSales(salesResult.data);
        }

        // Charger les produits
        const productsResult = await getAllProducts();
        if (productsResult.success) {
          setProducts(productsResult.data);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredSales = sales.filter(sale => {
    // Support pour différents formats de données
    const productName = sale.productName || (sale.items && sale.items[0]?.product?.name) || '';
    const clientName = sale.customerId || sale.customerName || '';
    
    return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           clientName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalSales = sales.reduce((sum, s) => sum + (s.finalAmount || s.totalAmount || s.total || 0), 0);
  const paidSales = sales.filter(s => s.paymentStatus === 'PAID' || s.isPaid).reduce((sum, s) => sum + (s.finalAmount || s.totalAmount || s.total || 0), 0);

  const handleDeleteSale = async (saleId: string) => {
    setSaleToDelete(saleId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSale = async () => {
    if (!saleToDelete) return;
    
    try {
      const result = await deleteSale(saleToDelete);
      if (result.success) {
        toast.success('Vente supprimée avec succès');
        // Recharger la liste
        const salesResult = await getAllSales();
        if (salesResult.success) {
          setSales(salesResult.data);
        }
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const handleEditSale = (sale: any) => {
    setSaleToEdit(sale);
    setEditDialogOpen(true);
  };

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleToEdit) return;
    
    try {
      const product = products.find(p => p.id === saleToEdit.productId);
      if (!product) {
        toast.error('Veuillez sélectionner un produit valide');
        return;
      }

      const quantity = Number(saleToEdit.quantity);
      const total = quantity * product.unitPrice;

      const updateData = {
        productId: saleToEdit.productId,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.unitPrice,
        total: total,
        clientName: saleToEdit.clientName || 'Client anonyme',
        isPaid: saleToEdit.isPaid,
        date: saleToEdit.date,
      };

      const result = await updateSale(saleToEdit.id, updateData);
      
      if (result.success) {
        toast.success('Vente mise à jour avec succès');
        setEditDialogOpen(false);
        setSaleToEdit(null);
        // Recharger la liste
        const salesResult = await getAllSales();
        if (salesResult.success) {
          setSales(salesResult.data);
        }
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la mise à jour');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (!product) {
      toast.error('Veuillez sélectionner un produit valide');
      return;
    }

    const quantity = Number(formData.quantity);
    const total = quantity * product.unitPrice;

    const saleData = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.unitPrice,
      total: total,
      clientName: formData.clientName || 'Client anonyme',
      isPaid: formData.isPaid === 'true',
      date: new Date().toISOString().split('T')[0],
    };

    const result = await createSale(saleData);
    
      if (result.success) {
        // Recharger la liste des ventes depuis le serveur
        const salesResult = await getAllSales();
        if (salesResult.success) {
          setSales(salesResult.data);
        }
        
        toast.success('Vente enregistrée avec succès');
        setFormData({ productId: '', quantity: '', clientName: '', isPaid: 'true' });
        setIsDialogOpen(false);
      } else {
      toast.error(result.error || 'Erreur lors de l\'enregistrement de la vente');
    }
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
                      {products.map((product) => (
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
                      {((products.find(p => p.id === formData.productId)?.unitPrice || 0) * Number(formData.quantity)).toLocaleString()} FCFA
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
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des ventes...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune vente trouvée
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  // Support pour différents formats de données
                  const productName = sale.productName || (sale.items && sale.items[0]?.product?.name) || 'Produit inconnu';
                  const clientName = sale.customerId === 'anonymous' ? 'Client anonyme' : (sale.customerName || sale.customerId || 'Client inconnu');
                  const quantity = sale.quantity || (sale.items && sale.items[0]?.quantity) || 1;
                  const unitPrice = sale.unitPrice || (sale.items && sale.items[0]?.unitPrice) || 0;
                  const total = sale.total || sale.finalAmount || sale.totalAmount || 0;
                  const isPaid = sale.isPaid !== undefined ? sale.isPaid : (sale.paymentStatus === 'PAID');
                  
                  return (
                    <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{productName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{clientName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{quantity}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{unitPrice.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 font-medium text-foreground">{total.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(sale.date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <Badge className={`${isPaid ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'} border-0 font-medium px-3 py-1`}>
                            {isPaid ? 'Payée' : 'À crédit'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSale(sale)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteSale(sale.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSaleToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteSale}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Modal d'édition complète */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la vente</DialogTitle>
          </DialogHeader>
          {saleToEdit && (
            <form onSubmit={handleUpdateSale} className="space-y-4">
              <div className="space-y-2">
                <Label>Produit</Label>
                <Select value={saleToEdit.productId} onValueChange={(value) => {
                  const selectedProduct = products.find(p => p.id === value);
                  setSaleToEdit({ 
                    ...saleToEdit, 
                    productId: value,
                    productName: selectedProduct?.name || '',
                    unitPrice: selectedProduct?.unitPrice || 0
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.unitPrice.toLocaleString()} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClientName">Client</Label>
                <Input
                  id="editClientName"
                  value={saleToEdit.clientName || ''}
                  onChange={(e) => setSaleToEdit({ ...saleToEdit, clientName: e.target.value })}
                  placeholder="Ex: Restaurant Le Jardin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQuantity">Quantité</Label>
                <Input
                  id="editQuantity"
                  type="number"
                  value={saleToEdit.quantity}
                  onChange={(e) => setSaleToEdit({ ...saleToEdit, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={saleToEdit.date?.split('T')[0] || ''}
                  onChange={(e) => setSaleToEdit({ ...saleToEdit, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Paiement</Label>
                <Select value={saleToEdit.isPaid?.toString()} onValueChange={(value) => setSaleToEdit({ ...saleToEdit, isPaid: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Payée</SelectItem>
                    <SelectItem value="false">À crédit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSaleToEdit(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Mettre à jour
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
