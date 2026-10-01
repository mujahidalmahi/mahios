'use client';

import React from 'react';
import {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, HelpCircle, Compass, Radio, BookOpen,
  Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star, Globe, Rocket,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { DesktopApp } from '@/types/database';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Briefcase,
  FolderGit2,
  Cpu,
  GraduationCap,
  Terminal,
  Image: ImageIcon,
  Award,
  FileText,
  FileBadge,
  Mail,
  Settings,
  Compass,
  Radio,
  BookOpen,
  Share2,
  Scale,
  Gamepad2,
  Target,
  Sparkles,
  Flame,
  Star,
  Globe,
  Rocket,
  Monitor,
  Trash2,
  Calculator,
  FileEdit,
  Palette,
  Activity,
};

interface DesktopIconProps {
  app: DesktopApp;
  onContextMenu?: (e: React.MouseEvent, app: DesktopApp) => void;
}

const DesktopIcon = React.memo(function DesktopIcon({ app, onContextMenu }: DesktopIconProps) {
  const { openWindow } = useWindowStore();
  const { playSound, selectedIconId, setSelectedIconId } = useSystemStore();

  const IconComponent = iconMap[app.icon_name] || HelpCircle;
  const isSelected = selectedIconId === app.id;

  const handleOpen = () => {
    playSound('open');
    openWindow(app);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setSelectedIconId(app.id);

    // On touch devices without double-click, open immediately
    if ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)) {
      handleOpen();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIconId(app.id);
    if (onContextMenu) {
      onContextMenu(e, app);
    }
  };

  return (
    <div
      data-desktop-icon="true"
      role="button"
      aria-label={`Open ${app.title}`}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      className="group w-[74px] min-h-[70px] p-1 flex flex-col items-center justify-start text-center select-none cursor-pointer focus:outline-none transition-none"
    >
      {/* Authentic Windows 95 Desktop Icon (No gray button box) */}
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0 mb-1">
        <IconComponent
          className={`w-7 h-7 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] transition-none ${
            app.app_id === 'my-computer' || app.app_id === 'settings'
              ? 'text-sky-300'
              : app.app_id === 'recycle-bin'
              ? 'text-emerald-300'
              : app.app_id === 'terminal'
              ? 'text-green-400'
              : app.app_id === 'projects' || app.app_id === 'experience'
              ? 'text-amber-300'
              : app.app_id === 'gallery' || app.app_id === 'paint'
              ? 'text-pink-300'
              : app.app_id === 'blog' || app.app_id === 'biography' || app.app_id === 'resume'
              ? 'text-blue-200'
              : app.app_id === 'achievements' || app.app_id === 'favourites'
              ? 'text-yellow-300'
              : 'text-amber-200'
          } ${isSelected ? 'brightness-125 saturate-150' : 'group-hover:brightness-110'}`}
        />

        {/* Windows 95 Authentic Dither Selection Mask over Icon */}
        {isSelected && (
          <div className="absolute inset-0 bg-[#000080]/45 pointer-events-none mix-blend-color-burn [background-image:radial-gradient(#000080_1px,transparent_1px)] [background-size:2px_2px]" />
        )}
      </div>

      {/* Windows 95 Authentic Label (Solid Blue on selection with dotted focus) */}
      <span
        className={`text-[11px] font-sans leading-tight line-clamp-2 px-1 py-0.5 transition-none select-none max-w-[72px] ${
          isSelected
            ? 'bg-[#000080] text-white outline-1 outline-dotted outline-white shadow-xs'
            : 'text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,1)]'
        }`}
      >
        {app.title}
      </span>
    </div>
  );
});

export default DesktopIcon;

