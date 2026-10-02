'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wifi, WifiOff, Battery, BatteryCharging, ArrowLeft, X, Search, ChevronLeft, ChevronRight,
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Compass, Radio, BookOpen, Share2,
  Scale, Gamepad2, Target, Sparkles, Flame, Star,
  Calculator, FileEdit, Activity, Clock, Shield,
  Volume2, VolumeX, Copy, Check,
  Send, ExternalLink, RefreshCw, Tablet, Grid,
  Sun, Moon, Flashlight, Bell, BellOff, Lock, Unlock,
  Layers, Square, Palette, Sliders, Zap
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// Dedicated Touch-Friendly Views (Zero Desktop Window Chrome)
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

interface WallpaperPreset {
  id: string;
  name: string;
  preview: string;
  bgStyle: React.CSSProperties;
}

const OPTIONAL_WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'cosmic-obsidian',
    name: 'Cosmic Obsidian',
    preview: 'bg-[#0f172a]',
    bgStyle: {
      background: 'radial-gradient(ellipse at bottom, #1e1b4b 0%, #090a0f 100%)',
    },
  },
  {
    id: 'vintage-blue',
    name: 'Cobalt Night',
    preview: 'bg-blue-900',
    bgStyle: {
      background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #0f172a 100%)',
    },
  },
  {
    id: 'retro-teal',
    name: 'Vintage 95 Teal',
    preview: 'bg-[#008080]',
    bgStyle: {
      backgroundColor: '#008080',
    },
  },
  {
    id: 'cyber-neon',
    name: 'Neon Cyberpunk',
    preview: 'bg-purple-950',
    bgStyle: {
      background: 'linear-gradient(135deg, #18002e 0%, #4a0072 50%, #0d001a 100%)',
    },
  },
  {
    id: 'matrix-terminal',
    name: 'Emerald Matrix',
    preview: 'bg-emerald-950',
    bgStyle: {
      background: 'linear-gradient(180deg, #022c22 0%, #051c14 100%)',
    },
  },
  {
    id: 'sunset-amber',
    name: 'Solar Amber',
    preview: 'bg-amber-950',
    bgStyle: {
      background: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1c1917 100%)',
    },
  },
];

interface TabletNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  appId?: string;
}

const INITIAL_NOTIFICATIONS: TabletNotification[] = [
  {
    id: 'n1',
    title: 'MahiOS Pad Edition Ready',
    text: 'Tablet Operating System initialized. High-resolution canvas ready.',
    time: 'Just now',
    appId: 'about',
  },
  {
    id: 'n2',
    title: 'Software Systems Engineer Availability',
    text: 'Mujahid is open for architecture, full-stack, and systems roles.',
    time: '4m ago',
    appId: 'contact',
  },
  {
    id: 'n3',
    title: 'Real-Time Dhaka Telemetry Node',
    text: 'Primary node latency 14ms. Ready for connections.',
    time: '12m ago',
    appId: 'feed',
  },
];

interface TabletShellProps {
  data: BiographyDatabaseData;
}

