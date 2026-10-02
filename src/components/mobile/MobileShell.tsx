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
  Send, ExternalLink, RefreshCw, Smartphone, Grid,
  Sun, Moon, Flashlight, Bell, BellOff, Lock, Unlock,
  Layers, Square, Palette, Sliders, Zap
} from 'lucide-react';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { useWindowStore } from '@/stores/windowStore';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// Dedicated Mobile Views (100% Mobile UI & Ergonomics)
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
} from './views';

// Desktop-only apps strictly excluded from Mobile OS
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
  Smartphone, Grid
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

interface MobileNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  appId?: string;
}

const INITIAL_NOTIFICATIONS: MobileNotification[] = [
  {
    id: 'n1',
    title: 'MahiOS Mobile System Ready',
    text: 'Pocket OS initialized. All 23 mobile modules loaded & operational.',
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
    title: 'Real-Time Dhaka Telemetry',
    text: 'Primary node latency 14ms. Ready for connections.',
    time: '12m ago',
    appId: 'feed',
  },
];

interface MobileShellProps {
  data: BiographyDatabaseData;
}

export default function MobileShell({ data }: MobileShellProps) {
  // Mobile OS Lifecycle States
  const [activeApp, setActiveApp] = useState<DesktopApp | null>(null);
  const [appHistory, setAppHistory] = useState<string[]>([]);
  const [recentApps, setRecentApps] = useState<DesktopApp[]>(() => {
    return data.apps.filter((a) => !DESKTOP_ONLY_APPS.has(a.app_id)).slice(0, 4);
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
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
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
  const [notifications, setNotifications] = useState<MobileNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string } | null>(null);

  const { playSound, soundEnabled, toggleSound } = useSystemStore();
  const touchStartYRef = useRef<number | null>(null);

  // Trigger tactile haptics if supported on mobile
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
      const savedWp = localStorage.getItem('mahios_mobile_wallpaper');
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
      showToast('Network Connected', 'Mobile 5G / Wi-Fi active');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Network Disconnected', 'Operating in Offline Cache mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery Status API (if supported by mobile browser)
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

  // Clean, mobile-only application list
  const mobileApps = useMemo(() => {
    return data.apps
      .filter((a) => a.is_visible && !DESKTOP_ONLY_APPS.has(a.app_id))
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [data.apps]);

  // Global Unified Search Results across Apps, Projects, Blog, Skills
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    const matchedApps = mobileApps.filter(
      (a) => a.title.toLowerCase().includes(q) || a.app_id.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );

    const matchedProjects = (data.projects || []).filter(
      (p) => p.title.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 4);

    const matchedBlog = (data.blogPosts || []).filter(
      (b) => b.title.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedSkills = (data.skills || []).filter(
      (s) => s.name.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      apps: matchedApps,
      projects: matchedProjects,
      blog: matchedBlog,
      skills: matchedSkills,
    };
  }, [searchQuery, mobileApps, data.projects, data.blogPosts, data.skills]);

  // Filtered mobile apps by Category tab
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

  // Mobile OS Navigation: Open Application with Back-Stack & Recents integration
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
      return [app, ...withoutCurrent].slice(0, 8);
    });

    if (pushHistory && typeof window !== 'undefined') {
      window.history.pushState({ appId: app.app_id }, '', `?app=${app.app_id}`);
    }
  };

  // Mobile OS Navigation: Hardware / Softkey Back Logic
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
      const prevAppId = appHistory[appHistory.length - 1];
      setAppHistory((prev) => prev.slice(0, -1));
      const prevApp = data.apps.find((a) => a.app_id === prevAppId);
      if (prevApp) {
        setActiveApp(prevApp);
        return;
      }
    }

    setActiveApp(null);
  };

  // Mobile OS Navigation: Home Key
  const handleHome = () => {
    playSound('click');
    triggerHaptic('medium');
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
      localStorage.setItem('mahios_mobile_wallpaper', wpId);
    }
    setIsWallpaperPickerOpen(false);
    showToast('Wallpaper Updated', 'New home screen theme applied');
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
          text: `Check out ${activeApp?.title || 'Mujahid Al Mahi Portfolio'} on MahiOS Pocket Edition.`,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link Copied', 'Direct URL saved to clipboard');
      }
    }
  };

  // Render Dedicated Mobile View Component
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
      {/* Hardware Screen Dimming Filter */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-50 bg-black transition-opacity duration-150"
          style={{ opacity: (100 - brightness) * 0.0075 }}
        />
      )}

      {/* High-Intensity Screen Torch / Flashlight Overlay */}
      {isTorchOn && (
        <div
          onClick={() => {
            playSound('click');
            setIsTorchOn(false);
          }}
          className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col items-center justify-center p-6 text-center cursor-pointer animate-fadeIn"
        >
          <Flashlight className="w-16 h-16 text-amber-500 fill-amber-400 animate-pulse mb-3" />
          <h2 className="text-xl font-black">Flashlight Active</h2>
          <p className="text-xs text-slate-500 mt-1">Tap anywhere to turn off</p>
        </div>
      )}

      {/* Heads-Up System HUD Toast Banner */}
      {activeToast && (
        <div className="fixed top-9 inset-x-4 z-50 flex justify-center pointer-events-none animate-slideDown">
          <div className="bg-slate-900/90 text-white backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 max-w-sm w-full">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold leading-tight">{activeToast.title}</div>
              <div className="text-[11px] text-slate-300 truncate">{activeToast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP MOBILE STATUS BAR (TRANSLUCENT VINTAGE TELEMETRY)  */}
      {/* Tapping pulls down Notification Shade & Quick Settings   */}
      {/* ========================================================= */}
      <div
        onClick={() => {
          playSound('click');
          triggerHaptic('light');
          setIsNotificationShadeOpen(true);
        }}
        className="h-7 px-3 bg-black/40 backdrop-blur-md flex items-center justify-between text-xs font-bold shrink-0 z-40 select-none border-b border-white/10 cursor-pointer active:bg-black/60 transition-colors"
        title="Tap to pull down Mobile Notification & Settings Shade"
      >
        {/* Left: Signal + Carrier + Network Status */}
        <div className="flex items-center gap-2">
          {wifiEnabled && isOnline ? (
            <div className="flex items-end gap-0.5 h-3" title="Signal: Full GSM/5G">
              <span className="w-1 h-1 bg-emerald-400 rounded-2xs" />
              <span className="w-1 h-1.5 bg-emerald-400 rounded-2xs" />
              <span className="w-1 h-2 bg-emerald-400 rounded-2xs" />
              <span className="w-1 h-2.5 bg-emerald-400 rounded-2xs" />
            </div>
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}

          <span className="font-mono text-[10px] font-black text-emerald-400 tracking-wider">
            {wifiEnabled && isOnline ? 'MAHI 5G' : 'NO NET'}
          </span>

          <span className="text-slate-400 p-0.5 ml-0.5">
            {soundEnabled ? (
              <Volume2 className="w-3 h-3 text-slate-300" />
            ) : (
              <VolumeX className="w-3 h-3 text-red-400" />
            )}
          </span>
        </div>

        {/* Center: Pocket OS Title with drop indicator */}
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-white/80 tracking-tight">
          <span>Pocket MahiOS</span>
          <span className="text-[8px] text-white/40">▼</span>
        </div>

        {/* Right: Battery Gauge & Live Clock */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-200 font-bold">
            <span>{batteryLevel}%</span>
            {isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <div className="w-3.5 h-2 border border-slate-300 p-0.5 flex items-center relative rounded-2xs bg-black/50">
                <div
                  className="h-full bg-emerald-400 rounded-2xs"
                  style={{ width: `${Math.min(100, Math.max(10, batteryLevel))}%` }}
                />
              </div>
            )}
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
              {/* Back to Previous App or Home */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-slate-800 font-bold text-xs cursor-pointer border border-slate-200 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span className="tracking-tight text-[11px]">
                  {appHistory.length > 0 ? 'Back' : 'Home'}
                </span>
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
                  onClick={handleHome}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-xl text-rose-600 cursor-pointer border border-rose-200"
                  title="Close to Home"
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
          /* Clean wallpaper without any top or center clutter     */
          /* ===================================================== */
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setIsWallpaperPickerOpen(true);
            }}
            onDoubleClick={() => setIsWallpaperPickerOpen(true)}
            className="relative z-10 flex-1 flex flex-col justify-end p-4 cursor-default select-none"
          >
            {/* Pure desktop wallpaper displayed unobstructed */}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. VINTAGE MOBILE BOTTOM NAVIGATION DOCK (ALWAYS VISIBLE) */}
      {/* ========================================================= */}
      <div className="h-16 px-4 pb-2 pt-1.5 bg-slate-900/80 backdrop-blur-xl border-t border-white/15 flex items-center justify-between shrink-0 z-30 select-none shadow-2xl">
        {activeApp ? (
          /* Softkey bar when inside an active application */
          <div className="w-full flex items-center justify-between">
            {/* 1. Back button */}
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold border border-white/20 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>Back</span>
            </button>

            {/* 2. Home button */}
            <button
              type="button"
              onClick={handleHome}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>Home</span>
            </button>

            {/* 3. Recents / Multitasking button */}
            <button
              type="button"
              onClick={() => {
                playSound('open');
                triggerHaptic('medium');
                setIsRecentsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              <Square className="w-3.5 h-3.5 text-cyan-300" />
              <span>Recents</span>
            </button>
          </div>
        ) : (
          /* Home Navigation Dock: 5 Navigators to Apps & Core Workflows */
          <div className="w-full grid grid-cols-5 gap-1.5">
            {/* 1. About / Profile */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'about');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg border border-blue-400/40">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">About</span>
            </button>

            {/* 2. Projects / Portfolio */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'projects');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-400/40">
                <FolderGit2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Projects</span>
            </button>

            {/* 3. Primary App Launcher Navigator */}
            <button
              type="button"
              onClick={() => {
                playSound('open');
                triggerHaptic('medium');
                setIsAppDrawerOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl border-2 border-white/60">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black tracking-tight text-cyan-300">All Apps</span>
            </button>

            {/* 4. Notes / Memo */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'notepad');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg border border-amber-400/40">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Notes</span>
            </button>

            {/* 5. Contact / Email */}
            <button
              type="button"
              onClick={() => {
                const app = data.apps.find((a) => a.app_id === 'contact');
                if (app) handleOpenApp(app);
              }}
              className="flex flex-col items-center justify-center gap-0.5 text-white/90 hover:text-white cursor-pointer active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg border border-emerald-400/40">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-tight">Contact</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 6. MOBILE RECENT APPS / MULTITASKING SWITCHER OVERLAY     */}
      {/* ========================================================= */}
      {isRecentsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-between p-4 animate-fadeIn select-none">
          <div className="flex items-center justify-between pt-2 px-1">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Square className="w-4 h-4 text-cyan-400" />
                <span>Running Tasks ({recentApps.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Mobile App Switcher</p>
            </div>

            <button
              type="button"
              onClick={() => setIsRecentsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Card Deck */}
          <div className="flex-1 my-4 flex items-center overflow-x-auto gap-4 px-2 py-4 scrollbar-none snap-x snap-mandatory">
            {recentApps.length === 0 ? (
              <div className="w-full text-center text-slate-400 font-mono text-xs py-10">
                No recent background apps active.
              </div>
            ) : (
              recentApps.map((app) => {
                const Icon = iconMap[app.icon_name] || FileText;
                const isCurrent = activeApp?.app_id === app.app_id;

                return (
                  <div
                    key={app.id}
                    onClick={() => handleOpenApp(app)}
                    className={`snap-center shrink-0 w-64 h-96 rounded-3xl bg-white border-2 p-4 shadow-2xl flex flex-col justify-between cursor-pointer transition-all active:scale-95 ${
                      isCurrent ? 'border-cyan-400 ring-4 ring-cyan-400/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Card Top Titlebar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-slate-900 truncate max-w-[130px]">
                          {app.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDismissRecentApp(app.app_id, e)}
                        className="w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 flex items-center justify-center"
                        title="Dismiss Task"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Miniature Card Preview */}
                    <div className="flex-1 my-3 bg-slate-50 rounded-2xl border border-slate-100 p-3 flex flex-col justify-center items-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-800">{app.title}</div>
                      <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        {app.category}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Tap card to resume task
                      </p>
                    </div>

                    <div className="text-center text-[11px] font-bold text-blue-600">
                      {isCurrent ? 'Active Application' : 'Switch Application'}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Clear All Bar */}
          <div className="flex items-center justify-center gap-3 pb-2">
            {recentApps.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllRecents}
                className="px-6 py-2 rounded-2xl bg-white/10 hover:bg-rose-600/80 active:bg-rose-700 text-white text-xs font-bold border border-white/20 shadow-md cursor-pointer transition-colors"
              >
                Clear All Tasks
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PULL-DOWN NOTIFICATION & QUICK SETTINGS SHADE          */}
      {/* ========================================================= */}
      {isNotificationShadeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col justify-between animate-slideDown select-none">
          {/* Top Header with Live Info */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white">
              <div>
                <div className="text-2xl font-black font-mono tracking-tight">{timeString}</div>
                <div className="text-xs text-slate-300 font-medium">{dateString}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocked(true)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title="Lock Screen"
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotificationShadeOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Settings Toggles Grid (6 Toggles) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Sound */}
              <button
                type="button"
                onClick={() => {
                  toggleSound();
                  triggerHaptic('light');
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  soundEnabled ? 'bg-blue-600 text-white shadow-md' : 'bg-white/10 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-[10px] font-bold">Sound</span>
              </button>

              {/* Wi-Fi */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  triggerHaptic('light');
                  setWifiEnabled(!wifiEnabled);
                  showToast('Wi-Fi', !wifiEnabled ? 'Wi-Fi Connected' : 'Wi-Fi Disabled');
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  wifiEnabled ? 'bg-emerald-600 text-white shadow-md' : 'bg-white/10 text-slate-400'
                }`}
              >
                {wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                <span className="text-[10px] font-bold">Wi-Fi</span>
              </button>

              {/* Torch / Flashlight */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  triggerHaptic('medium');
                  setIsTorchOn(!isTorchOn);
                  setIsNotificationShadeOpen(false);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isTorchOn ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Flashlight className="w-5 h-5" />
                <span className="text-[10px] font-bold">Torch</span>
              </button>

              {/* Do Not Disturb */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  triggerHaptic('light');
                  setDndEnabled(!dndEnabled);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  dndEnabled ? 'bg-purple-600 text-white shadow-md' : 'bg-white/10 text-slate-400'
                }`}
              >
                <BellOff className="w-5 h-5" />
                <span className="text-[10px] font-bold">DND Mode</span>
              </button>

              {/* Battery Saver */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  triggerHaptic('light');
                  setBatterySaver(!batterySaver);
                  if (!batterySaver) setBrightness(65);
                  else setBrightness(100);
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  batterySaver ? 'bg-amber-600 text-white shadow-md' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Battery className="w-5 h-5" />
                <span className="text-[10px] font-bold">Power Saver</span>
              </button>

              {/* Wallpaper Picker */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  triggerHaptic('light');
                  setIsNotificationShadeOpen(false);
                  setIsWallpaperPickerOpen(true);
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <Palette className="w-5 h-5 text-cyan-300" />
                <span className="text-[10px] font-bold">Wallpaper</span>
              </button>
            </div>

            {/* Screen Brightness Slider */}
            <div className="p-3 rounded-2xl bg-white/10 flex items-center gap-3">
              <Sun className="w-4 h-4 text-amber-300 shrink-0" />
              <input
                type="range"
                min="40"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-xs text-white font-bold w-10 text-right">
                {brightness}%
              </span>
            </div>
          </div>

          {/* Notifications Center */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span className="font-bold uppercase tracking-wider">Notifications ({notifications.length})</span>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setNotifications([]);
                    showToast('Notifications', 'All notifications cleared');
                  }}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No new notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.appId) {
                      const app = data.apps.find((a) => a.app_id === notif.appId);
                      if (app) handleOpenApp(app);
                    }
                  }}
                  className="p-3.5 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 backdrop-blur-md space-y-1 cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center justify-between text-white">
                    <span className="text-xs font-bold text-cyan-300">{notif.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{notif.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Bottom Pull Handle */}
          <div
            onClick={() => setIsNotificationShadeOpen(false)}
            className="p-3 flex justify-center cursor-pointer border-t border-white/10"
          >
            <div className="w-12 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MOBILE LOCK SCREEN / STANDBY MODE                      */}
      {/* ========================================================= */}
      {isLocked && (
        <div
          style={activeWallpaper}
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 select-none bg-cover bg-center animate-fadeIn text-white"
        >
          {/* Top Status */}
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white/80">
            <span>MAHI MOBILE</span>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{batteryLevel}%</span>
            </div>
          </div>

          {/* Center Big Clock & Date */}
          <div className="text-center space-y-2 my-auto">
            <div className="w-14 h-14 rounded-full bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black font-mono tracking-tight drop-shadow-lg">
              {timeString}
            </h1>
            <p className="text-sm font-semibold text-white/80 drop-shadow-md">
              {dateString}
            </p>
            <div className="inline-block mt-3 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md text-[11px] font-mono font-bold text-cyan-300 border border-white/15">
              {notifications.length} Unread Alerts
            </div>
          </div>

          {/* Bottom Unlock Button & Quick Shortcuts */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                playSound('success');
                triggerHaptic('medium');
                setIsLocked(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Tap or Slide to Unlock</span>
            </button>

            <div className="flex items-center justify-between text-xs font-mono text-white/60 px-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsTorchOn(true);
                  setIsLocked(false);
                }}
                className="flex items-center gap-1 hover:text-white"
              >
                <Flashlight className="w-3.5 h-3.5" />
                <span>Torch</span>
              </button>
              <span>MahiOS Secure</span>
              <button
                type="button"
                onClick={() => {
                  const contactApp = data.apps.find((a) => a.app_id === 'contact');
                  if (contactApp) {
                    setIsLocked(false);
                    handleOpenApp(contactApp);
                  }
                }}
                className="flex items-center gap-1 hover:text-white"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. MOBILE PERSONALIZATION: WALLPAPER CHOOSER MODAL        */}
      {/* ========================================================= */}
      {isWallpaperPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-end animate-fadeIn select-none">
          <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 max-h-[75dvh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <span>Choose Wallpaper</span>
                </h3>
                <p className="text-xs text-slate-500">Personalize your Pocket MahiOS theme</p>
              </div>

              <button
                type="button"
                onClick={() => setIsWallpaperPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wallpaperPresets.map((wp) => {
                const isSelected =
                  selectedWallpaperId === wp.id ||
                  (wp.id === 'system' && (selectedWallpaperId === 'system' || selectedWallpaperId === 'default' || !selectedWallpaperId));
                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectWallpaper(wp.id)}
                    className={`rounded-2xl p-3 border-2 cursor-pointer transition-all active:scale-95 space-y-2 ${
                      isSelected ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    <div
                      style={wp.bgStyle}
                      className="w-full h-24 rounded-xl shadow-xs border border-white/20 flex items-center justify-center text-white bg-cover bg-center"
                    >
                      {isSelected && <Check className="w-5 h-5 bg-blue-600 rounded-full p-0.5 text-white" />}
                    </div>
                    <div className="text-xs font-bold text-slate-800 text-center">{wp.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. MOBILE APPLICATION DRAWER (FULL LAUNCHER OVERLAY)     */}
      {/* ========================================================= */}
      {isAppDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn select-none">
          <div className="w-full h-[92dvh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
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
                  placeholder="Spotlight search: apps, projects, notes, skills..."
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

            {/* Unified Search or App Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 overscroll-contain">
              {searchQuery.trim() && searchResults ? (
                /* Spotlight Search Result Groups */
                <div className="space-y-4">
                  {/* Apps Match */}
                  {searchResults.apps.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applications</div>
                      <div className="grid grid-cols-2 gap-2">
                        {searchResults.apps.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => handleOpenApp(app)}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <span className="text-xs font-bold text-slate-900 truncate">{app.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects Match */}
                  {searchResults.projects.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projects</div>
                      <div className="space-y-1.5">
                        {searchResults.projects.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              const projApp = data.apps.find((a) => a.app_id === 'projects');
                              if (projApp) {
                                setDeepLinkedProjectId(p.slug || p.id);
                                handleOpenApp(projApp);
                              }
                            }}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer active:scale-98"
                          >
                            <div>
                              <div className="text-xs font-bold text-blue-700">{p.title}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">{p.summary}</div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blog Match */}
                  {searchResults.blog.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Articles & Notes</div>
                      <div className="space-y-1.5">
                        {searchResults.blog.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              const blogApp = data.apps.find((a) => a.app_id === 'blog');
                              if (blogApp) handleOpenApp(blogApp);
                            }}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer active:scale-98"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{b.title}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">{b.excerpt}</div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Match */}
                  {searchResults.skills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {searchResults.skills.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              const skillsApp = data.apps.find((a) => a.app_id === 'skills');
                              if (skillsApp) handleOpenApp(skillsApp);
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            {s.name} ({s.proficiency}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-mono text-xs">
                  No applications found matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                /* 4-Column Mobile App Grid */
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
    </div>
  );
}
