'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Wifi, Battery, ArrowLeft, X, Search, ChevronLeft,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Calculator, FileEdit, Activity, Clock, Shield,
  Phone, PhoneCall, Volume2, VolumeX, Copy, Check,
  Send, ExternalLink, RefreshCw, MessageSquare, Smartphone
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// Dynamically Loaded Mobile Applications
import {
  DynamicAboutApp,
  DynamicExperienceApp,
  DynamicProjectsApp,
  DynamicSkillsApp,
  DynamicEducationApp,
  DynamicGalleryApp,
  DynamicAchievementsApp,
  DynamicBlogApp,
  DynamicResumeApp,
  DynamicContactApp,
  DynamicSettingsApp,
  DynamicPhilosophyApp,
  DynamicFeedApp,
  DynamicBiographyApp,
  DynamicSocialsApp,
  DynamicIdeologyApp,
  DynamicEntertainmentApp,
  DynamicAimApp,
  DynamicDreamApp,
  DynamicWishesApp,
  DynamicFavouritesApp,
  DynamicCalculatorApp,
  DynamicNotepadApp,
  DynamicBlogPostReaderApp,
  DynamicBiographyChapterReaderApp,
} from '@/components/apps/dynamicApps';

// Desktop-only applications strictly excluded from Mobile OS
const DESKTOP_ONLY_APPS = new Set([
  'my-computer',
  'recycle-bin',
  'terminal',
  'paint',
  'task-manager',
]);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Image: ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Calculator, FileEdit, Activity, Clock, Shield,
  Phone, Smartphone, MessageSquare
};

// DTMF audio frequencies for authentic vintage dialer
const DTMF_FREQUENCIES: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'core', label: 'Core' },
  { id: 'career', label: 'Career' },
  { id: 'media', label: 'Media' },
  { id: 'vision', label: 'Vision' },
  { id: 'tools', label: 'Tools' },
] as const;

type CategoryTabId = (typeof CATEGORY_TABS)[number]['id'];

const getAppCategoryGroup = (appId: string): CategoryTabId => {
  switch (appId) {
    case 'about':
    case 'biography':
    case 'experience':
    case 'projects':
      return 'core';
    case 'education':
    case 'resume':
    case 'achievements':
    case 'skills':
      return 'career';
    case 'blog':
    case 'feed':
    case 'gallery':
    case 'entertainment':
    case 'favourites':
      return 'media';
    case 'philosophy':
    case 'ideology':
    case 'aim':
    case 'dream':
    case 'wishes':
      return 'vision';
    case 'socials':
    case 'contact':
    case 'notepad':
    case 'calculator':
    case 'settings':
      return 'tools';
    default:
      return 'core';
  }
};

const getAppGradient = (appId: string): string => {
  switch (appId) {
    case 'about': return 'from-blue-600 via-blue-700 to-indigo-800';
    case 'biography': return 'from-indigo-600 via-purple-700 to-purple-900';
    case 'experience': return 'from-cyan-600 via-teal-700 to-emerald-800';
    case 'projects': return 'from-blue-700 via-indigo-800 to-blue-950';
    case 'skills': return 'from-purple-600 via-violet-700 to-purple-900';
    case 'education': return 'from-emerald-600 via-teal-700 to-teal-900';
    case 'resume': return 'from-amber-600 via-orange-700 to-amber-900';
    case 'achievements': return 'from-yellow-500 via-amber-600 to-yellow-800';
    case 'socials': return 'from-sky-500 via-blue-600 to-sky-800';
    case 'blog': return 'from-rose-600 via-pink-700 to-rose-900';
    case 'feed': return 'from-red-600 via-orange-600 to-red-800';
    case 'gallery': return 'from-teal-500 via-emerald-600 to-teal-800';
    case 'entertainment': return 'from-fuchsia-600 via-purple-700 to-fuchsia-900';
    case 'contact': return 'from-blue-600 via-sky-600 to-blue-800';
    case 'philosophy': return 'from-slate-600 via-gray-700 to-slate-900';
    case 'ideology': return 'from-amber-700 via-stone-700 to-stone-900';
    case 'aim': return 'from-red-600 via-rose-700 to-red-900';
    case 'dream': return 'from-indigo-600 via-violet-700 to-indigo-900';
    case 'wishes': return 'from-orange-500 via-amber-600 to-orange-800';
    case 'favourites': return 'from-yellow-600 via-amber-700 to-yellow-900';
    case 'notepad': return 'from-amber-600 via-yellow-700 to-amber-900';
    case 'calculator': return 'from-slate-700 via-gray-800 to-slate-950';
    case 'settings': return 'from-gray-600 via-slate-700 to-gray-900';
    default: return 'from-blue-600 via-indigo-700 to-blue-900';
  }
};

