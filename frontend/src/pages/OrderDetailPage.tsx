import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import DashboardCard from '../components/layout/DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Copy,
  CheckCheck,
  CreditCard,
  Building2,
  Hash,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

// Since the backend doesn't yet expose a getOrderDetails query that returns
// payment details to the buyer, we display a placeholder with the order ID
// and instructions. When the backend exposes this endpoint, this page will
// be wired to the real data.

interface CopyFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function CopyField({ label, value, icon }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50 border border-border">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-amber-400 flex-shrink-0">{icon}</span>}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <p className="font-mono text-sm font-medium text-foreground truncate">{value}</p>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="ml-3 p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
        title={`Copy ${label}`}
      >
        {copied ? <CheckCheck size={14} className="text-success" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();

  // Mock payment details — in production these come from the backend
  // once a getOrderDetails endpoint is available that returns seller
  // payment info to the matched buyer.
  const mockPaymentDetails = {
    upiId: 'seller@upi',
    bankAccountNumber: '••••••••••••',
    ifscCode: '••••••••••',
    status: 'active' as const,
    amountUsdt: 100,
    exchangeRate: 105,
  };

  const isActive = mockPaymentDetails.status === 'active';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster theme="dark" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/orders' })}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">Order Details</h1>
            <Badge
              variant="outline"
              className={`text-xs ${isActive ? 'border-success/40 text-success bg-success/10' : 'border-border text-muted-foreground'}`}
            >
              {isActive ? 'Active' : 'Completed'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">Order #{orderId}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Summary */}
        <DashboardCard title="Order Summary" icon={<Hash size={16} />}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">USDT Amount</p>
              <p className="font-mono text-lg font-bold text-amber-400">
                {mockPaymentDetails.amountUsdt.toFixed(4)}{' '}
                <span className="text-xs font-normal text-muted-foreground">USDT</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Exchange Rate</p>
              <p className="font-mono text-lg font-bold text-foreground">
                ₹{mockPaymentDetails.exchangeRate}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total INR</p>
              <p className="font-mono text-sm font-semibold text-foreground">
                ₹{(mockPaymentDetails.amountUsdt * mockPaymentDetails.exchangeRate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono text-sm font-semibold text-foreground">#{orderId}</p>
            </div>
          </div>
        </DashboardCard>

        {/* Seller Payment Details — only shown when order is active */}
        {isActive && (
          <DashboardCard title="Seller Payment Details" icon={<CreditCard size={16} />}>
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                <Info size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Send the INR amount to the seller using any of the payment methods below. Once you've paid, notify the admin to release the USDT.
                </p>
              </div>

              <CopyField
                label="UPI ID"
                value={mockPaymentDetails.upiId}
                icon={<CreditCard size={14} />}
              />
              <CopyField
                label="Bank Account Number"
                value={mockPaymentDetails.bankAccountNumber}
                icon={<Building2 size={14} />}
              />
              <CopyField
                label="IFSC Code"
                value={mockPaymentDetails.ifscCode}
                icon={<Hash size={14} />}
              />

              <div className="flex items-center gap-2 pt-1">
                <ShieldCheck size={13} className="text-success" />
                <p className="text-xs text-muted-foreground">
                  Payment details are only visible to the matched buyer.
                </p>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border text-muted-foreground hover:text-foreground text-xs"
            onClick={() => navigate({ to: '/orders' })}
          >
            Back to Order Book
          </Button>
          {isActive && (
            <Button
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold text-xs"
              onClick={() => toast.info('Please contact support to confirm your INR payment.')}
            >
              I've Paid — Notify Admin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
