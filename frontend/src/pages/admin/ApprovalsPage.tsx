import React from 'react';
import { useListApprovals, useSetApproval } from '../../hooks/useQueries';
import RoleGuard from '../../components/RoleGuard';
import DashboardCard from '../../components/layout/DashboardCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole, ApprovalStatus } from '../../backend';
import { Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Principal } from '@icp-sdk/core/principal';

function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === ApprovalStatus.approved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
        <CheckCircle size={11} /> Approved
      </span>
    );
  }
  if (status === ApprovalStatus.rejected) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
        <XCircle size={11} /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
      <Clock size={11} /> Pending
    </span>
  );
}

export default function ApprovalsPage() {
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleApprove = async (principal: Principal) => {
    setProcessingId(principal.toString());
    try {
      await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.approved });
      toast.success('User approved successfully');
    } catch {
      toast.error('Failed to approve user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (principal: Principal) => {
    setProcessingId(principal.toString());
    try {
      await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.rejected });
      toast.success('User rejected');
    } catch {
      toast.error('Failed to reject user');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <RoleGuard requiredRole={UserRole.admin}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Toaster theme="dark" />
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">User Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve or reject user access requests</p>
        </div>

        <DashboardCard title="Approval Requests" icon={<Users size={16} />}>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-secondary/30 rounded animate-pulse" />)}
            </div>
          ) : !approvals || approvals.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No approval requests found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {approvals.map((approval) => {
                const pid = approval.principal.toString();
                const isProcessing = processingId === pid;
                return (
                  <div
                    key={pid}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-secondary/20"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="font-mono text-xs text-amber-400">{pid.slice(0, 20)}...</code>
                        <ApprovalStatusBadge status={approval.status} />
                      </div>
                    </div>
                    {approval.status === ApprovalStatus.pending && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(approval.principal)}
                          disabled={isProcessing}
                          className="bg-success/20 hover:bg-success/30 text-success border border-success/30 text-xs h-7"
                          variant="outline"
                        >
                          {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} className="mr-1" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(approval.principal)}
                          disabled={isProcessing}
                          className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 text-xs h-7"
                          variant="outline"
                        >
                          <XCircle size={12} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
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
