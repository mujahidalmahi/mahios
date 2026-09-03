'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, RotateCcw, ShieldCheck, Power,
  Compass, Radio, BookOpen, Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star, Globe, Rocket,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity,
  ChevronRight, Folder, FolderTree, ExternalLink
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useBootStore } from '@/stores/bootStore';
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

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  apps: DesktopApp[];
}

export default function StartMenu({ isOpen, onClose, apps }: StartMenuProps) {
  const { openWindow } = useWindowStore();
  const { startBoot } = useBootStore();
  const { playSound } = useSystemStore();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Clean categorized groups for all 28 applications
  const programGroups = [
    {
      id: 'engineering',
      name: 'Engineering & Career',
      icon: Briefcase,
      appIds: ['experience', 'projects', 'skills', 'education', 'achievements', 'biography', 'resume'],
    },
    {
      id: 'vision',
      name: 'Vision & Mindset',
      icon: Compass,
      appIds: ['philosophy', 'ideology', 'aim', 'dream', 'wishes'],
    },
    {
      id: 'media',
      name: 'Media & Entertainment',
      icon: Gamepad2,
      appIds: ['feed', 'entertainment', 'favourites', 'gallery', 'blog', 'socials'],
    },
    {
      id: 'accessories',
      name: 'System Utilities & Tools',
      icon: Cpu,
      appIds: ['my-computer', 'calculator', 'notepad', 'paint', 'task-manager', 'terminal', 'settings', 'recycle-bin', 'contact'],
    },
  ];

  const handleLaunchApp = (app: DesktopApp) => {
    playSound('open');
    openWindow(app);
    onClose();
  };

  const getAppsForGroup = (appIds: string[]) => {
    return appIds
      .map((id) => apps.find((a) => a.app_id === id || a.app_id.includes(id)))
      .filter(Boolean) as DesktopApp[];
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-8 left-0 z-50 retro-box-outset bg-[#c0c0c0] flex shadow-2xl overflow-visible select-none w-64 text-black text-xs font-sans"
    >
      {/* 90s Vertical Banner */}
      <div className="w-8 bg-gradient-to-t from-[#000080] via-[#1084d0] to-[#000080] flex items-end justify-center py-4 px-1 text-white font-bold font-mono tracking-widest uppercase shrink-0">
        <span className="transform -rotate-90 origin-center whitespace-nowrap text-sm drop-shadow">
          MahiOS 95
        </span>
      </div>

      {/* Main Start Menu List */}
      <div className="flex-1 p-1 flex flex-col justify-between relative">
        <div className="space-y-0.5">
          {/* Categorized Cascading Programs Menu */}
          {programGroups.map((group) => {
            const GroupIcon = group.icon;
            const groupApps = getAppsForGroup(group.appIds);
            const isHovered = activeCategory === group.id;

            return (
              <div
                key={group.id}
                onMouseEnter={() => setActiveCategory(group.id)}
                className="relative"
              >
                <div
                  className={`w-full px-2 py-1.5 flex items-center justify-between rounded-xs transition-none cursor-pointer ${
                    isHovered ? 'bg-[#000080] text-white' : 'hover:bg-gray-200 text-black'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="w-4 h-4 text-[#000080]" />
                    <span className="font-bold">{group.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>

                {/* Cascading Flyout Submenu */}
                {isHovered && (
                  <div
                    onMouseLeave={() => setActiveCategory(null)}
                    className="absolute left-[98%] top-0 w-56 bg-[#c0c0c0] retro-box-outset p-0.5 shadow-2xl z-50 space-y-0.5"
                  >
                    {groupApps.map((app) => {
                      const Icon = iconMap[app.icon_name] || FileText;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handleLaunchApp(app)}
                          className="w-full px-2 py-1.5 flex items-center gap-2 hover:bg-[#000080] hover:text-white rounded-xs text-left cursor-pointer group"
                        >
                          <div className="w-4 h-4 flex items-center justify-center text-[#000080] group-hover:text-white shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="truncate">{app.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* System & Power Options */}
        <div className="pt-1 mt-1 border-t border-gray-400 space-y-0.5">
          <Link
            href="/admin"
            target="_blank"
            onClick={onClose}
            className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-amber-900 font-semibold"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:text-white" />
            <span>Master Admin Panel</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              playSound('boot');
              startBoot();
              onClose();
            }}
            className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group"
          >
            <RotateCcw className="w-4 h-4 text-red-700 group-hover:text-white" />
            <span>Reboot MahiOS...</span>
          </button>
        </div>
      </div>
    </div>
  );
}
