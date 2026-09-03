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

export default function DesktopIcon({ app, onContextMenu }: DesktopIconProps) {
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
    if (e.key === 'Enter') {
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
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      className={`w-20 p-1 flex flex-col items-center justify-start text-center select-none cursor-pointer rounded-xs transition-none focus:outline-none h-full ${
        isSelected ? 'bg-[#000080]/40 outline-1 outline-dotted outline-white/90' : 'hover:bg-white/10'
      }`}
    >
      {/* 90s Pixelated Icon Box */}
      <div className={`w-10 h-10 shrink-0 retro-box-outset bg-[#c0c0c0] flex items-center justify-center text-[#000080] shadow-md ${
        isSelected ? 'brightness-90' : ''
      }`}>
        <IconComponent className="w-6 h-6 stroke-[1.8]" />
      </div>

      {/* Icon Label */}
      <span
        className={`text-[11px] font-sans font-medium px-1 py-0.5 rounded-2xs leading-tight line-clamp-2 mt-0.5 ${
          isSelected
            ? 'bg-[#000080] text-white border border-dotted border-white'
            : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
        }`}
      >
        {app.title}
      </span>
    </div>
  );
}