export default function TabletShell({ data }: TabletShellProps) {
  // Tablet OS Lifecycle States
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(null);
  const [appHistory, setAppHistory] = useState<string[]>([]);
  const [recentApps, setRecentApps] = useState<DesktopApp[]>(() => {
    return data.apps.filter((a) => !DESKTOP_ONLY_APPS.has(a.app_id)).slice(0, 5);
  });
  const [deepLinkedProjectId, setDeepLinkedProjectId] = useState<string | undefined>();
  const [deepLinkedPostId, setDeepLinkedPostId] = useState<string | undefined>();
  const [deepLinkedMilestoneId, setDeepLinkedMilestoneId] = useState<string | undefined>();

  // OS Overlays
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [isNotificationShadeOpen, setIsNotificationShadeOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isWallpaperPickerOpen, setIsWallpaperPickerOpen] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Quick Settings Controls
  const [brightness, setBrightness] = useState(100);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);

  // Telemetry & Hardware State
  const [batteryLevel, setBatteryLevel] = useState(98);
  const [isCharging, setIsCharging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [selectedWallpaperId, setSelectedWallpaperId] = useState<string>('system');

  // Search & Notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryTabId>('all');
  const [notifications, setNotifications] = useState<TabletNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string } | null>(null);

  const { playSound, soundEnabled, toggleSound } = useSystemStore();

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (style === 'light') navigator.vibrate(12);
      else if (style === 'medium') navigator.vibrate(25);
      else if (style === 'heavy') navigator.vibrate([35, 20, 35]);
    }
  };

  const showToast = (title: string, message: string) => {
    setActiveToast({ title, message });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.title === title ? null : curr));
    }, 2800);
  };

  // Restore saved wallpaper preference (defaults to system desktop wallpaper)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWp = localStorage.getItem('mahios_tablet_wallpaper');
      if (savedWp && savedWp !== 'default') {
        setSelectedWallpaperId(savedWp);
      } else {
        setSelectedWallpaperId('system');
      }
      setIsOnline(navigator.onLine);
    }
  }, []);

  // Real-time 12-hour digital clock & date
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

  // Hardware Telemetry Listeners (Battery & Network)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network Connected', 'Tablet Wi-Fi node connected');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Network Disconnected', 'Operating in Offline Cache mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        const onLevelChange = () => setBatteryLevel(Math.round(battery.level * 100));
        const onChargingChange = () => setIsCharging(battery.charging);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargingChange);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Deep Link & Window Store Routing
  useEffect(() => {
    const processDeepLink = () => {
      const result = resolveDeepLink(data);
      if (result) {
        if (result.targetType === 'project' && result.project) {
          setDeepLinkedProjectId(result.project.slug || result.project.id);
        }
        if (result.targetType === 'blog_post' && result.blogPost) {
          setDeepLinkedPostId(result.blogPost.slug || result.blogPost.id);
        }
        if (result.targetType === 'biography_chapter' && result.biographyChapter) {
          setDeepLinkedMilestoneId(result.biographyChapter.id);
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

  // Clean, tablet-only application list
  const tabletApps = useMemo(() => {
    return data.apps
      .filter((a) => a.is_visible && !DESKTOP_ONLY_APPS.has(a.app_id))
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [data.apps]);

  // Global Unified Search Results across Apps, Projects, Blog, Skills
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    const matchedApps = tabletApps.filter(
      (a) => a.title.toLowerCase().includes(q) || a.app_id.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );

    const matchedProjects = (data.projects || []).filter(
      (p) => p.title.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 6);

    const matchedBlog = (data.blogPosts || []).filter(
      (b) => b.title.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedSkills = (data.skills || []).filter(
      (s) => s.name.toLowerCase().includes(q)
    ).slice(0, 6);

    return {
      apps: matchedApps,
      projects: matchedProjects,
      blog: matchedBlog,
      skills: matchedSkills,
    };
  }, [searchQuery, tabletApps, data.projects, data.blogPosts, data.skills]);

  // Filtered tablet apps by Category tab
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

  // Open Application with Back-Stack & Recents integration
  const handleOpenApp = (app: DesktopApp, pushHistory = true) => {
    playSound('open');
    triggerHaptic('medium');

    if (activeApp && activeApp.app_id !== app.app_id) {
      setAppHistory((prev) => [...prev, activeApp.app_id]);
    }

    setActiveApp(app);
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(false);
    setIsNotificationShadeOpen(false);

    setRecentApps((prev) => {
      const withoutCurrent = prev.filter((a) => a.app_id !== app.app_id);
      return [app, ...withoutCurrent].slice(0, 10);
    });

    if (pushHistory && typeof window !== 'undefined') {
      window.history.pushState({ appId: app.app_id }, '', `?app=${app.app_id}`);
    }
  };

  // Hardware / Softkey Back Logic
  const handleBack = () => {
    playSound('click');
    triggerHaptic('light');

    if (isTorchOn) {
      setIsTorchOn(false);
      return;
    }
    if (isWallpaperPickerOpen) {
      setIsWallpaperPickerOpen(false);
      return;
    }
    if (isNotificationShadeOpen) {
      setIsNotificationShadeOpen(false);
      return;
    }
    if (isRecentsOpen) {
      setIsRecentsOpen(false);
      return;
    }
    if (isAppDrawerOpen) {
      setIsAppDrawerOpen(false);
      return;
    }

    if (appHistory.length > 0) {
      const previousAppId = appHistory[appHistory.length - 1];
      setAppHistory((prev) => prev.slice(0, -1));
      const targetApp = data.apps.find((a) => a.app_id === previousAppId);
      if (targetApp) {
        setActiveApp(targetApp);
        return;
      }
    }

    if (activeApp) {
      setActiveApp(null);
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.pushState({}, '', window.location.pathname);
      }
    }
  };

  // Home Button: Return to wallpaper home screen
  const handleHome = () => {
    playSound('click');
    triggerHaptic('light');

    setActiveApp(null);
    setIsAppDrawerOpen(false);
    setIsRecentsOpen(false);
    setIsNotificationShadeOpen(false);
    setIsWallpaperPickerOpen(false);
    setAppHistory([]);
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  // Multitasking: Close individual recent app
  const handleDismissRecentApp = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    triggerHaptic('light');

    setRecentApps((prev) => prev.filter((a) => a.app_id !== appId));
    if (activeApp?.app_id === appId) {
      setActiveApp(null);
    }
  };

  // Multitasking: Clear all recent apps
  const handleClearAllRecents = () => {
    playSound('click');
    triggerHaptic('heavy');
    setRecentApps([]);
    setActiveApp(null);
    setIsRecentsOpen(false);
    showToast('Task Manager', 'All background tasks cleared');
  };

  // Wallpaper selection handler
  const handleSelectWallpaper = (wpId: string) => {
    playSound('click');
    triggerHaptic('light');
    setSelectedWallpaperId(wpId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahios_tablet_wallpaper', wpId);
    }
    setIsWallpaperPickerOpen(false);
    showToast('Wallpaper Updated', 'New tablet theme applied');
  };

  const wallpaperPresets = useMemo<WallpaperPreset[]>(() => {
    return [
      {
        id: 'system',
        name: 'System Desktop Wallpaper',
        preview: 'bg-slate-900',
        bgStyle: getWallpaperStyle(data.settings?.desktop_background_color),
      },
      ...OPTIONAL_WALLPAPER_PRESETS,
    ];
  }, [data.settings?.desktop_background_color]);

  const activeWallpaper = useMemo(() => {
    if (!selectedWallpaperId || selectedWallpaperId === 'system' || selectedWallpaperId === 'default') {
      return getWallpaperStyle(data.settings?.desktop_background_color);
    }
    const found = wallpaperPresets.find((w) => w.id === selectedWallpaperId);
    return found ? found.bgStyle : getWallpaperStyle(data.settings?.desktop_background_color);
  }, [selectedWallpaperId, wallpaperPresets, data.settings?.desktop_background_color]);

  const handleShareApp = () => {
    playSound('click');
    triggerHaptic('light');
    if (typeof navigator !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: `${activeApp?.title || 'MahiOS'} | Mujahid Al Mahi`,
          text: `Check out ${activeApp?.title || 'Mujahid Al Mahi Portfolio'} on MahiOS Pad Edition.`,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link Copied', 'Direct URL saved to clipboard');
      }
    }
  };

  // Render Dedicated Tablet View Component
  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'about':
        return (
          <MobileAboutView
            about={data.about}
            philosophies={data.philosophies}
            phone={data.settings?.phone}
            email={data.settings?.email}
            location={data.settings?.location}
            website={data.settings?.site_title}
          />
        );
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
        return <MobileBlogView posts={data.blogPosts} initialPostId={deepLinkedPostId} />;
      case 'biography':
        return <MobileBiographyView biographyTimeline={data.biographyTimeline} initialMilestoneId={deepLinkedMilestoneId} />;
      case 'feed':
        return <MobileFeedView feedPosts={data.feedPosts} authorAvatar={data.settings?.avatar_url || data.about?.avatar_url} />;
      case 'socials':
        return <MobileSocialsView socialLinks={data.socialLinks} />;
      case 'gallery':
        return <MobileGalleryView categories={data.galleryCategories} images={data.galleryImages} />;
      case 'contact':
        return (
          <MobileContactView
            contactEmail={data.settings?.email}
            phone={data.settings?.phone}
            location={data.settings?.location || data.about?.location}
            githubUrl={data.settings?.github_url}
            linkedinUrl={data.settings?.linkedin_url}
            socialLinks={data.socialLinks}
          />
        );
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
        return (
          <MobileAboutView
            about={data.about}
            philosophies={data.philosophies}
            phone={data.settings?.phone}
            email={data.settings?.email}
            location={data.settings?.location}
          />
        );
    }
  };

  const ActiveAppIcon = activeApp ? (iconMap[activeApp.icon_name] || FileText) : FileText;

  return (
    <div
      style={activeWallpaper}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] text-slate-900 font-sans flex flex-col justify-between select-none overflow-hidden bg-cover bg-center"
    >
      {/* ------------------------------------------------------------- */}
      {/* 0. HARDWARE BRIGHTNESS DIMMING OVERLAY                        */}
      {/* ------------------------------------------------------------- */}
      <div
        className="fixed inset-0 pointer-events-none z-50 bg-black transition-opacity duration-300"
        style={{ opacity: Math.max(0, (100 - brightness) * 0.0075) }}
      />

      {/* ------------------------------------------------------------- */}
      {/* SCREEN FLASHLIGHT / TORCH OVERLAY                            */}
      {/* ------------------------------------------------------------- */}
      {isTorchOn && (
        <div
          onClick={() => setIsTorchOn(false)}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-slate-900 cursor-pointer animate-fadeIn"
        >
          <Flashlight className="w-20 h-20 text-amber-500 animate-pulse mb-4" />
          <h2 className="text-2xl font-black">Screen Torch Active</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">Tap anywhere to turn off</p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TABLET STANDBY / LOCK SCREEN                                  */}
      {/* ------------------------------------------------------------- */}
      {isLocked && (
        <div
          onClick={() => {
            playSound('open');
            triggerHaptic('medium');
            setIsLocked(false);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-between p-10 text-white cursor-pointer select-none animate-fadeIn"
        >
          {/* Top lock bar */}
          <div className="w-full flex items-center justify-between max-w-2xl text-xs font-mono text-white/70">
            <div className="flex items-center gap-2">
              {wifiEnabled ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
              <span>{wifiEnabled ? 'Dhaka Net 5G' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>System Locked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>{batteryLevel}%</span>
              {isCharging ? <BatteryCharging className="w-4 h-4 text-emerald-400" /> : <Battery className="w-4 h-4" />}
            </div>
          </div>

          {/* Center Clock & Date */}
          <div className="flex flex-col items-center justify-center text-center my-auto">
            <span className="text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-2xl">
              {timeString || '12:00 PM'}
            </span>
            <span className="text-lg md:text-xl font-medium text-white/80 mt-2 tracking-wide">
              {dateString}
            </span>

            {/* Notifications Pill */}
            {notifications.length > 0 && (
              <div className="mt-8 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2.5 text-sm font-semibold">
                <Bell className="w-4 h-4 text-amber-300" />
                <span>{notifications.length} Pending Notifications</span>
              </div>
            )}
          </div>

          {/* Bottom unlock swipe prompt */}
          <div className="flex flex-col items-center gap-2 pb-6">
            <div className="w-12 h-1 bg-white/40 rounded-full animate-bounce" />
            <span className="text-xs uppercase tracking-widest text-white/70 font-bold">
              Tap anywhere to unlock Tablet OS
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* HEADS-UP TOAST NOTIFICATION                                   */}
      {/* ------------------------------------------------------------- */}
      {activeToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-900/90 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-slideDown pointer-events-none">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black truncate">{activeToast.title}</p>
            <p className="text-[11px] text-slate-300 truncate">{activeToast.message}</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP TABLET STATUS BAR (TAP TO DROP CONTROL SHADE)      */}
      {/* ========================================================= */}
      <div
        onClick={() => {
          playSound('click');
          triggerHaptic('light');
          setIsNotificationShadeOpen(!isNotificationShadeOpen);
        }}
        className="h-9 px-6 bg-black/45 backdrop-blur-md flex items-center justify-between text-xs font-bold shrink-0 z-40 select-none border-b border-white/10 cursor-pointer hover:bg-black/55 transition-colors"
        title="Tap to open Control Center & Notifications"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-0.5 h-3.5" title="Signal: Full 5G Wi-Fi">
            <span className="w-1 h-1.5 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-2 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-2.5 bg-emerald-400 rounded-2xs" />
            <span className="w-1 h-3 bg-emerald-400 rounded-2xs" />
          </div>

          <span className="font-mono text-xs font-black text-emerald-400 tracking-wider">
            MAHI PAD
          </span>

          <span className="hidden sm:inline text-[11px] text-slate-300 font-mono">
            {wifiEnabled ? (isOnline ? 'Dhaka Cloud 5G' : 'Offline') : 'Radio Off'}
          </span>

          {dndEnabled && (
            <span className="flex items-center gap-1 text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/40">
              <BellOff className="w-3 h-3" />
              <span>DND</span>
            </span>
          )}

          {batterySaver && (
            <span className="flex items-center gap-1 text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
              <Zap className="w-3 h-3" />
              <span>Eco</span>
            </span>
          )}
        </div>

        {/* Center Pill Grab Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1 bg-white/30 rounded-full hover:bg-white/60 transition-colors" />
        </div>

        {/* Right Status Telemetry */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
            className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
            title={soundEnabled ? 'Mute System Sounds' : 'Unmute System Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
          </button>

          <span className="text-xs text-slate-300 font-mono hidden md:inline">
            {dateString}
          </span>

          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-200 font-bold">
            <span>{batteryLevel}%</span>
            {isCharging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            ) : (
              <div className="w-4 h-2.5 border border-slate-300 p-0.5 flex items-center relative rounded-2xs bg-black/50">
                <div
                  className="h-full bg-emerald-400 rounded-2xs"
                  style={{ width: `${Math.min(100, Math.max(10, batteryLevel))}%` }}
                />
              </div>
            )}
          </div>

          <span className="font-mono text-xs font-black text-white drop-shadow-xs">
            {timeString || '12:00 PM'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PULL-DOWN CONTROL CENTER & NOTIFICATION SHADE          */}
      {/* ========================================================= */}
      {isNotificationShadeOpen && (
        <div
          onClick={() => setIsNotificationShadeOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-start p-4 md:p-8 animate-fadeIn select-none overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white animate-slideDown my-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Tablet Control Center</h3>
                  <p className="text-xs text-slate-400 font-mono">{dateString} • {timeString}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNotificationShadeOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dual Panel Grid: Quick Toggles (Left) & Notifications (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Quick Settings Tiles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Controls</h4>

                <div className="grid grid-cols-3 gap-3">
                  {/* Wi-Fi Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setWifiEnabled(!wifiEnabled);
                      showToast('Wi-Fi', !wifiEnabled ? 'Wi-Fi Connected' : 'Wi-Fi Disabled');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border ${
                      wifiEnabled ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    <span className="text-[11px] font-bold">Wi-Fi</span>
                  </button>

                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleSound();
                      showToast('Audio', !soundEnabled ? 'System Sounds On' : 'Silent Mode');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border ${
                      soundEnabled ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
                    <span className="text-[11px] font-bold">Sound</span>
                  </button>

                  {/* Flashlight / Torch */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setIsTorchOn(true);
                      setIsNotificationShadeOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-slate-300"
                  >
                    <Flashlight className="w-5 h-5 text-amber-400" />
                    <span className="text-[11px] font-bold">Torch</span>
                  </button>

                  {/* Do Not Disturb */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setDndEnabled(!dndEnabled);
                      showToast('Do Not Disturb', !dndEnabled ? 'DND Activated' : 'DND Deactivated');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border ${
                      dndEnabled ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {dndEnabled ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    <span className="text-[11px] font-bold">DND</span>
                  </button>

                  {/* Battery Saver */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setBatterySaver(!batterySaver);
                      showToast('Power', !batterySaver ? 'Battery Saver On' : 'Standard Performance');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border ${
                      batterySaver ? 'bg-amber-600 border-amber-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Eco</span>
                  </button>

                  {/* Wallpaper Theme */}
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setIsWallpaperPickerOpen(true);
                      setIsNotificationShadeOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-slate-300"
                  >
                    <Palette className="w-5 h-5 text-pink-400" />
                    <span className="text-[11px] font-bold">Themes</span>
                  </button>
                </div>

                {/* Brightness Slider */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-400" />
                      Screen Brightness
                    </span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Lock Device Button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setIsLocked(true);
                    setIsNotificationShadeOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-white/15"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Lock Tablet Standby</span>
                </button>
              </div>

              {/* Notifications Panel */}
              <div className="space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setNotifications([]);
                        showToast('Notifications', 'Cleared all');
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-60 pr-1">
                  {notifications.length === 0 ? (
                    <div className="h-36 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                      <BellOff className="w-6 h-6" />
                      <span>No active notifications</span>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-white truncate">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{n.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                          }}
                          className="text-slate-500 hover:text-white p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MULTITASKING RECENTS SWITCHER OVERLAY                  */}
      {/* ========================================================= */}
      {isRecentsOpen && (
        <div
          onClick={() => setIsRecentsOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex flex-col justify-between p-6 md:p-10 animate-fadeIn select-none"
        >
          <div className="flex items-center justify-between text-white max-w-4xl w-full mx-auto">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-black tracking-tight">Active Applications ({recentApps.length})</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsRecentsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {recentApps.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/60 gap-3">
              <Square className="w-12 h-12 stroke-[1.5]" />
              <p className="text-sm font-bold">No background tasks running</p>
              <button
                type="button"
                onClick={() => {
                  setIsRecentsOpen(false);
                  setIsAppDrawerOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs mt-2 cursor-pointer shadow-lg"
              >
                Launch an Application
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center overflow-x-auto py-6 gap-6 max-w-5xl mx-auto w-full scrollbar-none">
              {recentApps.map((app) => {
                const Icon = iconMap[app.icon_name] || FileText;
                const gradient = getAppGradient(app.app_id);
                const isCurrentActive = activeApp?.app_id === app.app_id;

                return (
                  <div
                    key={app.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenApp(app);
                    }}
                    className={`relative w-64 h-84 shrink-0 rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-200 flex flex-col border ${
                      isCurrentActive ? 'ring-4 ring-blue-500 scale-105 border-blue-400' : 'border-white/20 hover:scale-102 hover:border-white/40'
                    } bg-slate-900`}
                  >
                    {/* App Card Header */}
                    <div className="h-12 px-4 bg-slate-800/90 border-b border-white/10 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white p-1.5 shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-white truncate">{app.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDismissRecentApp(app.app_id, e)}
                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                        title="Dismiss task"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* App Card Mock Preview */}
                    <div className="flex-1 bg-slate-950/70 p-4 flex flex-col justify-center items-center text-center text-slate-400">
                      <Icon className="w-12 h-12 text-white/30 mb-3" />
                      <p className="text-xs font-bold text-white/80">{app.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 capitalize">{app.category} Module</p>
                      <span className="mt-4 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold text-blue-300">
                        {isCurrentActive ? 'Active in Foreground' : 'Tap to Resume'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recents Footer Actions */}
          <div className="flex items-center justify-center gap-4 max-w-sm mx-auto w-full">
            {recentApps.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllRecents}
                className="px-6 py-2.5 rounded-2xl bg-rose-600/80 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-bold shadow-xl border border-rose-400/40 cursor-pointer active:scale-95 transition-all"
              >
                Clear All Tasks
              </button>
            )}
            <button
              type="button"
              onClick={handleHome}
              className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold shadow-xl border border-white/20 cursor-pointer active:scale-95 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. WALLPAPER PERSONALIZATION PICKER MODAL                 */}
      {/* ========================================================= */}
      {isWallpaperPickerOpen && (
        <div
          onClick={() => setIsWallpaperPickerOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full bg-slate-900/95 border border-white/20 rounded-3xl p-6 shadow-2xl text-white animate-scaleUp"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-pink-400" />
                <h3 className="text-base font-black">Personalize Tablet Wallpaper</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWallpaperPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              {wallpaperPresets.map((wp) => {
                const isSelected =
                  selectedWallpaperId === wp.id ||
                  (wp.id === 'system' && (selectedWallpaperId === 'system' || selectedWallpaperId === 'default' || !selectedWallpaperId));
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => handleSelectWallpaper(wp.id)}
                    className={`relative rounded-2xl p-3 flex flex-col items-center gap-2.5 border text-left cursor-pointer transition-all active:scale-95 ${
                      isSelected ? 'ring-4 ring-pink-500 border-white bg-white/15' : 'border-white/15 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div
                      style={wp.bgStyle}
                      className="w-full h-20 rounded-xl shadow-inner border border-white/20 flex items-center justify-center bg-cover bg-center"
                    >
                      {isSelected && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                    </div>
                    <span className="text-xs font-bold text-white truncate w-full text-center">{wp.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MAIN TABLET WORKSPACE                                  */}
      {/* ========================================================= */}
      <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col p-3 md:p-6">
        {activeApp ? (
          /* Dedicated In-App Tablet View (No Desktop Window Chrome!) */
          <div className="relative z-20 max-w-4xl w-full mx-auto h-full flex flex-col overflow-hidden bg-slate-50 rounded-3xl shadow-2xl border border-white/25 animate-fadeIn">
            {/* Tablet App Navigation Bar */}
            <div className="h-13 px-5 bg-white border-b border-slate-200/80 flex items-center justify-between font-bold shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-800 font-bold text-xs cursor-pointer border border-slate-200 active:scale-95 transition-all"
                  title="Back"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                  <span className="tracking-tight text-xs">Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleHome}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-800 font-bold text-xs cursor-pointer border border-slate-200 active:scale-95 transition-all"
                  title="Home"
                >
                  Home
                </button>
              </div>

              <div className="flex items-center gap-2.5 truncate px-4">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                  <ActiveAppIcon className="w-4 h-4" />
                </div>
                <span className="truncate text-sm font-black text-slate-900 tracking-tight">
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
                  onClick={handleHome}
                  className="p-2 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-xl text-rose-600 cursor-pointer border border-rose-200"
                  title="Close App"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-h-0 bg-slate-50 overflow-y-auto p-4 md:p-8 flex flex-col overscroll-contain">
              {renderAppContent(activeApp.app_id)}
            </div>
          </div>
        ) : (
          /* Home Screen: Pure Wallpaper Only! No clutter on top or center. */
          <div className="relative z-10 flex-1 flex flex-col justify-end">
            {/* The wallpaper displays unobstructed */}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. TABLET BOTTOM NAVIGATION DOCK & THREE-KEY SOFTKEYS     */}
      {/* ========================================================= */}
      <div className="h-18 px-6 pb-2 pt-2 bg-slate-950/80 backdrop-blur-2xl border-t border-white/15 flex items-center justify-between shrink-0 z-30 select-none shadow-2xl">
        {/* Softkeys: Back, Home, Recents (Android/iPad Multitasking Bar) */}
        <div className="flex items-center gap-3">
          {/* Back Softkey */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/15 cursor-pointer active:scale-95 transition-all"
            title="Back / Previous View"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Home Softkey */}
          <button
            type="button"
            onClick={handleHome}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold border border-blue-400/40 cursor-pointer active:scale-95 transition-all shadow-md"
            title="Return to Wallpaper Home"
          >
            <Tablet className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Recents Multitasking Softkey */}
          <button
            type="button"
            onClick={() => {
              playSound('open');
              triggerHaptic('light');
              setIsRecentsOpen(!isRecentsOpen);
            }}
            className="relative flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/15 cursor-pointer active:scale-95 transition-all"
            title="Recents / Task Switcher"
          >
            <Square className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Recents</span>
            {recentApps.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-blue-500 text-white text-[9px] font-mono font-black rounded-full">
                {recentApps.length}
              </span>
            )}
          </button>
        </div>

        {/* Center/Right Navigators Dock: About, Projects, All Apps, Notes, Contact */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const app = data.apps.find((a) => a.app_id === 'about');
              if (app) handleOpenApp(app);
            }}
            className="hidden md:flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/10 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-all"
            title="About Mujahid"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">About</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const app = data.apps.find((a) => a.app_id === 'projects');
              if (app) handleOpenApp(app);
            }}
            className="hidden md:flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/10 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-all"
            title="Projects"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <FolderGit2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Projects</span>
          </button>

          {/* Primary App Launcher Navigator */}
          <button
            type="button"
            onClick={() => {
              playSound('open');
              triggerHaptic('medium');
              setIsAppDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg border border-cyan-300/40 cursor-pointer active:scale-95 transition-all"
            title="All Applications"
          >
            <Grid className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Applications</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const app = data.apps.find((a) => a.app_id === 'contact');
              if (app) handleOpenApp(app);
            }}
            className="hidden md:flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/10 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-all"
            title="Contact Mujahid"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold mt-0.5">Contact</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. TABLET APPLICATION DRAWER OVERLAY (WITH SPOTLIGHT)     */}
      {/* ========================================================= */}
      {isAppDrawerOpen && (
        <div
          onClick={() => setIsAppDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full h-[88vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp border border-slate-200"
          >
            {/* Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                  <Grid className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Applications ({tabletApps.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">MahiOS Pad Edition • All Modules</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsAppDrawerOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Spotlight Search & Category Filter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="relative flex items-center bg-white rounded-2xl px-4 py-2.5 border border-slate-200 shadow-2xs">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Spotlight search apps, projects, blogs, skills..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
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

            {/* Content: Spotlight Global Search Results OR App Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 overscroll-contain">
              {searchResults ? (
                /* Spotlight Search Results Across Entities */
                <div className="space-y-6">
                  {/* Matching Apps */}
                  {searchResults.apps.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Matching Applications ({searchResults.apps.length})
                      </h4>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                        {searchResults.apps.map((app) => {
                          const Icon = iconMap[app.icon_name] || FileText;
                          const gradient = getAppGradient(app.app_id);
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handleOpenApp(app)}
                              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-transform"
                            >
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center p-3 shadow-md`}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-800 leading-tight mt-1.5 line-clamp-2">
                                {app.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Projects */}
                  {searchResults.projects.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Matching Portfolio Projects ({searchResults.projects.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.projects.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => {
                              setDeepLinkedProjectId(proj.slug || proj.id);
                              const projectsApp = data.apps.find((a) => a.app_id === 'projects');
                              if (projectsApp) handleOpenApp(projectsApp);
                            }}
                            className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-black text-slate-900 truncate">{proj.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{proj.summary}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Blog Articles */}
                  {searchResults.blog.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Matching Technical Articles ({searchResults.blog.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {searchResults.blog.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => {
                              const blogApp = data.apps.find((a) => a.app_id === 'blog');
                              if (blogApp) handleOpenApp(blogApp);
                            }}
                            className="p-3.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-black text-slate-900 truncate">{post.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{post.excerpt}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Technical Skills */}
                  {searchResults.skills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Matching Technical Skills ({searchResults.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {searchResults.skills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => {
                              const skillsApp = data.apps.find((a) => a.app_id === 'skills');
                              if (skillsApp) handleOpenApp(skillsApp);
                            }}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{skill.name}</span>
                            <span className="text-[10px] font-mono text-purple-500">{skill.proficiency}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.apps.length === 0 &&
                    searchResults.projects.length === 0 &&
                    searchResults.blog.length === 0 &&
                    searchResults.skills.length === 0 && (
                      <div className="py-16 text-center text-slate-400 text-xs">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
                      </div>
                    )}
                </div>
              ) : (
                /* Standard Applications Grid */
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-y-6 gap-x-4">
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
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center p-3.5 shadow-md group-hover:shadow-lg transition-shadow`}
                          >
                            <Icon className="w-8 h-8 text-white drop-shadow-sm group-hover:scale-105 transition-transform" />
                          </div>

                          {app.badge_text && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[8px] font-black rounded-full border border-white shadow-xs">
                              {app.badge_text}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2 w-full mt-2 px-0.5 group-hover:text-blue-600 transition-colors">
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
    </div>
  );
}
