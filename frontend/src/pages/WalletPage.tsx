import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWallet, useDeposit, useWithdraw } from '../hooks/useQueries';
import WalletBalanceCard from '../components/WalletBalanceCard';
import DashboardCard from '../components/layout/DashboardCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownToLine, ArrowUpFromLine, Loader2, Info, Copy, Check } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function generateDepositAddress(principal: string): string {
  const hash = principal.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hex = (hash * 1234567891).toString(16).padStart(34, '0').slice(0, 34);
  return `T${hex.toUpperCase()}`;
}

export default function WalletPage() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: wallet, isLoading: walletLoading } = useGetWallet(principal);
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [copied, setCopied] = useState(false);

  const depositAddress = principal ? generateDepositAddress(principal.toString()) : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await deposit.mutateAsync(amount);
      toast.success('Deposit request submitted. Awaiting admin confirmation.');
      setDepositAmount('');
    } catch (err) {
      toast.error('Deposit failed. Please try again.');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (wallet && amount > wallet.userBalance) {
      toast.error('Insufficient balance');
      return;
    }
    try {
      await withdraw.mutateAsync(amount);
      toast.success('Withdrawal request submitted. Awaiting admin approval.');
      setWithdrawAmount('');
    } catch (err) {
      toast.error('Withdrawal failed. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster theme="dark" />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your USDT deposits and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Card */}
        <WalletBalanceCard
          userBalance={wallet?.userBalance ?? 0}
          escrowBalance={wallet?.escrowBalance ?? 0}
          depositAddress={depositAddress}
          isLoading={walletLoading}
        />

        {/* Deposit/Withdraw */}
        <DashboardCard title="Transactions" icon={<ArrowDownToLine size={16} />}>
          <Tabs defaultValue="deposit">
            <TabsList className="w-full bg-secondary mb-4">
              <TabsTrigger value="deposit" className="flex-1 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-charcoal-900">
                <ArrowDownToLine size={12} className="mr-1" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex-1 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-charcoal-900">
                <ArrowUpFromLine size={12} className="mr-1" />
                Withdraw
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deposit">
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="p-3 rounded-md bg-secondary/50 border border-border">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Send USDT to your deposit address below. Admin will confirm and credit your balance.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Your Deposit Address</Label>
                  <div className="flex items-center gap-2 p-2.5 rounded-md bg-secondary border border-border">
                    <code className="font-mono text-xs text-amber-400 flex-1 truncate">{depositAddress}</code>
                    <button type="button" onClick={handleCopy} className="p-1 rounded hover:bg-muted transition-colors">
                      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger className="bg-input border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="TRC20">TRC20 (TRON)</SelectItem>
                      <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (USDT)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0000"
                    className="bg-input border-border font-mono text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={deposit.isPending}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold"
                >
                  {deposit.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Processing...</span>
                  ) : (
                    <span className="flex items-center gap-2"><ArrowDownToLine size={14} />Submit Deposit</span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="withdraw">
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="p-3 rounded-md bg-secondary/50 border border-border">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Withdrawals require admin approval. Funds will be released after verification.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">Available Balance</p>
                  <p className="font-mono text-lg font-bold text-amber-400">
                    {(wallet?.userBalance ?? 0).toFixed(4)} <span className="text-xs font-normal text-muted-foreground">USDT</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger className="bg-input border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="TRC20">TRC20 (TRON)</SelectItem>
                      <SelectItem value="BEP20">BEP20 (BSC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (USDT)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    max={wallet?.userBalance ?? 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.0000"
                    className="bg-input border-border font-mono text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={withdraw.isPending}
                  variant="outline"
                  className="w-full border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-semibold"
                >
                  {withdraw.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Processing...</span>
                  ) : (
                    <span className="flex items-center gap-2"><ArrowUpFromLine size={14} />Request Withdrawal</span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DashboardCard>
      </div>
    </div>
  );
}
