'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, User, Briefcase, GraduationCap, FolderGit2,
  Cpu, Award, Image as ImageIcon, FileText, FileBadge,
  AppWindow, Search, Palette, Settings, Mail, LogOut, ExternalLink, Terminal,
  SlidersHorizontal, Compass, Radio, BookOpen, Share2, Scale, Gamepad2,
  Target, Sparkles, Flame, Star, X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navGroups = [
  {
    title: 'Core & Career',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'About Me', href: '/admin/content/about', icon: User },
      { label: 'Experience', href: '/admin/content/experience', icon: Briefcase },
      { label: 'Projects', href: '/admin/content/projects', icon: FolderGit2 },
      { label: 'Skills & Stack', href: '/admin/content/skills', icon: Cpu },
      { label: 'Education', href: '/admin/content/education', icon: GraduationCap },
      { label: 'Biography Timeline', href: '/admin/content/biography', icon: BookOpen },
      { label: 'Achievements', href: '/admin/content/achievements', icon: Award },
      { label: 'Resume Config', href: '/admin/content/resume', icon: FileBadge },
    ],
  },
  {
    title: 'Mindset & Vision',
    items: [
      { label: 'Philosophy & Principles', href: '/admin/content/philosophy', icon: Compass },
      { label: 'Ideology & Ethics', href: '/admin/content/ideology', icon: Scale },
      { label: 'Strategic Aims', href: '/admin/content/aim', icon: Target },
      { label: 'Dreamscape', href: '/admin/content/dream', icon: Sparkles },
      { label: '3 Wishes', href: '/admin/content/wishes', icon: Flame },
    ],
  },
  {
    title: 'Social & Media',
    items: [
      { label: 'Live Feed Posts', href: '/admin/content/feed', icon: Radio },
      { label: 'Social Links Hub', href: '/admin/content/socials', icon: Share2 },
      { label: 'Media & Games', href: '/admin/content/entertainment', icon: Gamepad2 },
      { label: 'Favourites Hall', href: '/admin/content/favourites', icon: Star },
      { label: 'Photo Gallery', href: '/admin/content/gallery', icon: ImageIcon },
      { label: 'Dev Notes Blog', href: '/admin/content/blog', icon: FileText },
      { label: 'Messages Inbox', href: '/admin/messages', icon: Mail },
    ],
  },
  {
    title: 'OS & System Engine',
    items: [
      { label: 'Desktop Apps', href: '/admin/apps', icon: AppWindow },
      { label: 'Terminal MS-DOS', href: '/admin/terminal', icon: Terminal },
      { label: 'BIOS Boot Stream', href: '/admin/boot', icon: SlidersHorizontal },
      { label: 'SEO & Favicon', href: '/admin/seo', icon: Search },
      { label: 'Theme & CRT Shaders', href: '/admin/theme', icon: Palette },
      { label: 'Site Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [filterQuery, setFilterQuery] = useState('');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-20 h-screen w-72 md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md">
              M
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white">MahiOS Admin</h1>
              <p className="text-[10px] font-mono text-emerald-400">Total Freedom Suite</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Filter Search Input */}
        <div className="p-3 border-b border-slate-800 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter studios..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navGroups.map((group, gIdx) => {
            const filteredItems = group.items.filter((item) =>
              item.label.toLowerCase().includes(filterQuery.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                  {group.title}
                </div>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1 shrink-0 bg-slate-950/40">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>View Live MahiOS</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
