import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, Shield, Zap, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, clear, loginStatus, identity, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 overflow-hidden">
            <img src="/assets/generated/logo-mark.dim_128x128.png" alt="P2P Trade" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            P2P<span className="text-amber-500">Trade</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">USDT Trading Platform</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-card">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">Welcome Back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your identity to access the platform
            </p>
          </div>

          {loginError && loginStatus === 'loginError' && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <p className="text-xs text-destructive">
                Login failed. Please try again.
              </p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold h-11"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} />
                Login with Internet Identity
              </span>
            )}
          </Button>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
              <Shield size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Secure Authentication</p>
                <p className="text-xs text-muted-foreground">Powered by Internet Identity — no passwords required</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
              <Zap size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Instant Access</p>
                <p className="text-xs text-muted-foreground">Trade USDT with INR through our escrow system</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md bg-secondary/50">
              <Lock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Non-Custodial</p>
                <p className="text-xs text-muted-foreground">Your keys, your funds — we never hold private keys</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
