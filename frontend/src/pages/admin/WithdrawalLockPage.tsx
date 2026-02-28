import React, { useState } from 'react';
import { useToggleWithdrawalLock } from '../../hooks/useQueries';
import RoleGuard from '../../components/RoleGuard';
import DashboardCard from '../../components/layout/DashboardCard';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { UserRole } from '../../backend';
import { Lock, Unlock, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function WithdrawalLockPage() {
  const [isLocked, setIsLocked] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const toggleLock = useToggleWithdrawalLock();

  const handleToggle = async () => {
    const newState = !isLocked;
    setIsPending(true);
    try {
      await toggleLock.mutateAsync(newState);
      setIsLocked(newState);
      toast.success(newState ? 'Withdrawal lock ENABLED — all withdrawals paused' : 'Withdrawal lock DISABLED — withdrawals resumed');
    } catch {
      toast.error('Failed to toggle withdrawal lock');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster theme="dark" />
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Withdrawal Lock Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Emergency control to pause all platform withdrawals</p>
        </div>

        {isLocked && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
            <ShieldAlert size={20} className="text-destructive flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Withdrawal Lock Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">All withdrawal requests are currently paused. Users cannot withdraw funds.</p>
            </div>
          </div>
        )}

        <DashboardCard title="Global Withdrawal Lock" icon={isLocked ? <Lock size={16} /> : <Unlock size={16} />} accent={isLocked}>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLocked ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'}`}>
                {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isLocked ? 'Withdrawals LOCKED' : 'Withdrawals OPEN'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isLocked ? 'All withdrawal requests are paused' : 'Users can freely request withdrawals'}
                </p>
              </div>
            </div>
            <Switch
              checked={isLocked}
              onCheckedChange={handleToggle}
              disabled={isPending}
              className="data-[state=checked]:bg-destructive"
            />
          </div>

          <div className="p-3 rounded-md bg-secondary/50 border border-border flex items-start gap-2">
            <AlertTriangle size={14} className="text-warning mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Use this control only in emergency situations (e.g., suspected fraud, system maintenance).
              Enabling the lock will immediately pause all pending and new withdrawal requests.
            </p>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleToggle}
              disabled={isPending}
              className={`w-full font-semibold ${
                isLocked
                  ? 'bg-success/20 hover:bg-success/30 text-success border border-success/30'
                  : 'bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30'
              }`}
              variant="outline"
            >
              {isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Processing...</span>
              ) : isLocked ? (
                <span className="flex items-center gap-2"><Unlock size={14} />Unlock Withdrawals</span>
              ) : (
                <span className="flex items-center gap-2"><Lock size={14} />Lock All Withdrawals</span>
              )}
            </Button>
          </div>
        </DashboardCard>

        <div className="mt-6">
          <DashboardCard title="Lock History" icon={<AlertTriangle size={16} />}>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md border border-border bg-secondary/20 font-mono text-xs">
                <span className="text-success">UNLOCKED</span>
                <span className="text-muted-foreground">2026-02-28 09:00 IST</span>
                <span className="text-muted-foreground">by Admin</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-border bg-secondary/20 font-mono text-xs">
                <span className="text-destructive">LOCKED</span>
                <span className="text-muted-foreground">2026-02-27 22:30 IST</span>
                <span className="text-muted-foreground">by Admin</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </RoleGuard>
  );
}
