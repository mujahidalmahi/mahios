'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wifi, Battery, ArrowLeft, X, Search, ChevronLeft,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Calculator, FileEdit, Activity, Clock, Shield,
  Phone, PhoneCall, Volume2, VolumeX, Copy, Check,
  Send, ExternalLink, RefreshCw, MessageSquare, Smartphone, Grid
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// Dedicated Mobile/Tablet Views (100% Mobile UI, Zero Desktop Logic)
import {
  MobileAboutView,
  MobileProjectsView,
  MobileExperienceView,
  MobileSkillsView,
  MobileEducationView,
  MobileAchievementsView,
  MobileResumeView,
  MobileBlogView,
  MobileBiographyView,
  MobileFeedView,
  MobileSocialsView,
  MobileGalleryView,
  MobileContactView,
  MobileEntertainmentView,
  MobilePhilosophyView,
  MobileIdeologyView,
  MobileAimView,
  MobileDreamView,
  MobileWishesView,
  MobileFavouritesView,
  MobileCalculatorView,
  MobileNotepadView,
  MobileSettingsView,
} from './views';

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
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryTabId>('all');
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  const targetPhoneNumber = data.settings?.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '+880 1805128639';
  const [dialedNumber, setDialedNumber] = useState(targetPhoneNumber);

  const { playSound, soundEnabled, toggleSound } = useSystemStore();

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
            const fallbackAppId = lastWin.componentKey === 'BlogPostReaderApp' ? 'blog' : 'biography';
            const baseApp = data.apps.find((a) => a.app_id === fallbackAppId);
            if (baseApp) {
              setActiveApp(baseApp);
            }
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

  // Clean, mobile-only application list (Desktop-only apps completely filtered out)
  const mobileApps = useMemo(() => {
    return data.apps
      .filter((a) => a.is_visible && !DESKTOP_ONLY_APPS.has(a.app_id))
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [data.apps]);

  // Filtered mobile apps by Category tab and Search query in App Drawer
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
    setIsAppDrawerOpen(false);
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

  // Render Dedicated Mobile View Component (100% Mobile UI, Zero Desktop Windows)
  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'about':
        return <MobileAboutView about={data.about} philosophies={data.philosophies} phone={data.settings?.phone} />;
      case 'projects':
        return <MobileProjectsView projects={data.projects} initialProjectId={deepLinkedProjectId} />;
      case 'experience':
        return <MobileExperienceView experiences={data.experiences} />;
      case 'skills':
        return <MobileSkillsView categories={data.categories} skills={data.skills} />;
      case 'education':
        return <MobileEducationView education={data.education} />;
      case 'achievements':
        return <MobileAchievementsView achievements={data.achievements} />;
      case 'resume':
        return <MobileResumeView resume={data.resumeConfig} data={data} />;
      case 'blog':
        return <MobileBlogView posts={data.blogPosts} />;
      case 'biography':
        return <MobileBiographyView biographyTimeline={data.biographyTimeline} />;
      case 'feed':
        return <MobileFeedView feedPosts={data.feedPosts} />;
      case 'socials':
        return <MobileSocialsView socialLinks={data.socialLinks} />;
      case 'gallery':
        return <MobileGalleryView categories={data.galleryCategories} images={data.galleryImages} />;
      case 'contact':
        return <MobileContactView />;
      case 'entertainment':
        return <MobileEntertainmentView entertainment={data.entertainment} />;
      case 'philosophy':
        return <MobilePhilosophyView philosophies={data.philosophies} />;
      case 'ideology':
        return <MobileIdeologyView ideologies={data.ideologies} />;
      case 'aim':
        return <MobileAimView aims={data.aims} />;
      case 'dream':
        return <MobileDreamView dreams={data.dreams} />;
      case 'wishes':
        return <MobileWishesView wishes={data.wishes} />;
      case 'favourites':
        return <MobileFavouritesView favourites={data.favourites} />;
      case 'calculator':
        return <MobileCalculatorView />;
      case 'notepad':
        return <MobileNotepadView />;
      case 'settings':
        return <MobileSettingsView />;
      default:
        return <MobileAboutView about={data.about} phone={data.settings?.phone} />;
    }
  };

  const ActiveAppIcon = activeApp ? (iconMap[activeApp.icon_name] || FileText) : FileText;

  return (
    <div
      style={getWallpaperStyle(data.settings?.desktop_background_color)}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] text-slate-900 font-sans flex flex-col justify-between select-none overflow-hidden bg-cover bg-center"
    >
      {/* ========================================================= */}
      {/* 1. TOP MOBILE STATUS BAR (TRANSLUCENT VINTAGE TELEMETRY)  */}
      {/* ========================================================= */}
      <div className="h-7 px-3 bg-black/40 backdrop-blur-md flex items-center justify-between text-xs font-bold shrink-0 z-40 select-none border-b border-white/10">
        {/* Left: Signal + Carrier + Audio Mode */}
        <div className="flex items-center gap-2">
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
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            )}
          </button>
        </div>

        {/* Center: Mobile OS Title */}
        <span className="font-mono text-[10px] font-bold text-white/80 tracking-tight">
          Pocket MahiOS
        </span>

        {/* Right: Battery Gauge & Live Clock */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-200 font-bold">
            <span>98%</span>
            <div className="w-3.5 h-2 border border-slate-300 p-0.5 flex items-center relative rounded-2xs bg-black/50">
              <div className="h-full w-4/5 bg-emerald-400 rounded-2xs" />
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-white drop-shadow-xs">
            {timeString || '12:00 PM'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN VIEWPORT AREA                                     */}
      {/* ========================================================= */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
        {activeApp ? (
          /* ===================================================== */
          /* 3. DEDICATED IN-APP MOBILE VIEW                       */
          /* ===================================================== */
          <div className="relative z-20 w-full h-full flex flex-col overflow-hidden bg-slate-50 animate-fadeIn">
            {/* Native Mobile App Top Navigation Bar */}
            <div className="h-11 px-3 bg-white border-b border-slate-200/80 flex items-center justify-between font-bold shrink-0 shadow-2xs">
              {/* Back to Home Button */}
              <button
                type="button"
                onClick={handleCloseApp}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-800 font-bold text-xs cursor-pointer border border-slate-200 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span className="tracking-tight text-[11px]">Home</span>
              </button>

              {/* Title & App Icon */}
              <div className="flex items-center gap-2 truncate px-2 max-w-[55%]">
                <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-700 p-0.5 flex items-center justify-center shrink-0">
                  <ActiveAppIcon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate text-xs font-black text-slate-900">
                  {activeApp.title}
                </span>
              </div>

              {/* Right Action Icons (Share & Close) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShareApp}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-700 cursor-pointer border border-slate-200"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseApp}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-xl text-rose-600 cursor-pointer border border-rose-200"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile App Scrollable Body */}
            <div className="flex-1 min-h-0 bg-slate-50 overflow-y-auto p-3 flex flex-col overscroll-contain">
              {renderAppContent(activeApp.app_id)}
            </div>
          </div>
        ) : (
          /* ===================================================== */
          /* 4. HOME SCREEN: PURE WALLPAPER ONLY                   */
          /* Nothing on top or center! Wallpaper shines through.   */
          /* ===================================================== */
          <div className="relative z-10 flex-1 flex flex-col justify-end p-4">
            {/* The center and top remain completely clean! */}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. VINTAGE MOBILE BOTTOM NAVIGATION DOCK (ALWAYS VISIBLE) */}
      {/* ========================================================= */}
      <div className="h-16 px-4 pb-2 pt-1.5 bg-slate-900/75 backdrop-blur-xl border-t border-white/15 flex items-center justify-between shrink-0 z-30 select-none shadow-2xl">
        {activeApp ? (
          /* Softkey bar when inside an active application */
          <div className="w-full flex items-center justify-between">
            <button
              type="button"
              onClick={handleCloseApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/20 shadow-sm cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCloseApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsDialerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dial</span>
            </button>
          </div>
        ) : (
          /* Home Navigation Dock: Navigators to Apps & Others */
          <div className="w-full grid grid-cols-4 gap-2">
            {/* 1. Phone / Dialer */}
            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsDialerOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg border border-emerald-400/40">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Dialer</span>
            </button>

            {/* 2. Messages / Mail */}
            <button
              type="button"
              onClick={() => {
                const contactApp = data.apps.find((a) => a.app_id === 'contact');
                if (contactApp) handleOpenApp(contactApp);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-lg border border-sky-400/40">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Mail</span>
            </button>

            {/* 3. Primary App Drawer Navigator */}
            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsAppDrawerOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl border-2 border-white/60">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black tracking-tight text-cyan-300">All Apps</span>
            </button>

            {/* 4. Settings */}
            <button
              type="button"
              onClick={() => {
                const settingsApp = data.apps.find((a) => a.app_id === 'settings');
                if (settingsApp) handleOpenApp(settingsApp);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center shadow-lg border border-slate-500/40">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. MOBILE APPLICATION DRAWER (FULL LAUNCHER OVERLAY)      */}
      {/* ========================================================= */}
      {isAppDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn select-none">
          <div className="w-full h-[90dvh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Applications ({mobileApps.length})
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">MahiOS Pocket Edition</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsAppDrawerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input & Category Pills */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="relative flex items-center bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 23 mobile apps..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
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

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                      className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4-Column Mobile App Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 overscroll-contain">
              {filteredApps.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-mono text-xs">
                  No applications found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                  {filteredApps.map((app) => {
                    const Icon = iconMap[app.icon_name] || FileText;
                    const gradient = getAppGradient(app.app_id);

                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleOpenApp(app)}
                        className="flex flex-col items-center text-center group cursor-pointer active:scale-92 transition-transform"
                      >
                        <div className="relative">
                          <div
                            className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${gradient} vintage-mobile-tile flex items-center justify-center p-2.5 shadow-md`}
                          >
                            <Icon className="w-6 h-6 text-white drop-shadow-sm group-hover:scale-105 transition-transform" />
                          </div>

                          {app.badge_text && (
                            <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-red-600 text-white font-mono text-[8px] font-black rounded-full border border-white shadow-xs">
                              {app.badge_text}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2 w-full mt-1.5 px-0.5 group-hover:text-blue-600">
                          {app.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. VINTAGE CELLULAR PHONE DIALER MODAL                     */}
      {/* ========================================================= */}
      {isDialerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] rounded-t-3xl sm:rounded-2xl border-2 border-slate-600 shadow-2xl p-4 flex flex-col space-y-3.5 select-none animate-slideUp">
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
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer border border-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Green LCD Number Display */}
            <div className="bg-[#14261d] rounded-2xl p-3 border-2 border-[#1e4630] shadow-inner text-right">
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
                  className="vintage-phone-key h-12 rounded-2xl flex flex-col items-center justify-center active:scale-95"
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
