'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { BiographyDatabaseData, DesktopApp } from '@/types/database';
import DesktopIcon from './DesktopIcon';
import Window from './Window';
import Taskbar from './Taskbar';
import ContextMenu from './ContextMenu';
import AppPropertiesDialog from './AppPropertiesDialog';
import { resolveDeepLink } from '@/lib/utils/deepLinks';
import { getWallpaperStyle } from '@/lib/utils/wallpaper';

// All 28 Applications Loaded Dynamically (Next.js Code-Splitting)
import {
  DynamicAboutApp,
  DynamicExperienceApp,
  DynamicProjectsApp,
  DynamicSkillsApp,
  DynamicEducationApp,
  DynamicTerminalApp,
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
  DynamicMyComputerApp,
  DynamicRecycleBinApp,
  DynamicCalculatorApp,
  DynamicNotepadApp,
  DynamicPaintApp,
  DynamicTaskManagerApp,
  DynamicBlogPostReaderApp,
  DynamicBiographyChapterReaderApp,
} from '@/components/apps/dynamicApps';

interface DesktopProps {
  data: BiographyDatabaseData;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function Desktop({ data }: DesktopProps) {
  const { windows, openWindow } = useWindowStore();
  const {
    desktopBgColor,
    setDesktopBgColor,
    setSelectedIconId,
    wallpaperPattern,
    cursorStyle,
    activeAppProperties,
    setActiveAppProperties,
    desktopSortBy,
  } = useSystemStore();

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetApp: DesktopApp | null;
  }>({ visible: false, x: 0, y: 0, targetApp: null });

  const [deepLinkedProjectId, setDeepLinkedProjectId] = useState<string | undefined>();
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (data.settings.desktop_background_color) {
      setDesktopBgColor(data.settings.desktop_background_color);
    }

    const processDeepLink = () => {
      const result = resolveDeepLink(data);
      if (result) {
        if (result.targetType === 'project' && result.project) {
          setDeepLinkedProjectId(result.project.slug || result.project.id);
        }
        openWindow(result.targetApp);
        return true;
      }
      return false;
    };

    // Auto-open deep-linked app or fallback to About Me window on first boot
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const targetOpened = processDeepLink();

