import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRaiseDispute } from '../hooks/useQueries';
import DashboardCard from '../components/layout/DashboardCard';
import DisputeBadge from '../components/DisputeBadge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Info, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { DisputeType } from '../backend';

interface MockActiveOrder {
  id: string;
  type: 'buy' | 'sell';
  usdtAmount: number;
  inrAmount: number;
  network: string;
  status: string;
  disputeStatus: 'none' | 'buyer' | 'seller';
  createdAt: string;
}

const mockActiveOrders: MockActiveOrder[] = [
  {
    id: 'ORD-001',
    type: 'buy',
    usdtAmount: 100,
    inrAmount: 10500,
    network: 'TRC20',
    status: 'Pending Payment',
    disputeStatus: 'none',
    createdAt: '2026-02-28 10:30',
  },
  {
    id: 'ORD-002',
    type: 'sell',
    usdtAmount: 250,
    inrAmount: 26250,
    network: 'BEP20',
    status: 'In Escrow',
    disputeStatus: 'none',
    createdAt: '2026-02-28 11:45',
  },
];

export default function DisputePage() {
  const { identity } = useInternetIdentity();
  const raiseDispute = useRaiseDispute();
  const [raisingFor, setRaisingFor] = useState<string | null>(null);
  const [orders, setOrders] = useState(mockActiveOrders);

  const handleRaiseDispute = async (order: MockActiveOrder) => {
    setRaisingFor(order.id);
    const disputeType = order.type === 'buy' ? DisputeType.buyerDispute : DisputeType.sellerDispute;
    try {
      await raiseDispute.mutateAsync({ orderId: BigInt(order.id.replace('ORD-', '')), disputeType });
      setOrders(prev =>
        prev.map(o =>
          o.id === order.id
            ? { ...o, disputeStatus: order.type === 'buy' ? 'buyer' : 'seller' }
            : o
        )
      );
      toast.success('Dispute raised successfully. Admin will review shortly.');
    } catch {
      toast.error('Failed to raise dispute. Please try again.');
    } finally {
      setRaisingFor(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster theme="dark" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Disputes</h1>
        <p className="text-sm text-muted-foreground mt-1">Raise and manage disputes on your active orders</p>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-secondary/50 border border-border flex items-start gap-3">
        <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">How Disputes Work</p>
          <p className="text-xs text-muted-foreground mt-1">
            If you have an issue with an order (e.g., payment not received, USDT not released), you can raise a dispute.
            Our admin team will review the case and take appropriate action within 24 hours.
          </p>
        </div>
      </div>

      <DashboardCard title="Your Active Orders" icon={<AlertTriangle size={16} />}>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShieldCheck size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active orders to dispute.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-lg border border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-400">{order.id}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      order.type === 'buy'
                        ? 'bg-success/10 text-success'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {order.type === 'buy' ? 'BUY' : 'SELL'}
                    </span>
                    <DisputeBadge status={order.disputeStatus} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{order.usdtAmount} USDT</span>
                    <span className="font-mono">₹{order.inrAmount.toLocaleString()}</span>
                    <span>{order.network}</span>
                    <span>{order.status}</span>
                    <span>{order.createdAt}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {order.disputeStatus === 'none' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRaiseDispute(order)}
                      disabled={raisingFor === order.id}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
                    >
                      {raisingFor === order.id ? (
                        <Loader2 size={12} className="animate-spin mr-1" />
                      ) : (
                        <AlertTriangle size={12} className="mr-1" />
                      )}
                      Raise Dispute
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Dispute filed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
