'use client'
import { useState } from 'react';
import { Save, Building2, Bell, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';

export default function Settings() {
  const [companySettings, setCompanySettings] = useState({
    name: 'Ma Boutique',
    address: '123 Rue du Commerce, Douala',
    phone: '+237 6XX XXX XXX',
    email: 'contact@maboutique.cm',
    taxId: 'M123456789',
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    newSale: false,
    creditDue: true,
  });

  const handleSaveCompany = () => {
    toast.success('Paramètres de l\'entreprise enregistrés');
  };

  const handleSaveNotifications = () => {
    toast.success('Préférences de notification enregistrées');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Paramètres"
        description="Configurez votre application"
      />

      <div className="grid gap-6 max-w-2xl">
        {/* Company Settings */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Informations de l&apos;entreprise</h3>
                <p className="text-sm text-muted-foreground">Ces informations apparaîtront sur vos factures</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
                <Input
                  id="companyName"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">N° Contribuable</Label>
                <Input
                  id="taxId"
                  value={companySettings.taxId}
                  onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={companySettings.address}
                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                />
              </div>
            </div>
            <div className="pt-4">
              <Button onClick={handleSaveCompany} className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">Gérez vos alertes et notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alerte stock faible</p>
                <p className="text-sm text-muted-foreground">Recevoir une alerte quand un produit est en rupture</p>
              </div>
              <Switch
                checked={notifications.lowStock}
                onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Nouvelle vente</p>
                <p className="text-sm text-muted-foreground">Notification à chaque nouvelle vente</p>
              </div>
              <Switch
                checked={notifications.newSale}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newSale: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Créances à échéance</p>
                <p className="text-sm text-muted-foreground">Rappel pour les créances arrivant à échéance</p>
              </div>
              <Switch
                checked={notifications.creditDue}
                onCheckedChange={(checked) => setNotifications({ ...notifications, creditDue: checked })}
              />
            </div>
            <div className="pt-4">
              <Button onClick={handleSaveNotifications} className="gap-2">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Database className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Données</h3>
                <p className="text-sm text-muted-foreground">Exportez ou sauvegardez vos données</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-foreground">Exporter les données</p>
                <p className="text-sm text-muted-foreground">Télécharger toutes vos données au format CSV</p>
              </div>
              <Button variant="outline">Exporter</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium text-foreground">Sauvegarder</p>
                <p className="text-sm text-muted-foreground">Créer une sauvegarde de la base de données</p>
              </div>
              <Button variant="outline">Sauvegarder</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
