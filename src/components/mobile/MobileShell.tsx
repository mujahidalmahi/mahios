'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Wifi, Battery, ArrowLeft, X, Search, ChevronUp, ChevronDown,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity,
  Clock, Shield, ExternalLink, RefreshCw
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// All 28 Applications
import AboutApp from '@/components/apps/AboutApp';
import ExperienceApp from '@/components/apps/ExperienceApp';
import ProjectsApp from '@/components/apps/ProjectsApp';
import SkillsApp from '@/components/apps/SkillsApp';
import EducationApp from '@/components/apps/EducationApp';
import TerminalApp from '@/components/apps/TerminalApp';
import GalleryApp from '@/components/apps/GalleryApp';
import AchievementsApp from '@/components/apps/AchievementsApp';
import BlogApp from '@/components/apps/BlogApp';
import ResumeApp from '@/components/apps/ResumeApp';
import ContactApp from '@/components/apps/ContactApp';
import SettingsApp from '@/components/apps/SettingsApp';

import PhilosophyApp from '@/components/apps/PhilosophyApp';
import FeedApp from '@/components/apps/FeedApp';
import BiographyApp from '@/components/apps/BiographyApp';
import SocialsApp from '@/components/apps/SocialsApp';
import IdeologyApp from '@/components/apps/IdeologyApp';
import EntertainmentApp from '@/components/apps/EntertainmentApp';
import AimApp from '@/components/apps/AimApp';
import DreamApp from '@/components/apps/DreamApp';
import WishesApp from '@/components/apps/WishesApp';
import FavouritesApp from '@/components/apps/FavouritesApp';

// 6 Authentic Built-in OS Tools
import MyComputerApp from '@/components/apps/MyComputerApp';
import RecycleBinApp from '@/components/apps/RecycleBinApp';
import CalculatorApp from '@/components/apps/CalculatorApp';
import NotepadApp from '@/components/apps/NotepadApp';
import PaintApp from '@/components/apps/PaintApp';
import TaskManagerApp from '@/components/apps/TaskManagerApp';
import BlogPostReaderApp from '@/components/apps/BlogPostReaderApp';
import BiographyChapterReaderApp from '@/components/apps/BiographyChapterReaderApp';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image: ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity,
};

interface MobileShellProps {
  data: BiographyDatabaseData;
}

