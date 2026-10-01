'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wifi, Battery, ArrowLeft, X, Search, ChevronLeft,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Calculator, FileEdit, Activity, Clock, Shield,
  Volume2, VolumeX, Copy, Check,
  Send, ExternalLink, RefreshCw, Tablet, Grid
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// Dedicated Mobile/Tablet Views (100% Touch-Friendly UI, Zero Desktop Windows)
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
} from '@/components/mobile/views';

// Desktop-only and non-touch applications strictly excluded from Tablet OS
const DESKTOP_ONLY_APPS = new Set([
  'my-computer',
  'recycle-bin',
  'terminal',
  'paint',
  'task-manager',
  'settings',
]);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Image: ImageIcon, Award, FileText, FileBadge,
  Mail, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Calculator, FileEdit, Activity, Clock, Shield,
  Tablet, Grid
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
    default: return 'from-blue-600 via-indigo-700 to-blue-900';
  }
};

interface TabletShellProps {
  data: BiographyDatabaseData;
}

export default function TabletShell({ data }: TabletShellProps) {
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(null);
  const [deepLinkedProjectId, setDeepLinkedProjectId] = useState<string | undefined>();
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryTabId>('all');
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');

  const { playSound, soundEnabled, toggleSound } = useSystemStore();

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

  const tabletApps = useMemo(() => {
    return data.apps
      .filter((a) => a.is_visible && !DESKTOP_ONLY_APPS.has(a.app_id))
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [data.apps]);

  const filteredApps = useMemo(() => {
    let list = tabletApps;
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
  }, [tabletApps, selectedCategory, searchQuery]);

  const handleOpenApp = (app: DesktopApp) => {
    playSound('open');
    setActiveApp(app);
    setIsAppDrawerOpen(false);
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
          text: `Check out ${activeApp?.title || 'Mujahid Al Mahi Portfolio'} on MahiOS Pad Edition.`,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert('Direct link copied to clipboard!');
      }
    }
  };

  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'about':
        return <MobileAboutView about={data.about} philosophies={data.philosophies} />;
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
      default:
        return <MobileAboutView about={data.about} philosophies={data.philosophies} />;
    }
  };

  const ActiveAppIcon = activeApp ? (iconMap[activeApp.icon_name] || FileText) : FileText;

  return (
    <div
      style={getWallpaperStyle(data.settings?.desktop_background_color)}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] text-slate-900 font-sans flex flex-col justify-between select-none overflow-hidden bg-cover bg-center"
    >
      {/* ========================================================= */}
      {/* 1. TOP TABLET STATUS BAR (TRANSLUCENT VINTAGE TELEMETRY)  */}
      {/* ========================================================= */}
      <div className="h-8 px-4 bg-black/40 backdrop-blur-md flex items-center justify-between text-xs font-bold shrink-0 z-40 select-none border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-0.5 h-3.5" title="Signal: Full Wi-Fi/Cellular">
            <span className="w-1 h-1.5 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-2 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-2.5 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-3 bg-emerald-400 rounded-2xs" />
          </div>

          <span className="font-mono text-xs font-black text-emerald-400 tracking-wider">
            MAHI PAD
          </span>

          <button
            type="button"
            onClick={toggleSound}
            className="text-slate-400 hover:text-white p-0.5 ml-1 cursor-pointer"
            title={soundEnabled ? 'Mute System Sounds' : 'Unmute System Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
          </button>
        </div>

        <span className="font-mono text-xs font-bold text-white/80 tracking-tight">
          MahiOS Pad Edition
        </span>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-mono hidden md:inline">
            {dateString}
          </span>
          <div className="flex items-center gap-1 font-mono text-xs text-slate-200 font-bold">
            <span>98%</span>
            <div className="w-4 h-2.5 border border-slate-300 p-0.5 flex items-center relative rounded-2xs bg-black/50">
              <div className="h-full w-4/5 bg-emerald-400 rounded-2xs" />
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-white drop-shadow-xs">
            {timeString || '12:00 PM'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN TABLET WORKSPACE                                  */}
      {/* ========================================================= */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col p-3 md:p-6">
        {activeApp ? (
          /* Dedicated In-App Tablet View (No Desktop Window Chrome!) */
          <div className="relative z-20 max-w-3xl w-full mx-auto h-full flex flex-col overflow-hidden bg-slate-50 rounded-2xl shadow-2xl border border-white/20 animate-fadeIn">
            {/* Tablet App Navigation Bar */}
            <div className="h-12 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between font-bold shrink-0">
              <button
                type="button"
                onClick={handleCloseApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-800 font-bold text-xs cursor-pointer border border-slate-200 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span className="tracking-tight text-xs">Home</span>
              </button>

              <div className="flex items-center gap-2 truncate px-3">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 p-1 flex items-center justify-center shrink-0">
                  <ActiveAppIcon className="w-4 h-4" />
                </div>
                <span className="truncate text-sm font-black text-slate-900">
                  {activeApp.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareApp}
                  className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-700 cursor-pointer border border-slate-200"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseApp}
                  className="p-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-xl text-rose-600 cursor-pointer border border-rose-200"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-h-0 bg-slate-50 overflow-y-auto p-4 md:p-6 flex flex-col overscroll-contain">
              {renderAppContent(activeApp.app_id)}
            </div>
          </div>
        ) : (
          /* Home Screen: Pure Wallpaper Only! Nothing on top or center. */
          <div className="relative z-10 flex-1 flex flex-col justify-end">
            {/* The screen shows the wallpaper cleanly! */}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. TABLET BOTTOM NAVIGATION DOCK                          */}
      {/* ========================================================= */}
      <div className="h-18 px-6 pb-2 pt-2 bg-slate-900/75 backdrop-blur-xl border-t border-white/15 flex items-center justify-center shrink-0 z-30 select-none shadow-2xl">
        {activeApp ? (
          <div className="max-w-md w-full flex items-center justify-between">
            <button
              type="button"
              onClick={handleCloseApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/20 shadow-sm cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleCloseApp}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
            >
              <Tablet className="w-4 h-4 text-white" />
              <span>Home Screen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsAppDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 shadow-sm cursor-pointer active:scale-95"
            >
              <Grid className="w-4 h-4 text-cyan-300" />
              <span>Apps</span>
            </button>
          </div>
        ) : (
          /* Tablet Home Dock: Clean Navigators to Apps & Others */
          <div className="max-w-xl w-full grid grid-cols-5 gap-3">
            {/* 1. About / Profile */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'about');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-1 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg border border-blue-400/40">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-bold tracking-tight">About</span>
            </button>

            {/* 2. Projects / Work */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'projects');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-1 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/40">
                <FolderGit2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-bold tracking-tight">Projects</span>
            </button>

            {/* 3. Primary App Launcher Navigator */}
            <button
              type="button"
              onClick={() => {
                playSound('open');
                setIsAppDrawerOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl border-2 border-white/60">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-black tracking-tight text-cyan-300">All Apps</span>
            </button>

            {/* 4. Notes / Memo */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'notepad');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-1 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg border border-amber-400/40">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-bold tracking-tight">Notes</span>
            </button>

            {/* 5. Contact / Email */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'contact');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-1 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg border border-emerald-400/40">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-bold tracking-tight">Contact</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. TABLET APPLICATION DRAWER OVERLAY                      */}
      {/* ========================================================= */}
      {isAppDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn select-none">
          <div className="max-w-2xl w-full h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Applications ({tabletApps.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">MahiOS Pad Edition</p>
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

            <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="relative flex items-center bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                />
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
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
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

            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 overscroll-contain">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-4 gap-x-3">
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
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} vintage-mobile-tile flex items-center justify-center p-3 shadow-md`}
                        >
                          <Icon className="w-7 h-7 text-white drop-shadow-sm group-hover:scale-105 transition-transform" />
                        </div>

                        {app.badge_text && (
                          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[8px] font-black rounded-full border border-white shadow-xs">
                            {app.badge_text}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 w-full mt-1.5 px-0.5 group-hover:text-blue-600">
                        {app.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
