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

// Import All 28 Application Views
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

// Additional Dynamic Applications
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

// Authentic Mini-OS Built-in Tools
import MyComputerApp from '@/components/apps/MyComputerApp';
import RecycleBinApp from '@/components/apps/RecycleBinApp';
import CalculatorApp from '@/components/apps/CalculatorApp';
import NotepadApp from '@/components/apps/NotepadApp';
import PaintApp from '@/components/apps/PaintApp';
import TaskManagerApp from '@/components/apps/TaskManagerApp';
import BlogPostReaderApp from '@/components/apps/BlogPostReaderApp';

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

  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const desktopRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (data.settings.desktop_background_color) {
      setDesktopBgColor(data.settings.desktop_background_color);
    }

    // Auto-open deep-linked app or fallback to About Me window on first boot
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      let targetOpened = false;

      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const reqApp = params.get('app');
        const reqPost = params.get('post');

        if (reqApp === 'blog' && reqPost) {
          const post = data.blogPosts.find((p) => p.slug === reqPost || p.id === reqPost);
          if (post) {
            openWindow({
              id: `blog-${post.id}`,
              app_id: `blog-${post.id}`,
              title: post.title,
              icon_name: 'FileText',
              component_key: 'BlogPostReaderApp',
              default_x: 80,
              default_y: 50,
              default_width: 840,
              default_height: 600,
              is_system_app: false,
              is_visible: true,
              sort_order: 99,
              category: 'Dev Notes',
            });
            targetOpened = true;
          }
        } else if (reqApp) {
          const found = data.apps.find((a) => a.app_id === reqApp || a.app_id.includes(reqApp));
          if (found) {
            openWindow(found);
            targetOpened = true;
          }
        }
      }

      if (!targetOpened && data.apps.length > 0) {
        const aboutApp = data.apps.find((a) => a.app_id === 'about') || data.apps[0];
        if (aboutApp) openWindow(aboutApp);
      }
    }
  }, [data, openWindow, setDesktopBgColor]);

  // Visible applications filtered by admin toggle
  const visibleApps = data.apps.filter((a) => a.is_visible);

  // Dynamically sort apps based on desktopSortBy context or custom sort_order
  const sortedVisibleApps = React.useMemo(() => {
    return [...visibleApps].sort((a, b) => {
      if (desktopSortBy === 'name') return a.title.localeCompare(b.title);
      if (desktopSortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return (a.sort_order ?? 999) - (b.sort_order ?? 999);
    });
  }, [visibleApps, desktopSortBy]);

  // Distribute sorted applications across 4 symmetrical columns (7 per column)
  const leftCol1 = sortedVisibleApps.slice(0, 7);
  const leftCol2 = sortedVisibleApps.slice(7, 14);
  const rightCol1 = sortedVisibleApps.slice(14, 21);
  const rightCol2 = sortedVisibleApps.slice(21);

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
      if (post) return <BlogPostReaderApp post={post} />;
    }

    switch (componentKey) {
      case 'AboutApp':
        return <AboutApp about={data.about} philosophies={data.philosophies} />;
      case 'ExperienceApp':
        return <ExperienceApp experiences={data.experiences} />;
      case 'ProjectsApp':
        return <ProjectsApp projects={data.projects} />;
      case 'SkillsApp':
        return <SkillsApp categories={data.categories} skills={data.skills} />;
      case 'EducationApp':
        return <EducationApp education={data.education} />;
      case 'TerminalApp':
        return <TerminalApp commands={data.terminalCommands} data={data} />;
      case 'GalleryApp':
        return <GalleryApp categories={data.galleryCategories} images={data.galleryImages} />;
      case 'AchievementsApp':
        return <AchievementsApp achievements={data.achievements} />;
      case 'BlogApp':
        return <BlogApp posts={data.blogPosts} />;
      case 'ResumeApp':
        return <ResumeApp resume={data.resumeConfig} />;
      case 'ContactApp':
        return <ContactApp />;
      case 'SettingsApp':
        return <SettingsApp />;
      case 'PhilosophyApp':
        return <PhilosophyApp philosophies={data.philosophies} />;
      case 'FeedApp':
        return <FeedApp feedPosts={data.feedPosts} />;
      case 'BiographyApp':
        return <BiographyApp biographyTimeline={data.biographyTimeline} />;
      case 'SocialsApp':
        return <SocialsApp socialLinks={data.socialLinks} />;
      case 'IdeologyApp':
        return <IdeologyApp ideologies={data.ideologies} />;
      case 'EntertainmentApp':
        return <EntertainmentApp entertainment={data.entertainment} />;
      case 'AimApp':
        return <AimApp aims={data.aims} />;
      case 'DreamApp':
        return <DreamApp dreams={data.dreams} />;
      case 'WishesApp':
        return <WishesApp wishes={data.wishes} />;
      case 'FavouritesApp':
        return <FavouritesApp favourites={data.favourites} />;
      // 6 Authentic Mini-OS Built-in Tools
      case 'MyComputerApp':
        return <MyComputerApp />;
      case 'RecycleBinApp':
        return <RecycleBinApp />;
      case 'CalculatorApp':
        return <CalculatorApp />;
      case 'NotepadApp':
        return <NotepadApp />;
      case 'PaintApp':
        return <PaintApp />;
      case 'TaskManagerApp':
        return <TaskManagerApp />;
      default:
        return <AboutApp about={data.about} />;
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
      style={{ backgroundColor: desktopBgColor }}
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
      {/* 28 APPLICATIONS SYMMETRICAL ARCHITECTURE */}
      {/* 14 ON LEFT (2 COLUMNS OF 7) | 14 ON RIGHT (2 COLUMNS OF 7) */}
      {/* ========================================================= */}

      {/* LEFT SIDE: 14 APPS (2 COLUMNS OF 7 EACH) */}
      <div
        className="absolute top-2 left-2 bottom-10 flex gap-2 z-0 pointer-events-auto"
      >
        {/* Column 1 (Leftmost 7) */}
        <div className="grid grid-rows-7 h-full w-20 justify-items-center">
          {leftCol1.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
          ))}
        </div>

        {/* Column 2 (Second Left 7) */}
        <div className="grid grid-rows-7 h-full w-20 justify-items-center">
          {leftCol2.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: 14 APPS (2 COLUMNS OF 7 EACH) */}
      <div
        className="absolute top-2 right-2 bottom-10 flex gap-2 z-0 pointer-events-auto"
      >
        {/* Column 3 (First Right 7) */}
        <div className="grid grid-rows-7 h-full w-20 justify-items-center">
          {rightCol1.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
          ))}
        </div>

        {/* Column 4 (Rightmost 7) */}
        <div className="grid grid-rows-7 h-full w-20 justify-items-center">
          {rightCol2.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
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
      <Taskbar apps={visibleApps} />
    </div>
  );
}