export default function MobileShell({ data }: MobileShellProps) {
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(null);
  const [deepLinkedProjectId, setDeepLinkedProjectId] = useState<string | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const { playSound } = useSystemStore();

  const touchStartY = useRef<number>(0);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Digital clock & date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTimeString(`${hours}:${minutes} ${ampm}`);

      const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      setDateString(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const processDeepLink = () => {
      const result = resolveDeepLink(data);
      if (result) {
        if (result.targetType === 'project' && result.project) {
          setDeepLinkedProjectId(result.project.slug || result.project.id);
        }
        setActiveApp(result.targetApp);
        return true;
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
          if (existingApp) {
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

  // Sorted apps according to sort_order
  const sortedApps = useMemo(() => {
    return [...data.apps].sort((a, b) => a.sort_order - b.sort_order);
  }, [data.apps]);

  // Filtered apps for drawer search
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return sortedApps;
    const q = searchQuery.toLowerCase().trim();
    return sortedApps.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.app_id.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [sortedApps, searchQuery]);

  // Dynamic mobile top 6 quick-launch apps for Home Today screen
  const pinnedApps = useMemo(() => {
    // 1. Prioritize apps explicitly assigned to mobile slots 1..6 (default_x = 1..6)
    const explicitlyPinned = data.apps
      .filter((a) => a.is_visible && a.default_x >= 1 && a.default_x <= 6)
      .sort((a, b) => a.default_x - b.default_x);

    if (explicitlyPinned.length >= 6) {
      return explicitlyPinned.slice(0, 6);
    }

    // 2. If fewer than 6 are explicitly pinned, backfill with highest sort_order visible apps
    const pinnedIds = new Set(explicitlyPinned.map((a) => a.app_id));
    const fallback = data.apps
      .filter((a) => a.is_visible && !pinnedIds.has(a.app_id))
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

    return [...explicitlyPinned, ...fallback].slice(0, 6);
  }, [data.apps]);

  // Touch gesture handling: Swipe up to open drawer, swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    // Swipe up
    if (deltaY > 50 && !isDrawerOpen && !activeApp) {
      playSound('open');
      setIsDrawerOpen(true);
    }
    // Swipe down
    else if (deltaY < -50 && isDrawerOpen && !activeApp) {
      playSound('click');
      setIsDrawerOpen(false);
    }
  };

  const handleOpenApp = (app: DesktopApp) => {
    playSound('open');
    setActiveApp(app);
    setIsDrawerOpen(false);
  };

  const handleCloseApp = () => {
    playSound('click');
    setActiveApp(null);
  };

  const renderAppContent = (componentKey: string) => {
    switch (componentKey) {
      case 'AboutApp': return <AboutApp about={data.about} philosophies={data.philosophies} />;
      case 'ExperienceApp': return <ExperienceApp experiences={data.experiences} />;
      case 'ProjectsApp': return <ProjectsApp projects={data.projects} initialProjectId={deepLinkedProjectId} />;
      case 'SkillsApp': return <SkillsApp categories={data.categories} skills={data.skills} />;
      case 'EducationApp': return <EducationApp education={data.education} />;
      case 'TerminalApp': return <TerminalApp commands={data.terminalCommands} data={data} />;
      case 'GalleryApp': return <GalleryApp categories={data.galleryCategories} images={data.galleryImages} />;
      case 'AchievementsApp': return <AchievementsApp achievements={data.achievements} />;
      case 'BlogApp': return <BlogApp posts={data.blogPosts} />;
      case 'ResumeApp': return <ResumeApp resume={data.resumeConfig} data={data} />;
      case 'ContactApp': return <ContactApp />;
      case 'SettingsApp': return <SettingsApp />;
      case 'PhilosophyApp': return <PhilosophyApp philosophies={data.philosophies} />;
      case 'FeedApp': return <FeedApp feedPosts={data.feedPosts} />;
      case 'BiographyApp': return <BiographyApp biographyTimeline={data.biographyTimeline} />;
      case 'SocialsApp': return <SocialsApp socialLinks={data.socialLinks} />;
      case 'IdeologyApp': return <IdeologyApp ideologies={data.ideologies} />;
      case 'EntertainmentApp': return <EntertainmentApp entertainment={data.entertainment} />;
      case 'AimApp': return <AimApp aims={data.aims} />;
      case 'DreamApp': return <DreamApp dreams={data.dreams} />;
      case 'WishesApp': return <WishesApp wishes={data.wishes} />;
      case 'FavouritesApp': return <FavouritesApp favourites={data.favourites} />;
      case 'MyComputerApp': return <MyComputerApp />;
      case 'RecycleBinApp': return <RecycleBinApp />;
      case 'CalculatorApp': return <CalculatorApp />;
      case 'NotepadApp': return <NotepadApp />;
      case 'PaintApp': return <PaintApp />;
      case 'TaskManagerApp': return <TaskManagerApp />;
      case 'BlogPostReaderApp': {
        const postId = activeApp?.app_id?.replace('blog-', '') || '';
        const post = data.blogPosts.find((p) => p.id === postId || p.slug === postId) || data.blogPosts[0];
        return <BlogPostReaderApp post={post} />;
      }
      case 'BiographyChapterReaderApp': {
        const milestoneId = activeApp?.app_id?.replace(/^(milestone-|bio-ch-)/, '') || '';
        const milestone = data.biographyTimeline.find((m) => m.id === milestoneId) || data.biographyTimeline[0];
        return milestone ? <BiographyChapterReaderApp milestone={milestone} allMilestones={data.biographyTimeline} /> : null;
      }
      default: return <AboutApp about={data.about} />;
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      style={getWallpaperStyle(data.settings?.desktop_background_color)}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] text-black font-sans flex flex-col justify-between select-none overflow-hidden"
    >
      {/* ========================================================= */}
      {/* 1. RETRO POCKET PC TOP STATUS BAR                         */}
      {/* ========================================================= */}
      <div className="h-7 px-2.5 bg-[#c0c0c0] retro-box-outset flex items-center justify-between text-[11px] font-bold shrink-0 z-40 border-b border-gray-400 select-none">
        {/* Left: Vintage Logo + OS Title */}
        <div className="flex items-center gap-1.5">
          <img
            src="/images/mahios-logo.png"
            alt="MahiOS"
            className="w-4 h-4 object-contain drop-shadow-xs"
          />
          <span className="text-[#000080] font-mono tracking-tight text-[11px]">MahiOS 05</span>
        </div>

        {/* Right: Telemetry & Live Clock */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-emerald-700" title="Connected">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-mono font-bold">LIVE</span>
          </div>
          <Wifi className="w-3.5 h-3.5 text-black" />
          <Battery className="w-3.5 h-3.5 text-black" />
          <span className="font-mono text-xs text-black font-bold ml-1">{timeString || '12:00 PM'}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN MOBILE WORKSPACE                                 */}
      {/* ========================================================= */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col p-2.5">
        {/* Background Vintage Dither Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />

        {activeApp ? (
          /* ===================================================== */
          /* 3. ACTIVE APPLICATION FULL-SCREEN WINDOW              */
          /* ===================================================== */
          <div className="relative z-20 w-full h-full bg-[#c0c0c0] retro-box-outset flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            {/* Retro App Window Header */}
            <div className="retro-titlebar px-2 py-1 flex items-center justify-between text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={handleCloseApp}
                className="retro-btn px-2 py-0.5 flex items-center gap-1 text-[11px] font-bold text-[#000080] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <div className="flex items-center gap-1.5 truncate px-2">
                <span className="truncate">{activeApp.title}</span>
              </div>

              <button
                type="button"
                onClick={handleCloseApp}
                className="retro-btn px-1.5 py-0.5 text-red-700 hover:bg-red-200 cursor-pointer"
                title="Close App"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Application Scrollable Body */}
            <div className="flex-1 min-h-0 retro-box-inset bg-white p-2.5 m-1 overflow-y-auto">
              {renderAppContent(activeApp.component_key)}
            </div>
          </div>
        ) : (
          /* ===================================================== */
          /* 4. HOME SCREEN ("TODAY" VIEW)                         */
          /* ===================================================== */
          <div className="relative z-10 flex-1 flex flex-col justify-between overflow-y-auto space-y-3 py-1">
            {/* Digital Clock & Date Today Widget */}
            <div className="retro-box-outset bg-[#c0c0c0] p-3 text-center space-y-1 shadow-md">
              <div className="text-2xl font-mono font-bold text-[#000080] tracking-wider drop-shadow-xs">
                {timeString || '12:00 PM'}
              </div>
              <div className="text-xs font-medium text-gray-700">
                {dateString || 'Thursday, September 3, 2026'}
              </div>
            </div>

            {/* Identity & Status Card */}
            <div className="retro-box-outset bg-[#c0c0c0] p-2.5 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 border-b border-gray-400 pb-1.5">
                <div className="w-9 h-9 retro-box-inset bg-white flex items-center justify-center p-0.5 shrink-0">
                  <img
                    src="/images/mahios-logo.png"
                    alt="Mujahid Al Mahi"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-bold text-xs truncate text-[#000080]">{data.settings.owner_name}</h1>
                  <p className="text-[10px] text-gray-600 truncate">{data.settings.headline}</p>
                </div>
              </div>

              {/* Latest Live Pulse Broadcast */}
              {data.feedPosts?.length > 0 && (
                <div
                  onClick={() => {
                    const feedApp = data.apps.find((a) => a.app_id === 'feed');
                    if (feedApp) handleOpenApp(feedApp);
                  }}
                  className="bg-white retro-box-inset p-1.5 text-[11px] text-gray-800 cursor-pointer hover:bg-yellow-50"
                >
                  <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono mb-0.5">
                    <span className="text-[#000080] font-bold">LATEST PULSE:</span>
                    <span>{data.feedPosts[0].timestamp}</span>
                  </div>
                  <p className="line-clamp-2 leading-tight italic">&ldquo;{data.feedPosts[0].content}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Pinned Default Applications (Quick Launcher) */}
            <div className="retro-box-outset bg-[#c0c0c0] p-2 shadow-md">
              <div className="text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wider px-1 flex items-center justify-between">
                <span>Featured Applications (Top 6)</span>
                <span className="text-[9px] font-mono text-gray-500">MahiOS 05</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {pinnedApps.map((app) => {
                  const Icon = iconMap[app.icon_name] || FileText;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleOpenApp(app)}
                      className="p-1.5 retro-box-outset bg-[#d4d0c8] flex flex-col items-center gap-1 text-center cursor-pointer hover:bg-white active:retro-box-inset"
                    >
                      <div className="w-8 h-8 retro-box-inset bg-white flex items-center justify-center text-[#000080]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium truncate w-full">{app.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll Up Drawer Floating Trigger Handle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playSound('open');
                  setIsDrawerOpen(true);
                }}
                className="w-full retro-btn p-2 flex flex-col items-center justify-center gap-0.5 text-center font-bold text-xs text-[#000080] shadow-lg cursor-pointer animate-bounce"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronUp className="w-4 h-4 text-[#000080]" />
                  <span>Swipe or Tap for All Applications ({data.apps.length})</span>
                  <ChevronUp className="w-4 h-4 text-[#000080]" />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. ALL APPLICATIONS APP DRAWER (SLIDE-UP / SCROLL-UP)     */}
      {/* ========================================================= */}
      {isDrawerOpen && (
        <div
          ref={drawerRef}
          className="fixed inset-x-0 bottom-0 top-7 z-50 bg-[#c0c0c0] retro-box-outset flex flex-col overflow-hidden shadow-2xl animate-slideUp select-none"
        >
          {/* Drawer Header with Pull-Down Handle */}
          <div className="retro-titlebar px-3 py-1.5 flex items-center justify-between font-bold text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <ChevronDown className="w-4 h-4 text-white" />
              <span>All Programs (MahiOS 05)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsDrawerOpen(false);
              }}
              className="retro-btn px-2 py-0.5 text-[11px] font-bold text-[#000080] cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-2.5 flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
            {/* Real-Time Search Bar */}
            <div className="relative flex items-center bg-white border-2 border-[#808080] retro-box-inset px-2.5 py-1.5 shrink-0">
              <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-black p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable Sorted App Grid */}
            <div className="flex-1 min-h-0 retro-box-inset bg-white p-2 overflow-y-auto">
              {filteredApps.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-mono text-xs">
                  No programs found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredApps.map((app) => {
                    const Icon = iconMap[app.icon_name] || FileText;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleOpenApp(app)}
                        className="p-2 retro-box-outset bg-[#d4d0c8] flex items-center gap-2.5 text-left cursor-pointer hover:bg-white active:retro-box-inset transition-none group"
                      >
                        <div className="w-8 h-8 retro-box-inset bg-white flex items-center justify-center text-[#000080] shrink-0 group-hover:scale-105">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs truncate block text-black group-hover:text-[#000080]">
                            {app.title}
                          </span>
                          <span className="text-[9px] text-gray-500 truncate block font-mono">
                            {app.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pull Down to Dismiss Bar */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsDrawerOpen(false);
              }}
              className="w-full retro-btn py-1.5 text-center text-xs font-bold text-gray-800 shrink-0 cursor-pointer flex items-center justify-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Close Programs & Return to Home</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
