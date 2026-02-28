import React from 'react';
import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetWallet, useIsCallerApproved, useRequestApproval } from '../hooks/useQueries';
import WalletBalanceCard from '../components/WalletBalanceCard';
import KycStatusBadge from '../components/KycStatusBadge';
import DashboardCard from '../components/layout/DashboardCard';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Deterministic deposit address from principal
function generateDepositAddress(principal: string): string {
  const hash = principal.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hex = (hash * 1234567891).toString(16).padStart(34, '0').slice(0, 34);
  return `T${hex.toUpperCase()}`;
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet, isLoading: walletLoading } = useGetWallet(identity?.getPrincipal() ?? null);
  const { data: isApproved, isLoading: approvalLoading } = useIsCallerApproved();
  const requestApproval = useRequestApproval();

  const principal = identity?.getPrincipal().toString() ?? '';
  const depositAddress = principal ? generateDepositAddress(principal) : '';

  const handleRequestApproval = async () => {
    try {
      await requestApproval.mutateAsync();
    } catch (err) {
      console.error('Failed to request approval:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div
        className="relative rounded-xl overflow-hidden mb-8 border border-border"
        style={{
          backgroundImage: 'url(/assets/generated/dashboard-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-charcoal-900/80" />
        <div className="relative p-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, <span className="text-amber-400">{userProfile?.username || 'Trader'}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your P2P USDT trading dashboard
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <KycStatusBadge />
            {isApproved !== undefined && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                isApproved
                  ? 'bg-success/10 text-success border-success/30'
                  : 'bg-warning/10 text-warning border-warning/30'
              }`}>
                {isApproved ? <CheckCircle size={11} /> : <Clock size={11} />}
                {isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Approval Banner */}
      {!approvalLoading && isApproved === false && (
        <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Account Pending Approval</p>
              <p className="text-xs text-muted-foreground">Request approval to start trading on the platform.</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleRequestApproval}
            disabled={requestApproval.isPending}
            className="bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 text-xs flex-shrink-0"
            variant="outline"
          >
            {requestApproval.isPending ? (
              <Loader2 size={12} className="animate-spin mr-1" />
            ) : null}
            Request Approval
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet */}
        <div className="lg:col-span-1">
          <WalletBalanceCard
            userBalance={wallet?.userBalance ?? 0}
            escrowBalance={wallet?.escrowBalance ?? 0}
            depositAddress={depositAddress}
            isLoading={walletLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <DashboardCard title="Quick Actions" icon={<TrendingUp size={16} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/orders">
                <div className="p-4 rounded-lg border border-border bg-secondary/50 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-amber-500/15 flex items-center justify-center">
                      <BookOpen size={16} className="text-amber-400" />
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Order Book</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Buy USDT at platform rate</p>
                </div>
              </Link>

              <Link to="/orders/create">
                <div className="p-4 rounded-lg border border-border bg-secondary/50 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-amber-500/15 flex items-center justify-center">
                      <TrendingUp size={16} className="text-amber-400" />
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Sell USDT</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Create a sell order</p>
                </div>
              </Link>

              <Link to="/wallet">
                <div className="p-4 rounded-lg border border-border bg-secondary/50 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-amber-500/15 flex items-center justify-center">
                      <TrendingUp size={16} className="text-amber-400" />
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Wallet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Deposit & withdraw USDT</p>
                </div>
              </Link>

              <Link to="/disputes">
                <div className="p-4 rounded-lg border border-border bg-secondary/50 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-amber-500/15 flex items-center justify-center">
                      <AlertTriangle size={16} className="text-amber-400" />
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Disputes</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Raise or view disputes</p>
                </div>
              </Link>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Platform Info */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Platform Rate</p>
          <p className="font-mono text-xl font-bold text-amber-400 text-amber-glow">₹105.00</p>
          <p className="text-xs text-muted-foreground">per USDT</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Platform Spread</p>
          <p className="font-mono text-xl font-bold text-foreground">1.5%</p>
          <p className="text-xs text-muted-foreground">deducted on release</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">KYC Status</p>
          <p className="font-mono text-xl font-bold text-foreground">Level 0</p>
          <p className="text-xs text-muted-foreground">verified by default</p>
        </div>
      </div>
    </div>
  );
}
