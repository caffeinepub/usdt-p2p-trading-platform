import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type DisputeStatus = 'none' | 'buyer' | 'seller';

interface DisputeBadgeProps {
  status: DisputeStatus;
  className?: string;
}

export default function DisputeBadge({ status, className }: DisputeBadgeProps) {
  if (status === 'none') {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30', className)}>
        <CheckCircle size={11} />
        No Dispute
      </span>
    );
  }

  if (status === 'buyer') {
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30', className)}>
        <AlertTriangle size={11} />
        Buyer Dispute
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30', className)}>
      <AlertCircle size={11} />
      Seller Dispute
    </span>
  );
}
