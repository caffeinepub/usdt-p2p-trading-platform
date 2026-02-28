import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  AlertTriangle,
  Settings,
  LogOut,
  LogIn,
  Menu,
  X,
  TrendingUp,
  Users,
  FileText,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const userNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={16} /> },
  { label: 'Order Book', path: '/orders', icon: <BookOpen size={16} /> },
  { label: 'Wallet', path: '/wallet', icon: <Wallet size={16} /> },
  { label: 'Disputes', path: '/disputes', icon: <AlertTriangle size={16} /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Admin Dashboard', path: '/admin', icon: <TrendingUp size={16} />, adminOnly: true },
  { label: 'User Approvals', path: '/admin/approvals', icon: <Users size={16} />, adminOnly: true },
  { label: 'Disputes', path: '/admin/disputes', icon: <AlertTriangle size={16} />, adminOnly: true },
  { label: 'Audit Log', path: '/admin/audit', icon: <FileText size={16} />, adminOnly: true },
  { label: 'Roles', path: '/admin/roles', icon: <Settings size={16} />, adminOnly: true },
  { label: 'Withdrawal Lock', path: '/admin/withdrawal-lock', icon: <Lock size={16} />, adminOnly: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-charcoal-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/30 group-hover:border-amber-500/60 transition-colors">
                <img
                  src="/assets/generated/logo-mark.dim_128x128.png"
                  alt="P2P Trade"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-foreground font-semibold text-sm tracking-wide">P2P</span>
                <span className="text-amber-500 font-semibold text-sm tracking-wide">Trade</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {userNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      isActive(item.path)
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                          location.pathname.startsWith('/admin')
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        <Settings size={16} />
                        Admin
                        <ChevronDown size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                      {adminNavItems.map((item) => (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link
                            to={item.path}
                            className="flex items-center gap-2 text-xs cursor-pointer"
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                        <span className="text-amber-400 text-xs font-bold">
                          {userProfile?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-foreground hidden sm:block">
                        {userProfile?.username || 'Account'}
                      </span>
                      <ChevronDown size={12} className="text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
                    <div className="px-2 py-1.5">
                      <p className="text-xs font-medium text-foreground">{userProfile?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{userProfile?.email || ''}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-xs text-destructive cursor-pointer"
                    >
                      <LogOut size={14} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="bg-amber-500 hover:bg-amber-600 text-charcoal-900 font-semibold text-xs"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <LogIn size={14} />
                      Login
                    </span>
                  )}
                </Button>
              )}

              {/* Mobile menu toggle */}
              {isAuthenticated && (
                <button
                  className="md:hidden p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-charcoal-900/98">
            <div className="px-4 py-3 space-y-1">
              {userNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <div className="pt-2 pb-1">
                    <p className="text-xs text-muted-foreground px-3 font-medium uppercase tracking-wider">Admin</p>
                  </div>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isActive(item.path)
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-charcoal-900/50 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden border border-amber-500/30">
                <img src="/assets/generated/logo-mark.dim_128x128.png" alt="P2P Trade" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} P2PTrade. All rights reserved.
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with{' '}
              <span className="text-amber-400">♥</span>{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
