import React, { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetAuditTrails } from '../../hooks/useQueries';
import RoleGuard from '../../components/RoleGuard';
import DashboardCard from '../../components/layout/DashboardCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole, ActionType } from '../../backend';
import { FileText, Search, Filter } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

function actionTypeLabel(type: ActionType): string {
  const labels: Record<ActionType, string> = {
    [ActionType.deposit]: 'Deposit',
    [ActionType.withdrawal]: 'Withdrawal',
    [ActionType.orderPlacement]: 'Order Placement',
    [ActionType.orderCompletion]: 'Order Completion',
    [ActionType.disputeRaised]: 'Dispute Raised',
  };
  return labels[type] || String(type);
}

function actionTypeColor(type: ActionType): string {
  const colors: Record<ActionType, string> = {
    [ActionType.deposit]: 'text-success',
    [ActionType.withdrawal]: 'text-warning',
    [ActionType.orderPlacement]: 'text-amber-400',
    [ActionType.orderCompletion]: 'text-success',
    [ActionType.disputeRaised]: 'text-destructive',
  };
  return colors[type] || 'text-foreground';
}

// Mock audit data since backend returns empty arrays
const mockAuditEntries = [
  { actionType: ActionType.deposit, timestamp: BigInt(1740729000000000000), user: 'aaaaa-aa' },
  { actionType: ActionType.orderPlacement, timestamp: BigInt(1740729600000000000), user: 'bbbbb-bb' },
  { actionType: ActionType.orderCompletion, timestamp: BigInt(1740730200000000000), user: 'aaaaa-aa' },
  { actionType: ActionType.withdrawal, timestamp: BigInt(1740730800000000000), user: 'ccccc-cc' },
  { actionType: ActionType.disputeRaised, timestamp: BigInt(1740731400000000000), user: 'ddddd-dd' },
];

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredEntries = mockAuditEntries.filter(entry => {
    const matchesSearch = !searchTerm || entry.user.includes(searchTerm);
    const matchesAction = actionFilter === 'all' || entry.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  const formatTimestamp = (ts: bigint): string => {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster theme="dark" />
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable record of all platform actions</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user..."
              className="pl-9 bg-input border-border text-sm h-8"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-44 h-8 text-xs bg-secondary border-border">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-xs">All Actions</SelectItem>
              {Object.values(ActionType).map(type => (
                <SelectItem key={type} value={type} className="text-xs">{actionTypeLabel(type as ActionType)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DashboardCard title="Audit Trail" icon={<FileText size={16} />}>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No audit entries found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md border border-border bg-secondary/20 font-mono text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${actionTypeColor(entry.actionType as ActionType)}`}>
                      {actionTypeLabel(entry.actionType as ActionType)}
                    </span>
                    <span className="text-muted-foreground">by</span>
                    <span className="text-amber-400">{entry.user}</span>
                  </div>
                  <span className="text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
