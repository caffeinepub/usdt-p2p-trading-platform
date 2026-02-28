import React, { useState } from 'react';
import { useListApprovals, useAssignRole } from '../../hooks/useQueries';
import RoleGuard from '../../components/RoleGuard';
import DashboardCard from '../../components/layout/DashboardCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserRole } from '../../backend';
import { Settings, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Principal } from '@icp-sdk/core/principal';

function roleBadge(role: UserRole) {
  const styles: Record<UserRole, string> = {
    [UserRole.admin]: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    [UserRole.user]: 'bg-success/10 text-success border-success/30',
    [UserRole.guest]: 'bg-muted text-muted-foreground border-border',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[role]}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

export default function RoleManagementPage() {
  const { data: approvals, isLoading } = useListApprovals();
  const assignRole = useAssignRole();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleRoleChange = (principalStr: string, role: UserRole) => {
    setSelectedRoles(prev => ({ ...prev, [principalStr]: role }));
  };

  const handleSave = async (principal: Principal) => {
    const pid = principal.toString();
    const role = selectedRoles[pid];
    if (!role) return;
    setSavingId(pid);
    try {
      await assignRole.mutateAsync({ user: principal, role });
      toast.success('Role updated successfully');
    } catch {
      toast.error('Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster theme="dark" />
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Role Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign roles to platform users</p>
        </div>

        <div className="mb-4 p-4 rounded-lg border border-border bg-card">
          <h3 className="text-sm font-semibold text-foreground mb-2">Role Permissions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20">
              <p className="font-semibold text-amber-400 mb-1">Admin</p>
              <p className="text-muted-foreground">Full access to all features including KYC, disputes, profit dashboard, and role management.</p>
            </div>
            <div className="p-3 rounded-md bg-secondary/50 border border-border">
              <p className="font-semibold text-foreground mb-1">User</p>
              <p className="text-muted-foreground">Standard trading access. Can create orders, manage wallet, and raise disputes.</p>
            </div>
            <div className="p-3 rounded-md bg-secondary/50 border border-border">
              <p className="font-semibold text-muted-foreground mb-1">Guest</p>
              <p className="text-muted-foreground">View-only access. Cannot trade or access sensitive features.</p>
            </div>
          </div>
        </div>

        <DashboardCard title="Users" icon={<Settings size={16} />}>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-secondary/30 rounded animate-pulse" />)}
            </div>
          ) : !approvals || approvals.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {approvals.map((approval) => {
                const pid = approval.principal.toString();
                const selectedRole = selectedRoles[pid];
                return (
                  <div
                    key={pid}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-secondary/20"
                  >
                    <div className="flex-1">
                      <code className="font-mono text-xs text-amber-400">{pid.slice(0, 24)}...</code>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        value={selectedRole}
                        onValueChange={(v) => handleRoleChange(pid, v as UserRole)}
                      >
                        <SelectTrigger className="w-28 h-7 text-xs bg-secondary border-border">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value={UserRole.admin} className="text-xs">Admin</SelectItem>
                          <SelectItem value={UserRole.user} className="text-xs">User</SelectItem>
                          <SelectItem value={UserRole.guest} className="text-xs">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleSave(approval.principal)}
                        disabled={!selectedRole || savingId === pid}
                        className="bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold text-xs h-7"
                      >
                        {savingId === pid ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
