import React, { useState } from 'react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import RoleGuard from '../../components/RoleGuard';
import DashboardCard from '../../components/layout/DashboardCard';
import ProfitMetricsCard from '../../components/admin/ProfitMetricsCard';
import ProfitFilterBar, { TimeFilter, NetworkFilter } from '../../components/admin/ProfitFilterBar';
import OrderProfitTable, { OrderProfitRow } from '../../components/admin/OrderProfitTable';
import { Button } from '@/components/ui/button';
import { UserRole } from '../../backend';
import { Download, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const mockOrders: OrderProfitRow[] = [
  { orderId: 'ORD-001', usdtAmount: 500, inrAmount: 52500, profit: 7.5, network: 'TRC20', timestamp: '2026-02-28 10:30', status: 'Completed' },
  { orderId: 'ORD-002', usdtAmount: 1000, inrAmount: 105000, profit: 15.0, network: 'BEP20', timestamp: '2026-02-28 11:15', status: 'Completed' },
  { orderId: 'ORD-003', usdtAmount: 250, inrAmount: 26250, profit: 3.75, network: 'TRC20', timestamp: '2026-02-28 12:00', status: 'Completed' },
  { orderId: 'ORD-004', usdtAmount: 750, inrAmount: 78750, profit: 11.25, network: 'TRC20', timestamp: '2026-02-27 09:00', status: 'Completed' },
  { orderId: 'ORD-005', usdtAmount: 200, inrAmount: 21000, profit: 3.0, network: 'BEP20', timestamp: '2026-02-27 14:30', status: 'Completed' },
];

function getFilteredOrders(orders: OrderProfitRow[], timeFilter: TimeFilter, networkFilter: NetworkFilter): OrderProfitRow[] {
  let filtered = orders;
  if (networkFilter !== 'all') {
    filtered = filtered.filter(o => o.network === networkFilter);
  }
  const now = new Date('2026-02-28');
  if (timeFilter === 'daily') {
    filtered = filtered.filter(o => o.timestamp.startsWith('2026-02-28'));
  } else if (timeFilter === 'weekly') {
    filtered = filtered.filter(o => {
      const d = new Date(o.timestamp);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
  } else if (timeFilter === 'monthly') {
    filtered = filtered.filter(o => o.timestamp.startsWith('2026-02'));
  }
  return filtered;
}

export default function AdminDashboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>('all');

  const filteredOrders = getFilteredOrders(mockOrders, timeFilter, networkFilter);
  const metrics = {
    totalUsdtTraded: filteredOrders.reduce((s, o) => s + o.usdtAmount, 0),
    totalInrVolume: filteredOrders.reduce((s, o) => s + o.inrAmount, 0),
    totalProfit: filteredOrders.reduce((s, o) => s + o.profit, 0),
    ordersCount: filteredOrders.length,
  };

  const handleExportCsv = () => {
    const headers = ['Order ID', 'USDT Amount', 'INR Amount', 'Profit', 'Network', 'Timestamp', 'Status'];
    const rows = filteredOrders.map(o => [o.orderId, o.usdtAmount, o.inrAmount, o.profit, o.network, o.timestamp, o.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-report-${timeFilter}-${networkFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster theme="dark" />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform profit and trading metrics</p>
          </div>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs"
          >
            <Download size={14} className="mr-1" />
            Export CSV
          </Button>
        </div>

        <div className="mb-6">
          <ProfitFilterBar
            timeFilter={timeFilter}
            networkFilter={networkFilter}
            onTimeFilterChange={setTimeFilter}
            onNetworkFilterChange={setNetworkFilter}
          />
        </div>

        <div className="mb-6">
          <ProfitMetricsCard metrics={metrics} />
        </div>

        <DashboardCard title="Order Profit Breakdown" icon={<TrendingUp size={16} />}>
          <OrderProfitTable orders={filteredOrders} />
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
