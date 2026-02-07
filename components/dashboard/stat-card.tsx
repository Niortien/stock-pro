import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-white border-gray-200 hover:border-gray-300',
  primary: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300',
  success: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300',
  warning: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300',
  danger: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300',
};

const iconStyles = {
  default: 'bg-gray-100 text-gray-600',
  primary: 'bg-blue-500 text-white shadow-lg',
  success: 'bg-emerald-500 text-white shadow-lg',
  warning: 'bg-amber-500 text-white shadow-lg',
  danger: 'bg-red-500 text-white shadow-lg',
};

const titleStyles = {
  default: 'text-gray-600',
  primary: 'text-blue-700',
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
};

const valueStyles = {
  default: 'text-gray-900',
  primary: 'text-blue-900',
  success: 'text-emerald-900',
  warning: 'text-amber-900',
  danger: 'text-red-900',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      'relative rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden group',
      variantStyles[variant]
    )}>
      {/* Effet de fond décoratif */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-12 translate-x-12" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className={cn('text-sm font-semibold uppercase tracking-wide', titleStyles[variant])}>
              {title}
            </p>
            <p className={cn('text-3xl font-bold', valueStyles[variant])}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-2xl transition-all duration-300 group-hover:scale-110',
            iconStyles[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
            trend.isPositive 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          )}>
            <span className="text-lg">{trend.isPositive ? '📈' : '📉'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-xs opacity-75">vs mois dernier</span>
          </div>
        )}
      </div>
    </div>
  );
}
