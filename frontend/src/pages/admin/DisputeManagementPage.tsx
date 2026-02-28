import React, { useState } from 'react';
import { useFreezeOrder, useFreezeWallet, useManualReleaseUsdt, useIssueRefund } from '../../hooks/useQueries';
import RoleGuard from '../../components/RoleGuard';
import DashboardCard from '../../components/layout/DashboardCard';
import DisputeBadge from '../../components/DisputeBadge';
import { Button } from '@/components/ui/button';
import { UserRole } from '../../backend';
import { AlertTriangle, Lock, Unlock, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Principal } from '@icp-sdk/core/principal';

interface MockDisputedOrder {
  id: string;
  orderId: bigint;
  buyerPrincipal: string;
  sellerPrincipal: string;
  usdtAmount: number;
  inrAmount: number;
  network: string;
  disputeType: 'buyer' | 'seller';
  frozen: boolean;
  createdAt: string;
}

const mockDisputedOrders: MockDisputedOrder[] = [
  {
    id: 'ORD-007',
    orderId: BigInt(7),
    buyerPrincipal: 'aaaaa-aa',
    sellerPrincipal: 'bbbbb-bb',
    usdtAmount: 300,
    inrAmount: 31500,
    network: 'TRC20',
    disputeType: 'buyer',
    frozen: false,
    createdAt: '2026-02-28 08:00',
  },
  {
    id: 'ORD-008',
    orderId: BigInt(8),
    buyerPrincipal: 'ccccc-cc',
    sellerPrincipal: 'ddddd-dd',
    usdtAmount: 150,
    inrAmount: 15750,
    network: 'BEP20',
    disputeType: 'seller',
    frozen: true,
    createdAt: '2026-02-27 16:30',
  },
];

export default function DisputeManagementPage() {
  const freezeOrder = useFreezeOrder();
  const freezeWallet = useFreezeWallet();
  const manualRelease = useManualReleaseUsdt();
  const issueRefund = useIssueRefund();
  const [orders, setOrders] = useState(mockDisputedOrders);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleFreezeOrder = async (order: MockDisputedOrder) => {
    setActionId(`freeze-${order.id}`);
    try {
      await freezeOrder.mutateAsync(order.orderId);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, frozen: true } : o));
      toast.success(`Order ${order.id} frozen`);
    } catch {
      toast.error('Failed to freeze order');
    } finally {
      setActionId(null);
    }
  };

  const handleFreezeWallet = async (principalStr: string) => {
    setActionId(`wallet-${principalStr}`);
    try {
      const principal = Principal.fromText(principalStr);
      await freezeWallet.mutateAsync(principal);
      toast.success('Wallet frozen successfully');
    } catch {
      toast.error('Failed to freeze wallet');
    } finally {
      setActionId(null);
    }
  };

  const handleRelease = async (order: MockDisputedOrder) => {
    setActionId(`release-${order.id}`);
    try {
      const principal = Principal.fromText(order.buyerPrincipal);
      await manualRelease.mutateAsync({ user: principal, amount: order.usdtAmount });
      toast.success(`USDT released to buyer for order ${order.id}`);
    } catch {
      toast.error('Failed to release USDT');
    } finally {
      setActionId(null);
    }
  };

  const handleRefund = async (order: MockDisputedOrder) => {
    setActionId(`refund-${order.id}`);
    try {
      await issueRefund.mutateAsync(order.orderId);
      toast.success(`Refund issued for order ${order.id}`);
    } catch {
      toast.error('Failed to issue refund');
    } finally {
      setActionId(null);
    }
  };

  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster theme="dark" />
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Dispute Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and resolve disputed orders</p>
        </div>

        <DashboardCard title="Disputed Orders" icon={<AlertTriangle size={16} />}>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No disputed orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="font-mono text-xs text-amber-400">{order.id}</span>
                    <DisputeBadge status={order.disputeType} />
                    {order.frozen && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
                        <Lock size={11} /> Frozen
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">USDT</p>
                      <p className="font-mono font-semibold text-foreground">{order.usdtAmount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">INR</p>
                      <p className="font-mono font-semibold text-foreground">₹{order.inrAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Network</p>
                      <p className="font-semibold text-foreground">{order.network}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-semibold text-foreground">{order.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!order.frozen && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFreezeOrder(order)}
                        disabled={actionId === `freeze-${order.id}`}
                        className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs h-7"
                      >
                        {actionId === `freeze-${order.id}` ? <Loader2 size={12} className="animate-spin mr-1" /> : <Lock size={12} className="mr-1" />}
                        Freeze Order
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFreezeWallet(order.buyerPrincipal)}
                      disabled={actionId === `wallet-${order.buyerPrincipal}`}
                      className="border-warning/40 text-warning hover:bg-warning/10 text-xs h-7"
                    >
                      {actionId === `wallet-${order.buyerPrincipal}` ? <Loader2 size={12} className="animate-spin mr-1" /> : <Lock size={12} className="mr-1" />}
                      Freeze Buyer Wallet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRelease(order)}
                      disabled={actionId === `release-${order.id}`}
                      className="border-success/40 text-success hover:bg-success/10 text-xs h-7"
                    >
                      {actionId === `release-${order.id}` ? <Loader2 size={12} className="animate-spin mr-1" /> : <Unlock size={12} className="mr-1" />}
                      Release to Buyer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRefund(order)}
                      disabled={actionId === `refund-${order.id}`}
                      className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs h-7"
                    >
                      {actionId === `refund-${order.id}` ? <Loader2 size={12} className="animate-spin mr-1" /> : <RefreshCw size={12} className="mr-1" />}
                      Refund Seller
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
