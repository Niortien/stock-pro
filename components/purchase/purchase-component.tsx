'use client'
import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, Trash2, Edit } from 'lucide-react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPurchase, getAllPurchases, deletePurchase, updatePurchaseStatus, updatePurchaseComplete } from '@/lib/services/purchases/purchase.action';
import { getAllProducts } from '@/lib/services/stock/stock.action';
import { CreatePurchaseSchema } from '@/lib/services/purchases/purchase.schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Purchase, Supplier } from '@/lib/services/purchases/purchase.schema';

export default function PurchasesComponent() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [purchaseToEdit, setPurchaseToEdit] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    quantity: '1',
    unitPrice: '0',
    total: '0',
    supplierName: '',
    isPaid: false,
    date: new Date().toISOString().split('T')[0], // Date du jour au format YYYY-MM-DD
  });

  const filteredPurchases = purchases.filter((purchase: any) => {
    // Support pour l'ancien et le nouveau schéma
    const reference = purchase.reference || purchase.productName || '';
    const supplierInfo = purchase.supplierId || purchase.supplierName || '';
    
    return reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
           supplierInfo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPurchases = purchases.reduce((sum, p: any) => {
    // Support pour l'ancien et le nouveau schéma
    const amount = p.finalAmount || p.total || 0;
    return sum + amount;
  }, 0);
  const paidPurchases = purchases.reduce((sum, p: any) => {
    // Support pour l'ancien et le nouveau schéma
    const amount = p.finalAmount || p.total || 0;
    const isPaid = p.paymentStatus === 'PAID' || p.isPaid === true;
    return sum + (isPaid ? amount : 0);
  }, 0);

  // Charger les achats et produits au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les achats
        const purchasesResult = await getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.data);
        }

        // Charger les produits
        const productsResult = await getAllProducts();
        if (productsResult.success) {
          setProducts(productsResult.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadData();
  }, []);

  const handleDeletePurchase = async (purchaseId: string) => {
    setPurchaseToDelete(purchaseId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    
    try {
      const result = await deletePurchase(purchaseToDelete);
      if (result.success) {
        toast.success('Achat supprimé avec succès');
        // Recharger la liste
        const purchasesResult = await getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.data);
        }
      } else {
        toast.error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const handleUpdateStatus = async (purchaseId: string, currentStatus: boolean) => {
    try {
      // Pour l'ancien format, on utilise isPaid (boolean)
      // Pour le nouveau format, on utiliserait paymentStatus (string)
      const result = await updatePurchaseStatus(purchaseId, currentStatus ? 'PENDING' : 'PAID');
      
      if (result.success) {
        toast.success(`Statut mis à jour: ${currentStatus ? 'À payer' : 'Payé'}`);
        // Recharger la liste
        const purchasesResult = await getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.data);
        }
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur inattendue lors de la mise à jour');
    }
  };

  const handleEditPurchase = (purchase: any) => {
    setPurchaseToEdit(purchase);
    setEditDialogOpen(true);
  };

  const handleUpdatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseToEdit) return;
    
    setIsLoading(true);
    
    try {
      const updateData = {
        productId: purchaseToEdit.productId,
        productName: purchaseToEdit.productName,
        quantity: Number(purchaseToEdit.quantity),
        unitPrice: Number(purchaseToEdit.unitPrice),
        total: Number(purchaseToEdit.total),
        supplierName: purchaseToEdit.supplierName,
        isPaid: purchaseToEdit.isPaid,
        date: purchaseToEdit.date,
      };

      const result = await updatePurchaseComplete(purchaseToEdit.id, updateData);
      
      if (result.success) {
        toast.success('Achat mis à jour avec succès');
        setEditDialogOpen(false);
        setPurchaseToEdit(null);
        // Recharger la liste
        const purchasesResult = await getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.data);
        }
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    
    // Validation des champs requis
    if (!formData.productId) {
      toast.error('Veuillez sélectionner un produit');
      return;
    }
    
    if (!formData.supplierName.trim()) {
      toast.error('Le nom du fournisseur est requis');
      return;
    }
    
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }
    
    if (!formData.unitPrice || Number(formData.unitPrice) < 0) {
      toast.error('Le prix unitaire doit être positif');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // S'assurer que toutes les valeurs sont définies
      const safeData = {
        ...(formData.productId && { productId: formData.productId }), // N'inclure productId que s'il existe
        productName: formData.productName || '',
        quantity: Number(formData.quantity) || 1,
        unitPrice: Number(formData.unitPrice) || 0,
        total: Number(formData.total) || (Number(formData.quantity) * Number(formData.unitPrice)),
        supplierName: formData.supplierName || '',
        isPaid: Boolean(formData.isPaid),
        date: formData.date || new Date().toISOString().split('T')[0],
      };

      console.log('FormData brut:', formData);
      console.log('SafeData:', safeData);

      // Validation stricte
      const errors = [];
      if (!safeData.productId) errors.push('productId');
      if (!safeData.productName) errors.push('productName');
      if (!safeData.supplierName) errors.push('supplierName');
      if (isNaN(safeData.quantity)) errors.push('quantity');
      if (isNaN(safeData.unitPrice)) errors.push('unitPrice');
      if (isNaN(safeData.total)) errors.push('total');
      
      if (errors.length > 0) {
        toast.error(`Champs invalides: ${errors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      const purchaseData = safeData;
      
      console.log('Données finales envoyées:', purchaseData);
      
      // Utiliser createPurchase avec l'ancien format
      const result = await createPurchase(purchaseData as any);
      
      if (result.success) {
        toast.success('Achat créé avec succès');
        setFormData({ 
          productId: '',
          productName: '',
          quantity: '1',
          unitPrice: '0',
          total: '0',
          supplierName: '',
          isPaid: false,
          date: new Date().toISOString().split('T')[0],
        });
        setIsDialogOpen(false);
        // Recharger la liste des achats après création
        const purchasesResult = await getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.data);
        }
      } else {
        toast.error(result.error || 'Erreur lors de la création de l\'achat');
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la création de l\'achat');
    } finally {
      setIsLoading(false);
    }
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
                  <Select value={formData.productId} onValueChange={(value) => {
                    const selectedProduct = products.find(p => p.id === value);
                    setFormData({ 
                      ...formData, 
                      productId: value,
                      productName: selectedProduct?.name || '',
                      unitPrice: selectedProduct?.unitPrice?.toString() || '0'
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.unitPrice} FCFA/{product.unit})
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total</Label>
                  <Input
                    id="total"
                    type="number"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                    placeholder="FCFA"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Paiement</Label>
                  <Select value={formData.isPaid.toString()} onValueChange={(value) => setFormData({ ...formData, isPaid: value === 'true' })}>
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
                    <p className="text-sm text-muted-foreground">Total calculé</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(Number(formData.quantity) * Number(formData.unitPrice)).toLocaleString()} FCFA
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Création...' : 'Enregistrer'}
                  </Button>
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
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPurchases.map((purchase: any) => {
                // Support pour l'ancien et le nouveau schéma
                const isOldSchema = purchase.productName !== undefined;
                
                if (isOldSchema) {
                  // Ancien schéma
                  return (
                    <tr key={purchase.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{purchase.productName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.supplierName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.quantity}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.unitPrice?.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 font-medium text-foreground">{purchase.total?.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(purchase.date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${purchase.isPaid ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <Badge className={`${purchase.isPaid ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'} border-0 font-medium px-3 py-1`}>
                            {purchase.isPaid ? 'Payé' : 'À payer'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPurchase(purchase)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(purchase.id, purchase.isPaid)}
                            className="h-8 w-8 p-0"
                          >
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePurchase(purchase.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  // Nouveau schéma
                  return (
                    <tr key={purchase.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{purchase.reference}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{purchase.supplierId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">-</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">-</td>
                      <td className="px-6 py-4 font-medium text-foreground">{purchase.finalAmount?.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(purchase.date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${purchase.status === 'RECEIVED' ? 'bg-green-500' : purchase.status === 'PENDING' ? 'bg-yellow-500' : purchase.status === 'CANCELLED' ? 'bg-red-500' : purchase.status === 'PARTIAL' ? 'bg-blue-500' : 'bg-gray-500'}`} />
                          <Badge className={`${purchase.status === 'RECEIVED' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : purchase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200' : purchase.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : purchase.status === 'PARTIAL' ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'} border-0 font-medium px-3 py-1`}>
                            {purchase.status === 'PENDING' ? 'En attente' : purchase.status === 'RECEIVED' ? 'Reçu' : purchase.status === 'CANCELLED' ? 'Annulé' : purchase.status === 'PARTIAL' ? 'Partiel' : purchase.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPurchase(purchase)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(purchase.id, purchase.paymentStatus === 'PAID')}
                            className="h-8 w-8 p-0"
                          >
                            <ShoppingCart className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePurchase(purchase.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              })}
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
              Êtes-vous sûr de vouloir supprimer cet achat ? Cette action est irréversible.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPurchaseToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeletePurchase}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal d'édition complète */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'achat</DialogTitle>
          </DialogHeader>
          {purchaseToEdit && (
            <form onSubmit={handleUpdatePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label>Produit</Label>
                <Select value={purchaseToEdit.productId} onValueChange={(value) => {
                  const selectedProduct = products.find(p => p.id === value);
                  setPurchaseToEdit({ 
                    ...purchaseToEdit, 
                    productId: value,
                    productName: selectedProduct?.name || '',
                    unitPrice: selectedProduct?.unitPrice?.toString() || '0'
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.unitPrice} FCFA/{product.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierName">Fournisseur</Label>
                <Input
                  id="editSupplierName"
                  value={purchaseToEdit.supplierName}
                  onChange={(e) => setPurchaseToEdit({ ...purchaseToEdit, supplierName: e.target.value })}
                  placeholder="Ex: SOBRADIS"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editQuantity">Quantité</Label>
                  <Input
                    id="editQuantity"
                    type="number"
                    value={purchaseToEdit.quantity}
                    onChange={(e) => setPurchaseToEdit({ ...purchaseToEdit, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUnitPrice">Prix unitaire</Label>
                  <Input
                    id="editUnitPrice"
                    type="number"
                    value={purchaseToEdit.unitPrice}
                    onChange={(e) => setPurchaseToEdit({ ...purchaseToEdit, unitPrice: e.target.value })}
                    placeholder="FCFA"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDate">Date</Label>
                <Input
                  id="editDate"
                  type="date"
                  value={purchaseToEdit.date?.split('T')[0] || ''}
                  onChange={(e) => setPurchaseToEdit({ ...purchaseToEdit, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Paiement</Label>
                <Select value={purchaseToEdit.isPaid.toString()} onValueChange={(value) => setPurchaseToEdit({ ...purchaseToEdit, isPaid: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Payé</SelectItem>
                    <SelectItem value="false">À payer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setPurchaseToEdit(null);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
