'use client';

import { cn } from '@/lib/utils';
import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Wine,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { title: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
  { title: 'Stock', icon: Package, path: '/stock' },
  { title: 'Ventes', icon: TrendingUp, path: '/sales' },
  { title: 'Achats', icon: ShoppingCart, path: '/purchases' },
  { title: 'Créances', icon: CreditCard, path: '/credits' },
  { title: 'Factures', icon: FileText, path: '/invoices' },
  { title: 'Paramètres', icon: Settings, path: '/settings' },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu hamburger pour mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#161D27] text-white hover:bg-[#1a2332] transition-colors"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r bg-[#161D27] transition-transform duration-300 ease-in-out",
          "lg:translate-x-0", // Toujours visible sur desktop
          isOpen ? "translate-x-0" : "-translate-x-full" // Caché/visible sur mobile
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Wine className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-lg">
                StockFlow
              </h1>
              <p className="text-xs text-white/60">
                Gestion de stock
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)} // Fermer le menu sur mobile après clic
                  className={cn(
                    'flex items-center text-white gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-white shadow-lg shadow-sidebar-primary/25'
                      : 'text-white/40 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/50">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-sm font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Admin
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  admin@stockflow.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
