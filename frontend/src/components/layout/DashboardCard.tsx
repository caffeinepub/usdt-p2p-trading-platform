import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  accent?: boolean;
}

export default function DashboardCard({
  title,
  subtitle,
  icon,
  children,
  className,
  headerAction,
  accent = false,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-5 card-hover',
        accent && 'border-amber-500/30',
        className
      )}
    >
      {(title || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center',
                accent ? 'bg-amber-500/15 text-amber-400' : 'bg-secondary text-muted-foreground'
              )}>
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
