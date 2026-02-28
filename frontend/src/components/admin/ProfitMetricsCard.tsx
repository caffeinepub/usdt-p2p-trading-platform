import React from 'react';
import { TrendingUp, DollarSign, BarChart2, Loader2 } from 'lucide-react';
import DashboardCard from '../layout/DashboardCard';

interface ProfitMetrics {
  totalUsdtTraded: number;
  totalInrVolume: number;
  totalProfit: number;
  ordersCount: number;
}

interface ProfitMetricsCardProps {
  metrics?: ProfitMetrics;
  isLoading?: boolean;
}

function MetricItem({ label, value, unit, icon, highlight = false }: {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'bg-amber-500/5 border-amber-500/20' : 'bg-secondary/50 border-border'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded flex items-center justify-center ${highlight ? 'bg-amber-500/15 text-amber-400' : 'bg-muted text-muted-foreground'}`}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-bold ${highlight ? 'text-amber-400 text-amber-glow' : 'text-foreground'}`}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export default function ProfitMetricsCard({ metrics, isLoading }: ProfitMetricsCardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const m = metrics || { totalUsdtTraded: 0, totalInrVolume: 0, totalProfit: 0, ordersCount: 0 };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricItem
        label="Total USDT Traded"
        value={m.totalUsdtTraded.toFixed(2)}
        unit="USDT"
        icon={<DollarSign size={14} />}
        highlight
      />
      <MetricItem
        label="Total INR Volume"
        value={`₹${(m.totalInrVolume / 1000).toFixed(1)}K`}
        unit="INR"
        icon={<BarChart2 size={14} />}
      />
      <MetricItem
        label="Platform Profit"
        value={m.totalProfit.toFixed(2)}
        unit="USDT"
        icon={<TrendingUp size={14} />}
        highlight
      />
      <MetricItem
        label="Total Orders"
        value={m.ordersCount.toString()}
        unit="orders"
        icon={<BarChart2 size={14} />}
      />
    </div>
  );
}
