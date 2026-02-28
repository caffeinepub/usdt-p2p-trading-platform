import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWallet, useCreateSellOrder } from '../hooks/useQueries';
import DashboardCard from '../components/layout/DashboardCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Loader2, Info, ArrowLeft, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const PLATFORM_RATE = 105;
const SPREAD_PERCENT = 1.5;

interface FormErrors {
  usdtAmount?: string;
  upiId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
}

export default function CreateSellOrderPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: wallet } = useGetWallet(principal);
  const createSellOrder = useCreateSellOrder();

  const [usdtAmount, setUsdtAmount] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [upiId, setUpiId] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const amount = parseFloat(usdtAmount) || 0;
  const estimatedInr = amount * PLATFORM_RATE;
  const platformFee = estimatedInr * (SPREAD_PERCENT / 100);
  const netInr = estimatedInr - platformFee;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!amount || amount <= 0) {
      newErrors.usdtAmount = 'Please enter a valid USDT amount';
    } else if (wallet && amount > wallet.userBalance) {
      newErrors.usdtAmount = 'Insufficient balance';
    }

    if (!upiId.trim()) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!upiId.includes('@')) {
      newErrors.upiId = 'UPI ID must contain "@" (e.g. name@upi)';
    }

    if (!bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = 'Bank account number is required';
    }

    if (!ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z0-9]{11}$/.test(ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'IFSC code must be exactly 11 alphanumeric characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const orderId = await createSellOrder.mutateAsync({
        amountUsdt: amount,
        exchangeRate: PLATFORM_RATE,
        paymentDetails: {
          upiId: upiId.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
        },
      });
      toast.success(`Sell order #${orderId} created successfully!`);
      navigate({ to: '/orders' });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create sell order');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster theme="dark" />
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/orders' })}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create Sell Order</h1>
          <p className="text-sm text-muted-foreground mt-0.5">List your USDT for sale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Balance Info */}
        <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="font-mono text-xl font-bold text-amber-400">
              {(wallet?.userBalance ?? 0).toFixed(4)}{' '}
              <span className="text-xs font-normal text-muted-foreground">USDT</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Platform Rate</p>
            <p className="font-mono text-xl font-bold text-foreground">₹{PLATFORM_RATE}</p>
          </div>
        </div>

        <DashboardCard title="Order Details" icon={<TrendingUp size={16} />}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-md bg-secondary/50 border border-border flex items-start gap-2">
              <Info size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                When you create a sell order, your USDT will be locked in escrow. The buyer will receive your payment details to complete the INR transfer.
              </p>
            </div>

            {/* USDT Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">USDT Amount to Sell</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                value={usdtAmount}
                onChange={(e) => { setUsdtAmount(e.target.value); setErrors(prev => ({ ...prev, usdtAmount: undefined })); }}
                placeholder="0.0000"
                className={`bg-input border-border font-mono text-sm ${errors.usdtAmount ? 'border-destructive' : ''}`}
                disabled={createSellOrder.isPending}
              />
              {errors.usdtAmount && <p className="text-xs text-destructive">{errors.usdtAmount}</p>}
            </div>

            {/* Network */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Network</Label>
              <Select value={network} onValueChange={setNetwork} disabled={createSellOrder.isPending}>
                <SelectTrigger className="bg-input border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="TRC20">TRC20 (TRON)</SelectItem>
                  <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Details Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-amber-400" />
                <p className="text-xs font-semibold text-foreground">Payment Details (for buyer)</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                These details will be shared with the matched buyer so they can send INR to you.
              </p>

              {/* UPI ID */}
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs font-medium">UPI ID</Label>
                <Input
                  type="text"
                  value={upiId}
                  onChange={(e) => { setUpiId(e.target.value); setErrors(prev => ({ ...prev, upiId: undefined })); }}
                  placeholder="yourname@upi"
                  className={`bg-input border-border font-mono text-sm ${errors.upiId ? 'border-destructive' : ''}`}
                  disabled={createSellOrder.isPending}
                />
                {errors.upiId && <p className="text-xs text-destructive">{errors.upiId}</p>}
              </div>

              {/* Bank Account Number */}
              <div className="space-y-1.5 mb-3">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Building2 size={12} className="text-muted-foreground" />
                  Bank Account Number
                </Label>
                <Input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => { setBankAccountNumber(e.target.value); setErrors(prev => ({ ...prev, bankAccountNumber: undefined })); }}
                  placeholder="Enter account number"
                  className={`bg-input border-border font-mono text-sm ${errors.bankAccountNumber ? 'border-destructive' : ''}`}
                  disabled={createSellOrder.isPending}
                />
                {errors.bankAccountNumber && <p className="text-xs text-destructive">{errors.bankAccountNumber}</p>}
              </div>

              {/* IFSC Code */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">IFSC Code</Label>
                <Input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => { setIfscCode(e.target.value.toUpperCase()); setErrors(prev => ({ ...prev, ifscCode: undefined })); }}
                  placeholder="SBIN0001234"
                  maxLength={11}
                  className={`bg-input border-border font-mono text-sm uppercase ${errors.ifscCode ? 'border-destructive' : ''}`}
                  disabled={createSellOrder.isPending}
                />
                {errors.ifscCode && <p className="text-xs text-destructive">{errors.ifscCode}</p>}
                <p className="text-xs text-muted-foreground">11-character alphanumeric code (e.g. SBIN0001234)</p>
              </div>
            </div>

            {/* Calculation Preview */}
            {amount > 0 && (
              <div className="p-3 rounded-md bg-secondary/50 border border-border space-y-1.5">
                <p className="text-xs font-semibold text-foreground mb-2">Order Summary</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">USDT to lock in escrow</span>
                  <span className="font-mono text-foreground">{amount.toFixed(4)} USDT</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Gross INR value</span>
                  <span className="font-mono text-foreground">₹{estimatedInr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Platform spread ({SPREAD_PERCENT}%)</span>
                  <span className="font-mono text-destructive">-₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-border pt-1.5">
                  <span className="font-medium text-foreground">Buyer receives (INR equivalent)</span>
                  <span className="font-mono font-bold text-amber-400">₹{netInr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Platform profit</span>
                  <span className="font-mono text-muted-foreground">₹{platformFee.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={createSellOrder.isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold"
            >
              {createSellOrder.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Creating Order...</span>
              ) : (
                <span className="flex items-center gap-2"><TrendingUp size={14} />Create Sell Order</span>
              )}
            </Button>
          </form>
        </DashboardCard>
      </div>
    </div>
  );
}
