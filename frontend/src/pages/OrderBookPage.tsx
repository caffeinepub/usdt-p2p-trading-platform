import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import DashboardCard from '../components/layout/DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, TrendingUp, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

// Mock order data since order book is not yet implemented in backend
interface MockOrder {
  id: string;
  seller: string;
  usdtAmount: number;
  remainingAmount: number;
  minInr: number;
  maxInr: number;
  network: string;
  platformRate: number;
  createdAt: string;
}

const PLATFORM_RATE = 105;

const mockOrders: MockOrder[] = [
  { id: 'ORD-001', seller: 'Trader_A', usdtAmount: 500, remainingAmount: 350, minInr: 1000, maxInr: 50000, network: 'TRC20', platformRate: PLATFORM_RATE, createdAt: '2026-02-28 10:30' },
  { id: 'ORD-002', seller: 'Trader_B', usdtAmount: 1000, remainingAmount: 1000, minInr: 5000, maxInr: 100000, network: 'BEP20', platformRate: PLATFORM_RATE, createdAt: '2026-02-28 11:15' },
  { id: 'ORD-003', seller: 'Trader_C', usdtAmount: 250, remainingAmount: 100, minInr: 500, maxInr: 25000, network: 'TRC20', platformRate: PLATFORM_RATE, createdAt: '2026-02-28 12:00' },
];

function OrderCard({ order }: { order: MockOrder }) {
  const [buying, setBuying] = useState(false);
  const fillPercent = ((order.usdtAmount - order.remainingAmount) / order.usdtAmount) * 100;

  const handleBuy = async () => {
    setBuying(true);
    await new Promise(r => setTimeout(r, 1000));
    setBuying(false);
    toast.info('Order matching is coming soon. Backend order book not yet implemented.');
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card card-hover">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-400">{order.id}</span>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">{order.network}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">by {order.seller}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-amber-400">₹{order.platformRate}</p>
          <p className="text-xs text-muted-foreground">per USDT</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="font-mono text-sm font-semibold text-foreground">{order.remainingAmount} USDT</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Min INR</p>
          <p className="font-mono text-sm font-semibold text-foreground">₹{order.minInr.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max INR</p>
          <p className="font-mono text-sm font-semibold text-foreground">₹{order.maxInr.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Fill Progress</span>
          <span className="text-xs font-mono text-muted-foreground">{fillPercent.toFixed(0)}%</span>
        </div>
        <Progress value={fillPercent} className="h-1.5 bg-secondary" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{order.createdAt}</span>
        <Button
          size="sm"
          onClick={handleBuy}
          disabled={buying}
          className="bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold text-xs h-7"
        >
          {buying ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
          Buy USDT
        </Button>
      </div>
    </div>
  );
}

export default function OrderBookPage() {
  const { identity } = useInternetIdentity();
  const [networkFilter, setNetworkFilter] = useState('all');

  const filteredOrders = networkFilter === 'all'
    ? mockOrders
    : mockOrders.filter(o => o.network === networkFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster theme="dark" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Order Book</h1>
          <p className="text-sm text-muted-foreground mt-1">Buy USDT at the platform rate</p>
        </div>
        {identity && (
          <Link to="/orders/create">
            <Button className="bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold text-xs">
              <Plus size={14} className="mr-1" />
              Sell USDT
            </Button>
          </Link>
        )}
      </div>

      {/* Platform Rate Banner */}
      <div className="mb-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-amber-400" />
          <div>
            <p className="text-xs text-muted-foreground">Current Platform Rate</p>
            <p className="font-mono text-2xl font-bold text-amber-400 text-amber-glow">₹{PLATFORM_RATE}.00</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">per USDT</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter size={14} className="text-muted-foreground" />
        <Select value={networkFilter} onValueChange={setNetworkFilter}>
          <SelectTrigger className="w-36 h-8 text-xs bg-secondary border-border">
            <SelectValue placeholder="Network" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all" className="text-xs">All Networks</SelectItem>
            <SelectItem value="TRC20" className="text-xs">TRC20</SelectItem>
            <SelectItem value="BEP20" className="text-xs">BEP20</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filteredOrders.length} orders</span>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <BookOpen size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No orders available for the selected filter.</p>
        </div>
      )}
    </div>
  );
}
