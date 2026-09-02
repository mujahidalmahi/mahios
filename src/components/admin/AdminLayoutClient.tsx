'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Terminal, Lock, Loader2, Mail } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';
import { createClient } from '@/lib/supabase/client';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export default function AdminLayoutClient({ children, isAuthenticated }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(!isAuthenticated && !isLoginPage);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count for badge
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return;

    async function fetchUnread() {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        setUnreadCount(count ?? 0);
      } catch {
        // ignore
      }
    }

    fetchUnread();
    // Re-poll every 60s
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isLoginPage]);

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated) {
      window.location.href = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, isLoginPage, pathname]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  if (!isAuthenticated || checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-950/60 border border-blue-800 text-blue-400 flex items-center justify-center shadow-xl shadow-blue-500/10">
          <Lock className="w-8 h-8 animate-pulse text-blue-400" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-white">Restricted Administrator Area</h2>
          <p className="text-xs text-slate-400 font-mono">Authentication Required — Redirecting to Security Gateway...</p>
        </div>
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Global Command Palette */}
      <AdminCommandPalette />

      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 bg-slate-900 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                Live Database Active
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                MahiOS Authenticated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Unread Messages Badge */}
            {unreadCount > 0 && (
              <a
                href="/admin/messages"
                className="relative p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-600 transition-all"
                title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
              >
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </a>
            )}

            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                window.dispatchEvent(event);
              }}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-all"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Search / Jump</span>
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-[10px] font-mono rounded text-slate-300">
                Ctrl+K
              </kbd>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              title="View Live Retro Desktop"
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Live Desktop</span>
            </a>
          </div>
        </header>

        {/* Page Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
}