      if (!targetOpened && data.apps.length > 0) {
        const aboutApp = data.apps.find((a) => a.app_id === 'about') || data.apps[0];
        if (aboutApp) openWindow(aboutApp);
      }
    }

    const handleRouteChange = () => {
      processDeepLink();
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [data, openWindow, setDesktopBgColor]);

  // Visible applications filtered by admin toggle
  const visibleApps = data.apps.filter((a) => a.is_visible);

  // Dynamically sort apps strictly according to the rank (sort_order) from the admin dashboard (1 to 28)
  const sortedVisibleApps = React.useMemo(() => {
    return [...visibleApps].sort((a, b) => {
      if (desktopSortBy === 'name') return a.title.localeCompare(b.title);
      if (desktopSortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return (a.sort_order ?? 999) - (b.sort_order ?? 999);
    });
  }, [visibleApps, desktopSortBy]);

  // Left Side: 2 Columns of 7 Rows (Rank 1 - 14)
  const leftCol1 = sortedVisibleApps.slice(0, 7);
  const leftCol2 = sortedVisibleApps.slice(7, 14);

  // Right Side: 2 Columns of 7 Rows (Rank 15 - 28)
  const rightCol1 = sortedVisibleApps.slice(14, 21);
  const rightCol2 = sortedVisibleApps.slice(21, 28);


  const handleDesktopClick = (e: React.MouseEvent) => {
    const isIconClick = (e.target as HTMLElement)?.closest('[data-desktop-icon="true"]');
    if (!isIconClick) {
      setSelectedIconId(null);
    }
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, targetApp: DesktopApp | null = null) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetApp,
    });
  };

  // Rubber-band marquee selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const isIconClick = (e.target as HTMLElement)?.closest('[data-desktop-icon="true"]');
    const isWindowClick = (e.target as HTMLElement)?.closest('[data-window="true"]');
    if (!isIconClick && !isWindowClick && desktopRef.current) {
      const rect = desktopRef.current.getBoundingClientRect();
      setSelectionBox({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox || !desktopRef.current) return;
    const rect = desktopRef.current.getBoundingClientRect();
    setSelectionBox({
      ...selectionBox,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    });
  };

  const handleMouseUp = () => {
    if (selectionBox) setSelectionBox(null);
  };

  const renderAppContent = (componentKey: string, appId?: string) => {
    // Separate dedicated blog post reader window
    if (componentKey === 'BlogPostReaderApp' || appId?.startsWith('blog-')) {
      const postId = appId ? appId.replace('blog-', '') : '';
      const post = data.blogPosts.find((p) => p.id === postId || p.slug === postId) || data.blogPosts[0];
      if (post) return <DynamicBlogPostReaderApp post={post} />;
    }

    // Separate dedicated biography chapter reader window
    if (componentKey === 'BiographyChapterReaderApp' || appId?.startsWith('milestone-') || appId?.startsWith('bio-ch-')) {
      const milestoneId = appId ? appId.replace(/^(milestone-|bio-ch-)/, '') : '';
      const milestone = data.biographyTimeline.find((m) => m.id === milestoneId) || data.biographyTimeline[0];
      if (milestone) return <DynamicBiographyChapterReaderApp milestone={milestone} allMilestones={data.biographyTimeline} />;
    }

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
      case 'TerminalApp':
        return <DynamicTerminalApp commands={data.terminalCommands} data={data} />;
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
      // 6 Authentic Mini-OS Built-in Tools
      case 'MyComputerApp':
        return <DynamicMyComputerApp />;
      case 'RecycleBinApp':
        return <DynamicRecycleBinApp />;
      case 'CalculatorApp':
        return <DynamicCalculatorApp />;
      case 'NotepadApp':
        return <DynamicNotepadApp />;
      case 'PaintApp':
        return <DynamicPaintApp />;
      case 'TaskManagerApp':
        return <DynamicTaskManagerApp />;
      default:
        return <DynamicAboutApp about={data.about} phone={data.settings?.phone} />;
    }
  };

  const getCursorClass = () => {
    if (cursorStyle === 'crosshair') return 'cursor-crosshair';
    return 'cursor-default';
  };

  const selectionStyle = selectionBox ? {
    left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
    top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
    width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
    height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
  } : null;

  return (
    <div
      ref={desktopRef}
      data-desktop-canvas="true"
      onClick={handleDesktopClick}
      onContextMenu={(e) => handleContextMenu(e, null)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={getWallpaperStyle(desktopBgColor)}
      className={`w-full h-full relative overflow-hidden select-none ${getCursorClass()}`}
    >
      {/* 90s Wallpaper Dither Pattern */}
      {wallpaperPattern === 'dither' && (
        <div
          data-desktop-canvas="true"
          className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]"
        />
      )}
      {wallpaperPattern === 'grid' && (
        <div
          data-desktop-canvas="true"
          className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:24px_24px]"
        />
      )}

      {/* Rubber-band Marquee Selection */}
      {selectionStyle && (
        <div
          style={selectionStyle}
          className="absolute border border-dotted border-white/80 bg-blue-500/20 pointer-events-none z-10"
        />
      )}

      {/* ========================================================= */}
      {/* 28 APPLICATIONS RESPONSIVE ARCHITECTURE */}
      {/* MOBILE (<640px): 4-Column Scrollable Retro App Launcher */}
      {/* DESKTOP (>=640px): Symmetrical 2 Columns Left + 2 Columns Right */}
      {/* ========================================================= */}

      {/* MOBILE (width < 640px): Responsive Retro App Grid */}
      <div className="sm:hidden absolute inset-0 bottom-[38px] p-2 overflow-y-auto z-0 pointer-events-auto">
        <div className="grid grid-cols-4 gap-2 justify-items-center items-start pt-2">
          {sortedVisibleApps.map((app) => (
            <div key={app.id} className="w-[74px] h-[66px] flex items-center justify-center">
              <DesktopIcon
                app={app}
                onContextMenu={(e, a) => handleContextMenu(e, a)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP (width >= 640px): LEFT SIDE 14 APPS (2 COLUMNS OF 7 ROWS EACH) */}
      <div className="hidden sm:flex absolute top-2 left-2 bottom-[38px] gap-x-2 z-0 pointer-events-auto">
        {/* Column 1 (Rank 1-7) */}
        <div
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
          className="grid h-full w-[74px] justify-items-center items-center"
        >
          {leftCol1.map((app) => (
            <div key={app.id} className="w-full h-full flex items-center justify-center">
              <DesktopIcon
                app={app}
                onContextMenu={(e, a) => handleContextMenu(e, a)}
              />
            </div>
          ))}
        </div>

        {/* Column 2 (Rank 8-14) */}
        <div
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
          className="grid h-full w-[74px] justify-items-center items-center"
        >
          {leftCol2.map((app) => (
            <div key={app.id} className="w-full h-full flex items-center justify-center">
              <DesktopIcon
                app={app}
                onContextMenu={(e, a) => handleContextMenu(e, a)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP (width >= 640px): RIGHT SIDE 14 APPS (2 COLUMNS OF 7 ROWS EACH) */}
      <div className="hidden sm:flex absolute top-2 right-2 bottom-[38px] gap-x-2 z-0 pointer-events-auto">
        {/* Column 3 (Rank 15-21) */}
        <div
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
          className="grid h-full w-[74px] justify-items-center items-center"
        >
          {rightCol1.map((app) => (
            <div key={app.id} className="w-full h-full flex items-center justify-center">
              <DesktopIcon
                app={app}
                onContextMenu={(e, a) => handleContextMenu(e, a)}
              />
            </div>
          ))}
        </div>

        {/* Column 4 (Rank 22-28) */}
        <div
          style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
          className="grid h-full w-[74px] justify-items-center items-center"
        >
          {rightCol2.map((app) => (
            <div key={app.id} className="w-full h-full flex items-center justify-center">
              <DesktopIcon
                app={app}
                onContextMenu={(e, a) => handleContextMenu(e, a)}
              />
            </div>
          ))}
        </div>
      </div>



      {/* Render All Open Draggable Windows sorted strictly by zIndex ascending */}
      {[...windows]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((win) => (
          <Window key={win.id} window={win}>
            {renderAppContent(win.componentKey, win.appId)}
          </Window>
        ))}

      {/* Authentic Tabbed App Properties Dialog Sheet */}
      {activeAppProperties && (
        <AppPropertiesDialog
          app={activeAppProperties}
          onClose={() => setActiveAppProperties(null)}
        />
      )}

      {/* Desktop Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          targetApp={contextMenu.targetApp}
          apps={visibleApps}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
      )}

      {/* Taskbar at bottom */}
      <Taskbar
        apps={visibleApps}
        milestones={data.biographyTimeline}
        blogPosts={data.blogPosts}
      />
    </div>
  );
}
