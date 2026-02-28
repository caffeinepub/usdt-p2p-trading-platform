import React from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import OrderBookPage from './pages/OrderBookPage';
import CreateSellOrderPage from './pages/CreateSellOrderPage';
import DisputePage from './pages/DisputePage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ApprovalsPage from './pages/admin/ApprovalsPage';
import DisputeManagementPage from './pages/admin/DisputeManagementPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import WithdrawalLockPage from './pages/admin/WithdrawalLockPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      {children}
    </>
  );
}

function LayoutWithAuth() {
  return (
    <AuthGuard>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AuthGuard>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWithAuth,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrderBookPage,
});

const createOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/create',
  component: CreateSellOrderPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailPage,
});

const disputesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes',
  component: DisputePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const adminApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/approvals',
  component: ApprovalsPage,
});

const adminDisputesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/disputes',
  component: DisputeManagementPage,
});

const adminAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/audit',
  component: AuditLogPage,
});

const adminRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/roles',
  component: RoleManagementPage,
});

const adminWithdrawalLockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/withdrawal-lock',
  component: WithdrawalLockPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute,
  ordersRoute,
  createOrderRoute,
  orderDetailRoute,
  disputesRoute,
  adminRoute,
  adminApprovalsRoute,
  adminDisputesRoute,
  adminAuditRoute,
  adminRolesRoute,
  adminWithdrawalLockRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
