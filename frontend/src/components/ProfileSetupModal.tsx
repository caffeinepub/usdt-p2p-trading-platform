import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { User, Mail, Loader2 } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ username?: string; email?: string }>({});

  const saveProfile = useSaveCallerUserProfile();

  const validate = () => {
    const newErrors: { username?: string; email?: string } = {};
    if (!username.trim() || username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await saveProfile.mutateAsync({ username: username.trim(), email: email.trim() });
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="bg-card border-border max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <User size={20} className="text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">Complete Your Profile</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                Set up your account to start trading
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium text-foreground">
              Username
            </Label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
                disabled={saveProfile.isPending}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
                disabled={saveProfile.isPending}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {saveProfile.isError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <p className="text-xs text-destructive">
                Failed to save profile. Please try again.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={saveProfile.isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold"
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