interface MobileShellProps {
  data: BiographyDatabaseData;
}

export default function MobileShell({ data }: MobileShellProps) {
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(null);
  const [deepLinkedProjectId, setDeepLinkedProjectId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryTabId>('all');
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  const targetPhoneNumber = data.settings?.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '+880 1805128639';
  const [dialedNumber, setDialedNumber] = useState(targetPhoneNumber);

  const { playSound, soundEnabled, toggleSound } = useSystemStore();

  const appsContainerRef = useRef<HTMLDivElement | null>(null);

  // Real-time 12-hour digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTimeString(`${hours}:${minutes} ${ampm}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };
      setDateString(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Deep Link & Window Store Routing
  useEffect(() => {
    const processDeepLink = () => {
      const result = resolveDeepLink(data);
      if (result) {
        if (result.targetType === 'project' && result.project) {
          setDeepLinkedProjectId(result.project.slug || result.project.id);
        }
        // Exclude desktop-only apps from mobile deep links
        if (!DESKTOP_ONLY_APPS.has(result.targetApp.app_id)) {
          setActiveApp(result.targetApp);
          return true;
        }
      }
      return false;
    };

    processDeepLink();

    const handleRouteChange = () => {
      processDeepLink();
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    const unsub = useWindowStore.subscribe((state) => {
      if (state.activeWindowId) {
        const lastWin = state.windows.find((w) => w.appId === state.activeWindowId);
        if (lastWin) {
          const existingApp = data.apps.find((a) => a.app_id === lastWin.appId);
          if (existingApp && !DESKTOP_ONLY_APPS.has(existingApp.app_id)) {
            setActiveApp(existingApp);
          } else if (lastWin.componentKey === 'BlogPostReaderApp' || lastWin.componentKey === 'BiographyChapterReaderApp') {
            setActiveApp({
              id: lastWin.appId,
              app_id: lastWin.appId,
              title: lastWin.title,
              icon_name: lastWin.iconName,
              component_key: lastWin.componentKey,
              default_x: 0,
              default_y: 0,
              default_width: 800,
              default_height: 600,
              is_system_app: false,
              is_visible: true,
              sort_order: 99,
              category: lastWin.componentKey === 'BlogPostReaderApp' ? 'Dev Notes' : 'Biography',
            });
          }
        }
      }
    });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
      unsub();
    };
  }, [data]);

  // Clean, mobile-only application list (Desktop-only apps completely removed)
  const mobileApps = useMemo(() => {
    return data.apps
      .filter((a) => a.is_visible && !DESKTOP_ONLY_APPS.has(a.app_id))
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [data.apps]);

  // Filtered mobile apps by Category tab and Search query
  const filteredApps = useMemo(() => {
    let list = mobileApps;
    if (selectedCategory !== 'all') {
      list = list.filter((a) => getAppCategoryGroup(a.app_id) === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.app_id.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mobileApps, selectedCategory, searchQuery]);

  // DTMF Tone Playback on Key Press
  const playDtmfTone = useCallback((key: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    const freqs = DTMF_FREQUENCIES[key];
    if (!freqs) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.12);
    } catch {}
  }, [soundEnabled]);

  const handleDialKeyPress = (char: string) => {
    playDtmfTone(char);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    setDialedNumber((prev) => (prev.length < 16 ? prev + char : prev));
  };

  const handleDialBackspace = () => {
    playSound('click');
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleDialCall = () => {
    playSound('open');
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${dialedNumber}`;
    }
  };

  const handleWhatsApp = () => {
    playSound('open');
    if (typeof window !== 'undefined') {
      const clean = dialedNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${clean}`, '_blank');
    }
  };

  const handleCopyPhone = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(dialedNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const handleOpenApp = (app: DesktopApp) => {
    playSound('open');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setActiveApp(app);
    setIsDialerOpen(false);
  };

  const handleCloseApp = () => {
    playSound('click');
    setActiveApp(null);
  };

  const handleShareApp = () => {
    playSound('click');
    if (typeof navigator !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: `${activeApp?.title || 'MahiOS'} | Mujahid Al Mahi`,
          text: `Check out ${activeApp?.title || 'Mujahid Al Mahi Portfolio'} on MahiOS Pocket Edition.`,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert('Direct link copied to clipboard!');
      }
    }
  };

  const scrollToApps = () => {
    playSound('click');
    appsContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Render Mobile In-App Content
  const renderAppContent = (componentKey: string) => {
    switch (componentKey) {
      case 'AboutApp':
        return <DynamicAboutApp about={data.about} philosophies={data.philosophies} phone={data.settings?.phone} />;
      case 'ExperienceApp':
        return <DynamicExperienceApp experiences={data.experiences} />;
      case 'ProjectsApp':
        return <DynamicProjectsApp projects={data.projects} initialProjectId={deepLinkedProjectId} />;
      case 'SkillsApp':
        return <DynamicSkillsApp categories={data.categories} skills={data.skills} />;
      case 'EducationApp':
        return <DynamicEducationApp education={data.education} />;
      case 'GalleryApp':
        return <DynamicGalleryApp categories={data.galleryCategories} images={data.galleryImages} />;
      case 'AchievementsApp':
        return <DynamicAchievementsApp achievements={data.achievements} />;
      case 'BlogApp':
        return <DynamicBlogApp posts={data.blogPosts} />;
      case 'ResumeApp':
        return <DynamicResumeApp resume={data.resumeConfig} data={data} />;
      case 'ContactApp':
        return <DynamicContactApp />;
      case 'SettingsApp':
        return <DynamicSettingsApp />;
      case 'PhilosophyApp':
        return <DynamicPhilosophyApp philosophies={data.philosophies} />;
      case 'FeedApp':
        return <DynamicFeedApp feedPosts={data.feedPosts} />;
      case 'BiographyApp':
        return <DynamicBiographyApp biographyTimeline={data.biographyTimeline} />;
      case 'SocialsApp':
        return <DynamicSocialsApp socialLinks={data.socialLinks} />;
      case 'IdeologyApp':
        return <DynamicIdeologyApp ideologies={data.ideologies} />;
      case 'EntertainmentApp':
        return <DynamicEntertainmentApp entertainment={data.entertainment} />;
      case 'AimApp':
        return <DynamicAimApp aims={data.aims} />;
      case 'DreamApp':
        return <DynamicDreamApp dreams={data.dreams} />;
      case 'WishesApp':
        return <DynamicWishesApp wishes={data.wishes} />;
      case 'FavouritesApp':
        return <DynamicFavouritesApp favourites={data.favourites} />;
      case 'CalculatorApp':
        return <DynamicCalculatorApp />;
      case 'NotepadApp':
        return <DynamicNotepadApp />;
      case 'BlogPostReaderApp': {
        const postId = activeApp?.app_id?.replace('blog-', '') || '';
        const post = data.blogPosts.find((p) => p.id === postId || p.slug === postId) || data.blogPosts[0];
        return <DynamicBlogPostReaderApp post={post} />;
      }
      case 'BiographyChapterReaderApp': {
        const milestoneId = activeApp?.app_id?.replace(/^(milestone-|bio-ch-)/, '') || '';
        const milestone = data.biographyTimeline.find((m) => m.id === milestoneId) || data.biographyTimeline[0];
        return milestone ? (
          <DynamicBiographyChapterReaderApp
            milestone={milestone}
            allMilestones={data.biographyTimeline}
          />
        ) : null;
      }
      default:
        return <DynamicAboutApp about={data.about} phone={data.settings?.phone} />;
    }
  };

  const ActiveAppIcon = activeApp ? (iconMap[activeApp.icon_name] || FileText) : FileText;

  return (
    <div
      style={getWallpaperStyle(data.settings?.desktop_background_color)}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] text-slate-900 font-sans flex flex-col justify-between select-none overflow-hidden bg-[#18191c]"
    >
      {/* ========================================================= */}
      {/* 1. AUTHENTIC VINTAGE MOBILE TOP TELEMETRY STATUS BAR     */}
      {/* ========================================================= */}
      <div className="h-7.5 px-3 vintage-status-bar flex items-center justify-between text-xs font-bold shrink-0 z-40 select-none">
        {/* Left: Signal Bars + Carrier + Audio Mode */}
        <div className="flex items-center gap-2">
          {/* 4-Bar Signal Meter */}
          <div className="flex items-end gap-0.5 h-3" title="Signal: Full GSM/4G">
            <span className="w-1 h-1 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-1.5 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-2 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-2.5 bg-emerald-400 rounded-2xs" />
          </div>

          <span className="font-mono text-[10px] font-black text-emerald-400 tracking-wider">
            MAHI 4G
          </span>

          <button
            type="button"
            onClick={toggleSound}
            className="text-slate-400 hover:text-white p-0.5 ml-0.5 cursor-pointer"
            title={soundEnabled ? 'Mute System Sounds' : 'Unmute System Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            )}
          </button>
        </div>

        {/* Center: Pocket OS Badge */}
        <div className="flex items-center gap-1">
          <Smartphone className="w-3 h-3 text-cyan-400" />
          <span className="font-mono text-[10px] font-bold text-slate-200 tracking-tight">
            Pocket MahiOS
          </span>
        </div>

        {/* Right: Battery Gauge & Live Clock */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-300 font-bold">
            <span>98%</span>
            <div className="w-4 h-2.5 border border-slate-300 p-0.5 flex items-center relative rounded-2xs bg-black/40">
              <div className="h-full w-4/5 bg-emerald-400 rounded-2xs" />
              <div className="absolute -right-1 top-0.5 w-0.5 h-1 bg-slate-300 rounded-2xs" />
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-white drop-shadow-xs">
            {timeString || '12:00 PM'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN MOBILE WORKSPACE (HOME SPRINGBOARD OR IN-APP)     */}
      {/* ========================================================= */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {/* Subtle Vintage Mobile Screen Glass / Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px] z-0" />

        {activeApp ? (
          /* ===================================================== */
          /* 3. IN-APP MOBILE VIEW (NATIVE MOBILE, NOT DESKTOP)    */
          /* ===================================================== */
          <div className="relative z-20 w-full h-full flex flex-col overflow-hidden bg-[#eef2f6] animate-fadeIn">
            {/* Vintage Mobile App Navigation Header */}
            <div className="h-11 px-2.5 bg-gradient-to-r from-[#000080] via-[#10489e] to-[#000080] flex items-center justify-between text-white font-bold shrink-0 border-b-2 border-[#000040] shadow-md">
              {/* Back to Home Button */}
              <button
                type="button"
                onClick={handleCloseApp}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/35 rounded-md text-white font-bold text-xs cursor-pointer border border-white/25 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span className="tracking-tight text-[11px]">Home</span>
              </button>

              {/* Title & App Icon */}
              <div className="flex items-center gap-1.5 truncate px-2 max-w-[55%]">
                <div className="w-5 h-5 rounded-md bg-white/20 p-0.5 flex items-center justify-center shrink-0">
                  <ActiveAppIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="truncate text-xs font-bold drop-shadow-xs">
                  {activeApp.title}
                </span>
              </div>

              {/* Right Action Icons (Share & Close) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShareApp}
                  className="p-1 bg-white/15 hover:bg-white/25 active:bg-white/35 rounded-md text-white cursor-pointer border border-white/25"
                  title="Share Application"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseApp}
                  className="p-1 bg-red-600/80 hover:bg-red-600 active:bg-red-700 rounded-md text-white cursor-pointer border border-white/25"
                  title="Close and return to Home"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* App Scrollable Content Body */}
            <div className="flex-1 min-h-0 bg-white overflow-y-auto p-2.5 flex flex-col overscroll-contain">
              {renderAppContent(activeApp.component_key)}
            </div>
          </div>
        ) : (
          /* ===================================================== */
          /* 4. VINTAGE MOBILE HOME SCREEN ("TODAY" SPRINGBOARD)   */
          /* ===================================================== */
          <div className="relative z-10 flex-1 overflow-y-auto p-3 space-y-3 pb-16 overscroll-contain">
            {/* Top LCD Clock & Weather Widget */}
            <div className="vintage-mobile-screen rounded-xl p-3 border-2 border-[#94a3b8] shadow-md flex items-center justify-between">
              <div>
                <div className="text-3xl font-mono font-black text-[#0f2240] tracking-tight leading-none">
                  {timeString || '12:00 PM'}
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  {dateString || 'Thu, Oct 1, 2026'}
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-black tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>ONLINE</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono mt-1 font-semibold">
                  Dhaka, BD • 28°C
                </div>
              </div>
            </div>

            {/* Owner Contact Profile Card (Pocket PC / Palm Style) */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-300 shadow-md space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#000080] to-[#1084d0] p-0.5 shrink-0 shadow-sm flex items-center justify-center">
                  <img
                    src="/images/mahios-logo.png"
                    alt={data.settings?.owner_name || 'Mujahid Al Mahi'}
                    className="w-full h-full object-contain drop-shadow-xs"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-black text-sm text-[#000080] truncate leading-tight">
                    {data.settings?.owner_name || 'Mujahid Al Mahi'}
                  </h1>
                  <p className="text-[11px] text-slate-600 truncate font-medium">
                    {data.settings?.headline || 'Full-Stack Software Engineer & Creative Technologist'}
                  </p>
                </div>
              </div>

              {/* Quick Mobile Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    playSound('open');
                    setIsDialerOpen(true);
                  }}
                  className="py-1.5 px-2 bg-gradient-to-b from-emerald-500 to-emerald-700 active:from-emerald-700 active:to-emerald-800 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const contactApp = data.apps.find((a) => a.app_id === 'contact');
                    if (contactApp) handleOpenApp(contactApp);
                  }}
                  className="py-1.5 px-2 bg-gradient-to-b from-blue-500 to-blue-700 active:from-blue-700 active:to-blue-800 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mail</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-1.5 px-2 bg-gradient-to-b from-teal-500 to-emerald-600 active:from-teal-700 active:to-emerald-800 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Live Broadcast Pulse Card */}
            {data.feedPosts?.length > 0 && (
              <div
                onClick={() => {
                  const feedApp = data.apps.find((a) => a.app_id === 'feed');
                  if (feedApp) handleOpenApp(feedApp);
                }}
                className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-slate-300 shadow-md cursor-pointer hover:bg-yellow-50/80 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                  <div className="flex items-center gap-1 text-[#000080] font-black">
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                    <span>LATEST BROADCAST:</span>
                  </div>
                  <span className="font-semibold">{data.feedPosts[0].timestamp}</span>
                </div>
                <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed italic">
                  &ldquo;{data.feedPosts[0].content}&rdquo;
                </p>
              </div>
            )}

            {/* =================================================== */}
            {/* MOBILE APPLICATION SPRINGBOARD (ICON LAUNCHER)      */}
            {/* =================================================== */}
            <div
              ref={appsContainerRef}
              className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-300 shadow-lg space-y-3"
            >
              {/* Launcher Header & Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#000080]" />
                    <span className="font-black text-xs text-slate-800 uppercase tracking-wide">
                      Applications ({mobileApps.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    Pocket OS
                  </span>
                </div>

                {/* Instant Filter Search Bar */}
                <div className="relative flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-300">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mobile apps..."
                    className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-sans font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORY_TABS.map((tab) => {
                    const isSelected = selectedCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSelectedCategory(tab.id);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#000080] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid of Mobile App Icons */}
              {filteredApps.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-mono text-xs">
                  No applications found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 pt-1">
                  {filteredApps.map((app) => {
                    const Icon = iconMap[app.icon_name] || FileText;
                    const gradient = getAppGradient(app.app_id);

                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleOpenApp(app)}
                        className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-transform"
                      >
                        {/* Squircle App Tile */}
                        <div className="relative">
                          <div
                            className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${gradient} vintage-mobile-tile flex items-center justify-center p-2.5`}
                          >
                            <Icon className="w-6 h-6 text-white drop-shadow-sm group-hover:scale-105 transition-transform" />
                          </div>

                          {/* Optional Badge */}
                          {app.badge_text && (
                            <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-red-600 text-white font-mono text-[8px] font-black rounded-full border border-white shadow-xs">
                              {app.badge_text}
                            </span>
                          )}
                        </div>

                        {/* Title Underneath */}
                        <span className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2 w-full mt-1.5 px-0.5 group-hover:text-[#000080]">
                          {app.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. VINTAGE MOBILE BOTTOM SOFTKEY DOCK (ALWAYS ACCESSIBLE) */}
      {/* ========================================================= */}
      <div className="h-12 vintage-softkey-bar px-3 flex items-center justify-between shrink-0 z-30 select-none">
        {activeApp ? (
          /* Softkeys when inside an active application */
          <>
            <button
              type="button"
              onClick={handleCloseApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-white text-xs font-bold border border-slate-500 shadow-sm cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCloseApp}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-b from-[#000080] to-[#10489e] text-white text-xs font-bold border border-blue-400 shadow-sm cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-cyan-300" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsDialerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-500 shadow-sm cursor-pointer active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dial</span>
            </button>
          </>
        ) : (
          /* Softkeys when on the Home screen */
          <>
            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsDialerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-800 text-white text-xs font-bold border border-emerald-400 shadow-sm cursor-pointer active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-200" />
              <span>Dialer</span>
            </button>

            <button
              type="button"
              onClick={scrollToApps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-white text-xs font-bold border border-slate-500 shadow-sm cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-300" />
              <span>Apps</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const contactApp = data.apps.find((a) => a.app_id === 'contact');
                if (contactApp) handleOpenApp(contactApp);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-b from-blue-600 to-blue-800 text-white text-xs font-bold border border-blue-400 shadow-sm cursor-pointer active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-blue-200" />
              <span>Mail</span>
            </button>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. VINTAGE CELLULAR PHONE DIALER MODAL                     */}
      {/* ========================================================= */}
      {isDialerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] rounded-t-2xl sm:rounded-2xl border-2 border-slate-600 shadow-2xl p-4 flex flex-col space-y-3.5 select-none animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-black">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Mahi Cellular (GSM/CDMA)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound('close');
                  setIsDialerOpen(false);
                }}
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer border border-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Green LCD Number Display */}
            <div className="bg-[#14261d] rounded-xl p-3 border-2 border-[#1e4630] shadow-inner text-right">
              <div className="text-[10px] text-emerald-400/80 font-mono font-bold tracking-wider mb-1 flex items-center justify-between">
                <span>RECIPIENT:</span>
                <span>{data.settings?.owner_name || 'Mujahid Al Mahi'}</span>
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400 tracking-wider truncate">
                {dialedNumber || '—'}
              </div>
            </div>

            {/* 12-Key Vintage Dial Pad */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: '1', sub: ' ' },
                { key: '2', sub: 'ABC' },
                { key: '3', sub: 'DEF' },
                { key: '4', sub: 'GHI' },
                { key: '5', sub: 'JKL' },
                { key: '6', sub: 'MNO' },
                { key: '7', sub: 'PQRS' },
                { key: '8', sub: 'TUV' },
                { key: '9', sub: 'WXYZ' },
                { key: '*', sub: ' ' },
                { key: '0', sub: '+' },
                { key: '#', sub: ' ' },
              ].map(({ key, sub }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDialKeyPress(key)}
                  className="vintage-phone-key h-12 rounded-xl flex flex-col items-center justify-center active:scale-95"
                >
                  <span className="text-lg font-mono font-bold leading-none">{key}</span>
                  {sub.trim() && (
                    <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider mt-0.5">
                      {sub}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dialer Action Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={handleDialBackspace}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 rounded-xl text-xs font-bold border border-slate-600 flex items-center justify-center cursor-pointer"
                title="Backspace"
              >
                <span>⌫</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPhone}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 rounded-xl text-xs font-bold border border-slate-600 flex items-center justify-center gap-1 cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copiedNumber ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="py-2.5 bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white rounded-xl text-xs font-bold border border-teal-500 flex items-center justify-center gap-1 cursor-pointer"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[10px]">WA</span>
              </button>

              <button
                type="button"
                onClick={handleDialCall}
                className="py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:from-emerald-700 active:to-emerald-800 text-white rounded-xl text-xs font-bold border border-emerald-400 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                title="Place Call"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
