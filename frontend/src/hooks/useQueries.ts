import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, FullProfile, Wallet, AuditTrail, UserApprovalInfo, ApprovalStatus, DisputeType, ActionType, UserRole, PaymentDetails } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['fullProfile'] });
    },
  });
}

export function useGetFullProfile(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FullProfile>({
    queryKey: ['fullProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) throw new Error('Actor or user not available');
      return actor.getProfile(user);
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

// ─── Admin Check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserRole>({
    queryKey: ['callerRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

// ─── KYC (Level 0 only — always returns 0) ───────────────────────────────────

export function useCheckKycStatus() {
  // KYC is always Level 0; no backend call needed
  return { data: 0 as number, isLoading: false };
}

export function useAdminSetKycVerified() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, verified }: { user: Principal; verified: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminSetKycVerified(user, verified);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['fullProfile'] });
    },
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useGetWallet(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Wallet>({
    queryKey: ['wallet', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) throw new Error('Actor or user not available');
      return actor.getWallet(user);
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

export function useDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deposit(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useWithdraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.withdraw(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, amount }: { user: Principal; amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveWithdrawal(user, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['listApprovals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useCreateSellOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amountUsdt,
      exchangeRate,
      paymentDetails,
    }: {
      amountUsdt: number;
      exchangeRate: number;
      paymentDetails: PaymentDetails;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createSellOrder(amountUsdt, exchangeRate, paymentDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ─── Disputes ─────────────────────────────────────────────────────────────────

export function useRaiseDispute() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, disputeType }: { orderId: bigint; disputeType: DisputeType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.raiseDispute(orderId, disputeType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTrails'] });
    },
  });
}

export function useFreezeOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.freezeOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTrails'] });
    },
  });
}

export function useFreezeWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.freezeWallet(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['auditTrails'] });
    },
  });
}

export function useManualReleaseUsdt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, amount }: { user: Principal; amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.manualReleaseUsdt(user, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['auditTrails'] });
    },
  });
}

export function useIssueRefund() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.issueRefund(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['auditTrails'] });
    },
  });
}

// ─── Audit Trails ─────────────────────────────────────────────────────────────

export function useGetAuditTrails(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditTrail[]>({
    queryKey: ['auditTrails', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) throw new Error('Actor or user not available');
      return actor.getAuditTrails(user);
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

export function useRecordAuditTrail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionType, timestamp }: { actionType: ActionType; timestamp: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordAuditTrail(actionType, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditTrails'] });
    },
  });
}

// ─── Platform Controls ────────────────────────────────────────────────────────

export function useGetProfitDashboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['profitDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProfitDashboard();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useExportCsv() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportCsv();
    },
  });
}

export function useToggleWithdrawalLock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locked: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleWithdrawalLock(locked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawalLock'] });
    },
  });
}

export function useSetPlatformRate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rate: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setPlatformRate(rate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformRate'] });
    },
  });
}
