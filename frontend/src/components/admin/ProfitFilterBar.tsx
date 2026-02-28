import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

export type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'all';
export type NetworkFilter = 'all' | 'TRC20' | 'BEP20';

interface ProfitFilterBarProps {
  timeFilter: TimeFilter;
  networkFilter: NetworkFilter;
  onTimeFilterChange: (value: TimeFilter) => void;
  onNetworkFilterChange: (value: NetworkFilter) => void;
}

export default function ProfitFilterBar({
  timeFilter,
  networkFilter,
  onTimeFilterChange,
  onNetworkFilterChange,
}: ProfitFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Filter size={14} />
        <span>Filters:</span>
      </div>

      <Tabs value={timeFilter} onValueChange={(v) => onTimeFilterChange(v as TimeFilter)}>
        <TabsList className="bg-secondary h-8">
          <TabsTrigger value="daily" className="text-xs h-6 px-3 data-[state=active]:bg-amber-500 data-[state=active]:text-charcoal-900">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs h-6 px-3 data-[state=active]:bg-amber-500 data-[state=active]:text-charcoal-900">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs h-6 px-3 data-[state=active]:bg-amber-500 data-[state=active]:text-charcoal-900">Monthly</TabsTrigger>
          <TabsTrigger value="all" className="text-xs h-6 px-3 data-[state=active]:bg-amber-500 data-[state=active]:text-charcoal-900">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select value={networkFilter} onValueChange={(v) => onNetworkFilterChange(v as NetworkFilter)}>
        <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
          <SelectValue placeholder="Network" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all" className="text-xs">All Networks</SelectItem>
          <SelectItem value="TRC20" className="text-xs">TRC20</SelectItem>
          <SelectItem value="BEP20" className="text-xs">BEP20</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
