'use client'
import { useState } from 'react';
import { Plus, Search, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Credit } from '@/lib/services/credits/credit.schema';
import { PageHeader } from '../ui/page-header';
import { createCredit, getAllCredits } from '@/lib/services/credits/credit.action';
import { useEffect } from 'react';

export default function CreditsComponents() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  const filteredCredits = credits.filter(credit =>
    credit.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCredits = credits.filter(c => c.status !== 'PAID').reduce((sum, c) => sum + c.remainingAmount, 0);
  const pendingCredits = credits.filter(c => c.status === 'PENDING').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const creditData = {
      clientName: formData.clientName,
      amount: Number(formData.amount),
      remainingAmount: Number(formData.amount),
      description: formData.description,
      date: new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      status: 'PENDING' as const,
    };

    const result = await createCredit(creditData);
    if (result.success) {
      toast.success('Créance enregistrée');
      setFormData({ clientName: '', amount: '', description: '', dueDate: '' });
      setIsDialogOpen(false);
      // Refresh credits list
      loadCredits();
    } else {
      toast.error(result.error);
    }
  };

  const handlePayment = () => {
    if (!selectedCredit) return;

    const payment = Number(paymentAmount);
    const newRemaining = selectedCredit.remainingAmount - payment;

    setCredits(credits.map(c => {
      if (c.id === selectedCredit.id) {
        return {
          ...c,
          remainingAmount: Math.max(0, newRemaining),
          status: newRemaining <= 0 ? 'PAID' : newRemaining < c.amount ? 'PARTIAL' : 'PENDING',
        };
      }
      return c;
    }));

    toast.success(`Paiement de ${payment.toLocaleString()} FCFA enregistré`);
    setIsPaymentDialogOpen(false);
    setSelectedCredit(null);
    setPaymentAmount('');
  };

  const loadCredits = async () => {
    const result = await getAllCredits();
    if (result.success) {
      setCredits(result.data);
    } else {
      toast.error('Erreur lors du chargement des créances');
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const getStatusConfig = (status: Credit['status']) => {
    switch (status) {
      case 'PAID':
        return { 
          label: 'Payée', 
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium',
          icon: '✓'
        };
      case 'PARTIAL':
        return { 
          label: 'Partielle', 
          className: 'bg-amber-100 text-amber-800 border-amber-200 font-medium',
          icon: '◐'
        };
      case 'OVERDUE':
        return { 
          label: 'En retard', 
          className: 'bg-red-100 text-red-800 border-red-200 font-medium',
          icon: '⚠'
        };
      case 'CANCELLED':
        return { 
          label: 'Annulée', 
          className: 'bg-gray-100 text-gray-600 border-gray-200 font-medium',
          icon: '✕'
        };
      default:
        return { 
          label: 'En attente', 
          className: 'bg-blue-100 text-blue-800 border-blue-200 font-medium',
          icon: '⏳'
        };
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gestion des Créances"
        description="Suivez les paiements de vos clients"
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nouvelle créance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enregistrer une créance</DialogTitle>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="FCFA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Commande du 05/12"
                    required
                  />
                </div>
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          {selectedCredit && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">{selectedCredit.clientName}</p>
                <p className="text-sm text-muted-foreground">{selectedCredit.description}</p>
                <p className="text-lg font-bold text-foreground mt-2">
                  Reste à payer: {selectedCredit.remainingAmount.toLocaleString()} FCFA
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Montant du paiement</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="FCFA"
                  max={selectedCredit.remainingAmount}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handlePayment} disabled={!paymentAmount || Number(paymentAmount) <= 0}>
                  Valider le paiement
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
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total créances</p>
              <p className="text-2xl font-bold text-foreground">{totalCredits.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">En attente</p>
              <p className="text-2xl font-bold text-foreground">{pendingCredits}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Partielles</p>
              <p className="text-2xl font-bold text-foreground">{credits.filter(c => c.status === 'PARTIAL').length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-600 font-medium">Créances soldées</p>
              <p className="text-2xl font-bold text-foreground">{credits.filter(c => c.status === 'PAID').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Credits Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reste</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Échéance</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCredits.map((credit) => {
                const statusConfig = getStatusConfig(credit.status);
                return (
                  <tr key={credit.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{credit.clientName}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{credit.description}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{credit.amount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 font-medium text-foreground">{credit.remainingAmount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(credit.dueDate), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${statusConfig.className} gap-1 px-3 py-1`}>
                        <span className="text-xs">{statusConfig.icon}</span>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {credit.status !== 'PAID' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCredit(credit);
                            setIsPaymentDialogOpen(true);
                          }}
                        >
                          Paiement
                        </Button>
                      )}
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
