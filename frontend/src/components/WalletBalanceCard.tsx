import React from 'react';
import { Wallet, Lock, TrendingUp, Copy, Check } from 'lucide-react';
import DashboardCard from './layout/DashboardCard';
import { cn } from '@/lib/utils';

interface WalletBalanceCardProps {
  userBalance: number;
  escrowBalance: number;
  profitWallet?: number;
  depositAddress?: string;
  isAdmin?: boolean;
  isLoading?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}

function BalanceItem({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-md border',
      accent ? 'bg-amber-500/5 border-amber-500/20' : 'bg-secondary/50 border-border'
    )}>
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-7 h-7 rounded flex items-center justify-center',
          accent ? 'bg-amber-500/15 text-amber-400' : 'bg-muted text-muted-foreground'
        )}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn(
        'font-mono text-sm font-semibold',
        accent ? 'text-amber-400' : 'text-foreground'
      )}>
        {value.toFixed(4)} <span className="text-xs font-normal text-muted-foreground">USDT</span>
      </span>
    </div>
  );
}

export default function WalletBalanceCard({
  userBalance,
  escrowBalance,
  profitWallet,
  depositAddress,
  isAdmin = false,
  isLoading = false,
}: WalletBalanceCardProps) {
  if (isLoading) {
    return (
      <DashboardCard title="Wallet Balances" icon={<Wallet size={16} />}>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-md bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Wallet Balances" icon={<Wallet size={16} />} accent>
      <div className="space-y-2">
        <BalanceItem
          label="Available Balance"
          value={userBalance}
          icon={<Wallet size={14} />}
          accent
        />
        <BalanceItem
          label="In Escrow"
          value={escrowBalance}
          icon={<Lock size={14} />}
        />
        {isAdmin && profitWallet !== undefined && (
          <BalanceItem
            label="Platform Profit"
            value={profitWallet}
            icon={<TrendingUp size={14} />}
            accent
          />
        )}
      </div>

      {depositAddress && (
        <div className="mt-4 p-3 rounded-md bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1.5">Deposit Address (TRC20)</p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs text-amber-400 flex-1 truncate">
              {depositAddress}
            </code>
            <CopyButton text={depositAddress} />
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
