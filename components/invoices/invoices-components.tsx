'use client'
import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, Trash2, Edit, Download, Printer, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createInvoice, getAllInvoices, updateInvoice } from '@/lib/services/invoices/invoice.action';
import { getAllProducts } from '@/lib/services/stock/stock.action';
import { InvoiceSchema } from '@/lib/services/invoices/invoice.schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Définir le type InvoiceItem localement
interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Styles pour le PDF avec police système
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 12,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666666',
  },
  clientInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    backgroundColor: '#F8F9FA',
    fontWeight: 'bold',
    padding: 8,
    fontSize: 10,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 8,
    fontSize: 10,
  },
  tableColRight: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 8,
    fontSize: 10,
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    width: '80%',
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '20%',
    fontSize: 10,
    textAlign: 'right',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#333333',
    borderTopStyle: 'solid',
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

export default function InvoicesComponents() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    clientName: '',
    status: 'DRAFT'
  });

  const [formData, setFormData] = useState({
    clientName: '',
    items: [{ productId: '', quantity: '' }] as { productId: string; quantity: string }[],
  });

  // Charger les données depuis les API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les produits
        const productsResult = await getAllProducts();
        if (productsResult.success) {
          setProducts(productsResult.data);
        }

        // Charger les factures
        const invoicesResult = await getAllInvoices();
        if (invoicesResult.success) {
          setInvoices(invoicesResult.data);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      const product = products.find((p: any) => p.id === item.productId);
      if (product && item.quantity) {
        return sum + (product.unitPrice * Number(item.quantity));
      }
      return sum;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceItems: InvoiceItem[] = formData.items
      .filter(item => item.productId && item.quantity)
      .map(item => {
        const product = products.find((p: any) => p.id === item.productId)!;
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
    const tax = subtotal * 0;
    const total = subtotal + tax;

  const invoiceData = {
      invoiceNumber: `FAC-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: formData.clientName,
      items: invoiceItems,
      subtotal,
      tax,
      total,
      date: new Date().toISOString().split('T')[0],
      status: 'DRAFT'
    };

    try {
      const result = await createInvoice(invoiceData);
      
      if (result.success) {
        // Recharger la liste des factures
        const invoicesResult = await getAllInvoices();
        if (invoicesResult.success) {
          setInvoices(invoicesResult.data);
        }
        
        toast.success('Facture créée avec succès');
        setFormData({ clientName: '', items: [{ productId: '', quantity: '' }] });
        setIsDialogOpen(false);
      } else {
        toast.error(result.error || 'Erreur lors de la création de la facture');
      }
    } catch (error) {
      toast.error('Erreur inattendue lors de la création de la facture');
    }
  };

  // Composant PDF avec React-PDF
  const InvoicePDF = ({ invoice }: { invoice: any }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.title}>
          <Text>FACTURE</Text>
        </View>
        
        <View style={styles.header}>
          <Text>N°: {invoice.invoiceNumber}</Text>
          <Text>Date: {format(new Date(invoice.date || invoice.issueDate), 'dd MMMM yyyy', { locale: fr })}</Text>
        </View>

        <View style={styles.clientInfo}>
          <Text>Client: {invoice.customerId || invoice.clientName}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Article</Text>
            <Text style={styles.tableColHeader}>Qté</Text>
            <Text style={styles.tableColHeader}>P.U.</Text>
            <Text style={styles.tableColHeader}>Total</Text>
          </View>
          
          {(invoice.items || []).map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol}>{item.productName || ''}</Text>
              <Text style={styles.tableCol}>{item.quantity || ''}</Text>
              <Text style={styles.tableColRight}>{(item.unitPrice || 0).toLocaleString()} FCFA</Text>
              <Text style={styles.tableColRight}>{(item.total || 0).toLocaleString()} FCFA</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total:</Text>
            <Text style={styles.totalValue}>{(invoice.subtotal || 0).toLocaleString()} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA (0%):</Text>
            <Text style={styles.totalValue}>{(invoice.tax || 0).toLocaleString()} FCFA</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotal}>TOTAL: {(invoice.total || invoice.finalAmount || 0).toLocaleString()} FCFA</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Merci pour votre confiance!</Text>
        </View>
      </Page>
    </Document>
  );

  const downloadInvoice = async (invoice: any) => {
    console.log('Tentative de génération PDF avec React-PDF pour facture:', invoice);
    
    try {
      const { pdf } = await import('@react-pdf/renderer');
      
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${invoice.invoiceNumber}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('PDF généré avec succès');
      toast.success('PDF téléchargé avec succès');
    } catch (error: any) {
      console.error('Erreur React-PDF:', error);
      toast.error(`Erreur lors de la génération du PDF: ${error?.message || error}`);
    }
  };

  const printInvoice = (invoice: any) => {
    // Créer le contenu HTML pour le PDF
    const invoiceContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .invoice-info { font-size: 14px; color: #666; }
    .client-info { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    .items-table th { background: #f8f9fa; font-weight: bold; }
    .items-table .text-right { text-align: right; }
    .totals { margin-top: 20px; text-align: right; }
    .totals div { margin: 5px 0; }
    .total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="invoice-title">FACTURE</div>
    <div class="invoice-info">
      N°: ${invoice.invoiceNumber}<br>
      Date: ${format(new Date(invoice.date || invoice.issueDate), 'dd MMMM yyyy', { locale: fr })}<br>
    </div>
  </div>

  <div class="client-info">
    <strong>Client:</strong> ${invoice.customerId || invoice.clientName}
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Article</th>
        <th class="text-right">Qté</th>
        <th class="text-right">P.U.</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(invoice.items || []).map((item: any) => `
        <tr>
          <td>${item.productName}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${item.unitPrice?.toLocaleString()} FCFA</td>
          <td class="text-right">${item.total?.toLocaleString()} FCFA</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div>Sous-total: ${(invoice.subtotal || 0).toLocaleString()} FCFA</div>
    <div>TVA (0%): ${(invoice.tax || 0).toLocaleString()} FCFA</div>
    <div class="total">TOTAL: ${(invoice.total || invoice.finalAmount || 0).toLocaleString()} FCFA</div>
  </div>

  <div class="footer">
    Merci pour votre confiance!
  </div>
</body>
</html>
    `;

    // Créer une fenêtre pour imprimer en PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Attendre que le contenu soit chargé puis imprimer
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success('Facture générée pour impression PDF');
    } else {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return { 
          label: 'Payée', 
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium px-3 py-1',
          icon: '✓'
        };
      case 'SENT':
        return { 
          label: 'Envoyée', 
          className: 'bg-blue-100 text-blue-800 border-blue-200 font-medium px-3 py-1',
          icon: '📤'
        };
      case 'OVERDUE':
        return { 
          label: 'En retard', 
          className: 'bg-red-100 text-red-800 border-red-200 font-medium px-3 py-1',
          icon: '⚠'
        };
      case 'CANCELLED':
        return { 
          label: 'Annulée', 
          className: 'bg-gray-100 text-gray-600 border-gray-200 font-medium px-3 py-1',
          icon: '✕'
        };
      case 'DRAFT':
      default:
        return { 
          label: 'Brouillon', 
          className: 'bg-amber-100 text-amber-800 border-amber-200 font-medium px-3 py-1',
          icon: '📝'
        };
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      // Simuler la suppression (à adapter avec votre API)
      setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
      toast.success('Facture supprimée avec succès');
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast.error('Erreur lors de la suppression de la facture');
    }
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEditFormData({
      clientName: invoice.clientName || invoice.customerId,
      status: invoice.status
    });
    setEditDialogOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    try {
      // Utiliser les données existantes de la facture et mettre à jour seulement les champs modifiés
      const invoiceData = {
        invoiceNumber: selectedInvoice.invoiceNumber,
        clientName: editFormData.clientName || selectedInvoice.clientName,
        items: (selectedInvoice.items || []).map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subtotal: selectedInvoice.subtotal || 0,
        tax: selectedInvoice.tax || 0,
        total: selectedInvoice.total || 0,
        date: selectedInvoice.date || new Date().toISOString().split('T')[0],
        status: editFormData.status as "DRAFT" | "SENT" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED",
      };

      const result = await updateInvoice(selectedInvoice.id, invoiceData);
      
      if (result.success) {
        // Recharger la liste des factures
        const invoicesResult = await getAllInvoices();
        if (invoicesResult.success) {
          setInvoices(invoicesResult.data);
        }
        
        toast.success('Facture mise à jour avec succès');
        setEditDialogOpen(false);
        setSelectedInvoice(null);
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour de la facture');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la facture');
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
                            {products.map((product: any) => (
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
                    <span className="text-muted-foreground">TVA (0%)</span>
                    <span>{(calculateTotal() * 0).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{calculateTotal().toLocaleString()} FCFA</span>
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
                <Badge className={`${getStatusConfig(previewInvoice.status).className} gap-1`}>
                  <span className="text-xs">{getStatusConfig(previewInvoice.status).icon}</span>
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
                    {previewInvoice.items.map((item: any, idx: number) => (
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
                  <span className="text-muted-foreground">TVA (0%)</span>
                  <span>{previewInvoice.tax.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{previewInvoice.total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => downloadInvoice(previewInvoice)} className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button onClick={() => printInvoice(previewInvoice)} className="flex-1 gap-2" variant="outline">
                  <Printer className="h-4 w-4" />
                  Imprimer PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total factures</p>
              <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Brouillons</p>
              <p className="text-2xl font-bold text-foreground">{invoices.filter(i => i.status === 'DRAFT').length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Factures payées</p>
              <p className="text-2xl font-bold text-foreground">{invoices.filter(i => i.status === 'PAID').length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Montant total</p>
              <p className="text-2xl font-bold text-foreground">
                {invoices.reduce((sum, i) => sum + (i.total || i.finalAmount || 0), 0).toLocaleString()} FCFA
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Chargement des factures...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice: any) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  return (
                    <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{invoice.reference || invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.customerId || invoice.clientName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(invoice.issueDate || invoice.date), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{(invoice.finalAmount || invoice.total).toLocaleString()} FCFA</td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusConfig(invoice.status).className} gap-1`}>
                          <span className="text-xs">{getStatusConfig(invoice.status).icon}</span>
                          {getStatusConfig(invoice.status).label}
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
                          <Button variant="ghost" size="icon" onClick={() => printInvoice(invoice)}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(invoice)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer la facture "{selectedInvoice?.invoiceNumber}" ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteInvoice}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la facture</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateInvoice} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editClientName">Nom du client</Label>
              <Input
                id="editClientName"
                value={editFormData.clientName}
                onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                placeholder="Ex: Restaurant Le Jardin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editStatus">Statut</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SENT">Envoyée</SelectItem>
                  <SelectItem value="PAID">Payée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="gap-2">
                <Edit className="h-4 w-4" />
                Mettre à jour
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
