import React from 'react';
import { useGetCallerRole } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { UserRole } from '../backend';
import { ShieldX, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  requiredRole: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const roleHierarchy: Record<UserRole, number> = {
  [UserRole.admin]: 3,
  [UserRole.user]: 1,
  [UserRole.guest]: 0,
};

export default function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { identity } = useInternetIdentity();
  const { data: role, isLoading } = useGetCallerRole();

  if (!identity) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <ShieldX size={40} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Please log in to access this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const userLevel = role ? roleHierarchy[role] : 0;
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <ShieldX size={40} className="text-destructive" />
        <p className="text-sm font-medium text-foreground">Access Denied</p>
        <p className="text-xs text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
