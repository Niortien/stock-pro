'use client'
import { useState } from 'react';
import { Plus, Search, FileText, Download, Eye } from 'lucide-react';
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
import { mockProducts, mockInvoices } from '@/data/mockData';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Invoice, InvoiceItem } from '@/types/type';

export default function InvoicesComponents() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    items: [{ productId: '', quantity: '' }] as { productId: string; quantity: string }[],
  });

  const filteredInvoices = invoices.filter(invoice =>
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: '' }],
    });
  };

  const updateItem = (index: number, field: 'productId' | 'quantity', value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product && item.quantity) {
        return sum + (product.unitPrice * Number(item.quantity));
      }
      return sum;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceItems: InvoiceItem[] = formData.items
      .filter(item => item.productId && item.quantity)
      .map(item => {
        const product = mockProducts.find(p => p.id === item.productId)!;
        const qty = Number(item.quantity);
        return {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: product.unitPrice,
          total: product.unitPrice * qty,
        };
      });

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `FAC-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: formData.clientName,
      items: invoiceItems,
      subtotal,
      tax,
      total,
      date: new Date(),
      status: 'draft',
    };

    setInvoices([newInvoice, ...invoices]);
    toast.success('Facture créée avec succès');
    setFormData({ clientName: '', items: [{ productId: '', quantity: '' }] });
    setIsDialogOpen(false);
  };

  const downloadInvoice = (invoice: Invoice) => {
    const invoiceContent = `
FACTURE
========================================
N°: ${invoice.invoiceNumber}
Date: ${format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}
Client: ${invoice.clientName}

----------------------------------------
ARTICLES
----------------------------------------
${invoice.items.map(item => `${item.productName}
  Qté: ${item.quantity} x ${item.unitPrice.toLocaleString()} FCFA = ${item.total.toLocaleString()} FCFA`).join('\n\n')}

----------------------------------------
Sous-total: ${invoice.subtotal.toLocaleString()} FCFA
TVA (19%): ${invoice.tax.toLocaleString()} FCFA
----------------------------------------
TOTAL: ${invoice.total.toLocaleString()} FCFA
========================================
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Facture téléchargée');
  };

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return { label: 'Payée', className: 'bg-success/20 text-success border-0' };
      case 'sent':
        return { label: 'Envoyée', className: 'bg-primary/20 text-primary border-0' };
      default:
        return { label: 'Brouillon', className: 'bg-muted text-muted-foreground border-0' };
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion des Factures"
        description="Créez et gérez vos factures"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nouvelle facture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une facture</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nom du client</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Ex: Restaurant Le Jardin"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Articles</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Produit" />
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
                      <div className="w-24">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="Qté"
                        />
                      </div>
                      {formData.items.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    + Ajouter un article
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{calculateTotal().toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA (19%)</span>
                    <span>{(calculateTotal() * 0.19).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{(calculateTotal() * 1.19).toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">Créer la facture</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{previewInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(previewInvoice.date), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <Badge className={getStatusConfig(previewInvoice.status).className}>
                  {getStatusConfig(previewInvoice.status).label}
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{previewInvoice.clientName}</p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-4 py-2 text-left">Article</th>
                      <th className="px-4 py-2 text-right">Qté</th>
                      <th className="px-4 py-2 text-right">P.U.</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.productName}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{item.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{previewInvoice.subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA (19%)</span>
                  <span>{previewInvoice.tax.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{previewInvoice.total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <Button onClick={() => downloadInvoice(previewInvoice)} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total factures</p>
              <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Factures payées</p>
              <p className="text-2xl font-bold text-foreground">{invoices.filter(i => i.status === 'paid').length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold text-foreground">
                {invoices.reduce((sum, i) => sum + i.total, 0).toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une facture..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">N° Facture</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                return (
                  <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.clientName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{invoice.total.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setPreviewInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadInvoice(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
