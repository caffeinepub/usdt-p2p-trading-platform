import React from 'react';
import { Lock, CreditCard, CheckCircle, Unlock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type EscrowStep = 'locked' | 'inr_paid' | 'verified' | 'released';

interface EscrowStatusIndicatorProps {
  currentStep: EscrowStep;
}

const steps = [
  { id: 'locked', label: 'USDT Locked', icon: Lock, description: 'Funds in escrow' },
  { id: 'inr_paid', label: 'INR Paid', icon: CreditCard, description: 'Buyer confirmed' },
  { id: 'verified', label: 'Admin Verified', icon: CheckCircle, description: 'Payment confirmed' },
  { id: 'released', label: 'USDT Released', icon: Unlock, description: 'Trade complete' },
];

const stepOrder: EscrowStep[] = ['locked', 'inr_paid', 'verified', 'released'];

export default function EscrowStatusIndicator({ currentStep }: EscrowStatusIndicatorProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                isCompleted && 'bg-success/20 border-success text-success',
                isActive && 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse-amber',
                !isCompleted && !isActive && 'bg-secondary border-border text-muted-foreground'
              )}>
                {isCompleted ? (
                  <CheckCircle size={14} />
                ) : isActive ? (
                  <Icon size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <div className="text-center">
                <p className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-amber-400' : isCompleted ? 'text-success' : 'text-muted-foreground'
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1 mb-5',
                index < currentIndex ? 'bg-success/50' : 'bg-border'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
