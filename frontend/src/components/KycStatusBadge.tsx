import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KycStatusBadgeProps {
  className?: string;
  showLabel?: boolean;
}

// KYC is always Level 0 — Verified. No PAN/Aadhaar required.
export default function KycStatusBadge({ className, showLabel = true }: KycStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30',
        className
      )}
    >
      <ShieldCheck size={11} />
      {showLabel && 'Level 0 — Verified'}
    </span>
  );
}
