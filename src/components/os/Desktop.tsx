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

    // Auto-open About Me window strictly ONCE on first boot
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (data.apps.length > 0) {
        const aboutApp = data.apps.find((a) => a.app_id === 'about') || data.apps[0];
        if (aboutApp) openWindow(aboutApp);
      }
    }
  }, [data, openWindow, setDesktopBgColor]);

  // Ensure all 28 applications are present in visibleApps
  const visibleApps = data.apps.filter((a) => a.is_visible);

  // Canonical ordering for the 28 apps (14 on left, 14 on right)
  const leftCol1Keys = ['my-computer', 'biography', 'about', 'experience', 'projects', 'skills', 'education'];
  const leftCol2Keys = ['achievements', 'resume', 'terminal', 'blog', 'feed', 'contact', 'socials'];
  const rightCol1Keys = ['philosophy', 'ideology', 'aim', 'dream', 'wishes', 'favourites', 'entertainment'];
  const rightCol2Keys = ['gallery', 'calculator', 'notepad', 'paint', 'task-manager', 'settings', 'recycle-bin'];

  // Matcher helper
  const findApp = (key: string) =>
    visibleApps.find((a) => a.app_id === key || a.app_id.includes(key));

  const leftCol1 = leftCol1Keys.map(findApp).filter(Boolean) as DesktopApp[];
  const leftCol2 = leftCol2Keys.map(findApp).filter(Boolean) as DesktopApp[];
  const rightCol1 = rightCol1Keys.map(findApp).filter(Boolean) as DesktopApp[];
  const rightCol2 = rightCol2Keys.map(findApp).filter(Boolean) as DesktopApp[];

  // Fallback if any apps weren't in the canonical list
  const placedAppIds = new Set([
    ...leftCol1.map((a) => a.id),
    ...leftCol2.map((a) => a.id),
    ...rightCol1.map((a) => a.id),
    ...rightCol2.map((a) => a.id),
  ]);
  const unplaced = visibleApps.filter((a) => !placedAppIds.has(a.id));
  unplaced.forEach((a, i) => {
    if (i % 2 === 0 && leftCol2.length < 7) leftCol2.push(a);
    else if (rightCol1.length < 7) rightCol1.push(a);
    else if (rightCol2.length < 7) rightCol2.push(a);
    else if (leftCol1.length < 7) leftCol1.push(a);
  });

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === desktopRef.current || (e.target as HTMLElement)?.dataset?.desktopCanvas) {
      setSelectedIconId(null);
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
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
    if (e.target === desktopRef.current || (e.target as HTMLElement)?.dataset?.desktopCanvas) {
      const rect = desktopRef.current?.getBoundingClientRect();
      if (!rect) return;
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

  const renderAppContent = (componentKey: string) => {
    switch (componentKey) {
      case 'AboutApp':
        return <AboutApp about={data.about} />;
      case 'ExperienceApp':
        return <ExperienceApp experiences={data.experiences} />;
      case 'ProjectsApp':
        return <ProjectsApp projects={data.projects} />;
      case 'SkillsApp':
        return <SkillsApp categories={data.categories} skills={data.skills} />;
      case 'EducationApp':
        return <EducationApp education={data.education} />;
      case 'TerminalApp':
        return <TerminalApp commands={data.terminalCommands} />;
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
        data-desktop-canvas="true"
        className="absolute top-2 left-2 bottom-10 flex gap-1 z-0 pointer-events-auto"
      >
        {/* Column 1 (Leftmost 7) */}
        <div data-desktop-canvas="true" className="flex flex-col gap-1 w-20">
          {leftCol1.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
          ))}
        </div>

        {/* Column 2 (Second Left 7) */}
        <div data-desktop-canvas="true" className="flex flex-col gap-1 w-20">
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
        data-desktop-canvas="true"
        className="absolute top-2 right-2 bottom-10 flex gap-1 z-0 pointer-events-auto"
      >
        {/* Column 3 (First Right 7) */}
        <div data-desktop-canvas="true" className="flex flex-col gap-1 w-20">
          {rightCol1.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
          ))}
        </div>

        {/* Column 4 (Rightmost 7) */}
        <div data-desktop-canvas="true" className="flex flex-col gap-1 w-20">
          {rightCol2.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onContextMenu={(e, a) => handleContextMenu(e, a)}
            />
          ))}
        </div>
      </div>

      {/* Render All Open Draggable Windows */}
      {windows.map((win) => (
        <Window key={win.id} window={win}>
          {renderAppContent(win.componentKey)}
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
