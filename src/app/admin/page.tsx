'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, FolderGit2, Cpu, Briefcase, GraduationCap,
  Award, FileText, Image as ImageIcon, MessageSquare, Terminal,
  Plus, ExternalLink, Download, Upload, CheckCircle2,
  AlertCircle, ShieldCheck, Database, Zap, RefreshCw, Compass,
  Radio, BookOpen, Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Clock, Mail, ArrowUpRight, Activity
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { BiographyDatabaseData, ContactMessage } from '@/types/database';

export default function AdminOverviewPage() {
  const [data, setData] = useState<BiographyDatabaseData>(fallbackBiographyData);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [dbStatus, setDbStatus] = useState<'connected' | 'offline'>('connected');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const startTime = performance.now();
      try {
        const supabase = createClient();
        const [
          projectsRes,
          skillsRes,
          experiencesRes,
          blogPostsRes,
          messagesRes,
          galleryRes,
          philRes,
          feedRes,
          bioRes,
          socRes,
          ideRes,
          entRes,
          aimRes,
          drmRes,
          wishRes,
          favRes,
        ] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('skills').select('*'),
          supabase.from('experiences').select('*'),
          supabase.from('blog_posts').select('*'),
          supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('gallery_images').select('*'),
          supabase.from('philosophies').select('*'),
          supabase.from('feed_posts').select('*'),
          supabase.from('biography_milestones').select('*'),
          supabase.from('social_links').select('*'),
          supabase.from('ideologies').select('*'),
          supabase.from('entertainment_items').select('*'),
          supabase.from('aim_items').select('*'),
          supabase.from('dream_items').select('*'),
          supabase.from('wish_items').select('*'),
          supabase.from('favourite_items').select('*'),
        ]);

        const latency = Math.round(performance.now() - startTime);
        setPingMs(latency);

        if (messagesRes.data) {
          setRecentMessages(messagesRes.data as ContactMessage[]);
          const unread = (messagesRes.data as ContactMessage[]).filter((m) => !m.is_read).length;
          setUnreadCount(unread);
        }

        if (projectsRes.data) {
          setData((prev) => ({
            ...prev,
            projects: projectsRes.data && projectsRes.data.length > 0 ? projectsRes.data : prev.projects,
            skills: skillsRes.data && skillsRes.data.length > 0 ? skillsRes.data : prev.skills,
            experiences: experiencesRes.data && experiencesRes.data.length > 0 ? experiencesRes.data : prev.experiences,
            blogPosts: blogPostsRes.data && blogPostsRes.data.length > 0 ? blogPostsRes.data : prev.blogPosts,
            galleryImages: galleryRes.data && galleryRes.data.length > 0 ? galleryRes.data : prev.galleryImages,
            philosophies: philRes.data && philRes.data.length > 0 ? philRes.data : prev.philosophies,
            feedPosts: feedRes.data && feedRes.data.length > 0 ? feedRes.data : prev.feedPosts,
            biographyTimeline: bioRes.data && bioRes.data.length > 0 ? bioRes.data : prev.biographyTimeline,
            socialLinks: socRes.data && socRes.data.length > 0 ? socRes.data : prev.socialLinks,
            ideologies: ideRes.data && ideRes.data.length > 0 ? ideRes.data : prev.ideologies,
            entertainment: entRes.data && entRes.data.length > 0 ? entRes.data : prev.entertainment,
            aims: aimRes.data && aimRes.data.length > 0 ? aimRes.data : prev.aims,
            dreams: drmRes.data && drmRes.data.length > 0 ? drmRes.data : prev.dreams,
            wishes: wishRes.data && wishRes.data.length > 0 ? wishRes.data : prev.wishes,
            favourites: favRes.data && favRes.data.length > 0 ? favRes.data : prev.favourites,
          }));
          setDbStatus('connected');
        }
      } catch {
        setDbStatus('offline');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahios_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', text: 'Complete JSON backup exported successfully!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const statCards = [
    { label: 'Projects & Apps', count: data.projects.length, href: '/admin/content/projects', icon: FolderGit2, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60' },
    { label: 'Skills & Stack', count: data.skills.length, href: '/admin/content/skills', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60' },
    { label: 'Career Positions', count: data.experiences.length, href: '/admin/content/experience', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60' },
    { label: 'Dev Notes & Blog', count: data.blogPosts.length, href: '/admin/content/blog', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60' },
    { label: 'Live Status Posts', count: data.feedPosts.length, href: '/admin/content/feed', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/60' },
    { label: 'Philosophy & Rules', count: data.philosophies.length, href: '/admin/content/philosophy', icon: Compass, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/60' },
    { label: 'Strategic Aims', count: data.aims.length, href: '/admin/content/aim', icon: Target, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60' },
    { label: 'Media & Games', count: data.entertainment.length, href: '/admin/content/entertainment', icon: Gamepad2, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/60' },
    { label: 'Social Channels', count: data.socialLinks.length, href: '/admin/content/socials', icon: Share2, color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800/60' },
    { label: 'Favourites Hall', count: data.favourites.length, href: '/admin/content/favourites', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/60' },
    { label: 'Photo Archives', count: data.galleryImages.length, href: '/admin/content/gallery', icon: ImageIcon, color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/60' },
    { label: 'Desktop OS Apps', count: data.apps.length, href: '/admin/apps', icon: Terminal, color: 'text-slate-300', bg: 'bg-slate-950 border-slate-800' },
  ];

  const quickActions = [
    { label: '+ Add Project', href: '/admin/content/projects', color: 'bg-blue-600 hover:bg-blue-500' },
    { label: '+ Add Status Post', href: '/admin/content/feed', color: 'bg-cyan-600 hover:bg-cyan-500' },
    { label: '+ Add Principle', href: '/admin/content/philosophy', color: 'bg-indigo-600 hover:bg-indigo-500' },
    { label: '+ Add Strategic Aim', href: '/admin/content/aim', color: 'bg-rose-600 hover:bg-rose-500' },
    { label: '+ Add Media / Game', href: '/admin/content/entertainment', color: 'bg-amber-600 hover:bg-amber-500' },
    { label: '+ Add Favourite Item', href: '/admin/content/favourites', color: 'bg-yellow-600 hover:bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
            <span>MahiOS Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic administrative control suite across all 26 database models and retro operating system apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Backup</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/25"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Launch Live Desktop</span>
          </a>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Telemetry Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">PostgreSQL</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {pingMs !== null ? `${pingMs}ms latency` : 'Connected'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Next.js 16</span>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Turbopack Engine</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Security Policy</span>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">RLS Authenticated</p>
          </div>
        </div>

        <Link
          href="/admin/messages"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 flex items-center gap-3.5 shadow-lg group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Inquiries</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 group-hover:text-blue-400 transition-colors">
              Open Inbox →
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Actions Stream */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Quick Studio Actions</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {quickActions.map((act, i) => (
            <Link
              key={i}
              href={act.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${act.color}`}
            >
              {act.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Entities & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entities Metric Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Studio Entities (26 Models)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Press Ctrl+K to jump anywhere
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.href}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all flex flex-col justify-between gap-2.5 group shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg border ${card.bg} ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-black font-mono text-white group-hover:text-blue-400 transition-colors">
                      {card.count}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {card.label}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <span>Manage</span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Inquiries & Activity Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Recent Inquiries</span>
            </h2>
            <Link href="/admin/messages" className="text-[11px] font-mono text-blue-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800 overflow-hidden shadow-lg">
            {recentMessages.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <Mail className="w-6 h-6 text-slate-600 mx-auto" />
                <p>No messages received yet</p>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="p-3.5 block hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-xs truncate ${!msg.is_read ? 'font-bold text-white' : 'text-slate-300'}`}>
                      {msg.sender_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate group-hover:text-blue-300 transition-colors">
                    {msg.subject}
                  </p>
                </Link>
              ))
            )}
          </div>

          {/* Quick System Info Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Information</h4>
            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Kernel:</span>
                <span className="text-slate-200">MahiOS v2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-emerald-400">Supabase Cloud</span>
              </div>
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="text-blue-400">Next.js 16 SSR</span>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <span className="text-purple-400">Cloudinary / Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
