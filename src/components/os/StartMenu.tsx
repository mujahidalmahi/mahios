'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, RotateCcw, Power,
  Compass, Radio, BookOpen, Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star, Globe, Rocket,
  Monitor, Trash2, Calculator, FileEdit, Palette, Activity,
  Search, X
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
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Auto-focus search input when start menu opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Only close if click was not on the start button itself
        const target = e.target as HTMLElement;
        if (!target.closest('button[data-start-btn="true"]')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filtered applications based on real-time search query
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const q = searchQuery.toLowerCase().trim();
    return apps.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.app_id.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [apps, searchQuery]);

  if (!isOpen) return null;

  const handleLaunchApp = (app: DesktopApp) => {
    playSound('open');
    openWindow(app);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      data-start-menu="true"
      style={{ bottom: '32px' }}
      className="absolute left-0 z-50 retro-box-outset bg-[#c0c0c0] flex shadow-2xl overflow-hidden select-none w-72 h-[480px] max-h-[calc(100vh-42px)] text-black text-xs font-sans border-2 border-white"
    >
      {/* 90s Vertical Banner (MahiOS 05) */}
      <div className="w-8 bg-gradient-to-t from-[#000080] via-[#1084d0] to-[#000080] flex items-center justify-center text-white font-bold font-mono tracking-widest uppercase shrink-0 overflow-hidden select-none">
        <span className="transform -rotate-90 origin-center whitespace-nowrap text-xs font-bold drop-shadow tracking-widest">
          MahiOS 05
        </span>
      </div>

      {/* Main Start Menu Container */}
      <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
        {/* Real-time Program Search Bar */}
        <div className="mb-2">
          <div className="relative flex items-center bg-white border-2 border-[#808080] retro-box-inset px-2 py-1">
            <Search className="w-3.5 h-3.5 text-gray-500 shrink-0 mr-1.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-black p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable All Applications List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-0.5 border border-gray-400 retro-box-inset bg-white/90 p-1">
          {filteredApps.length === 0 ? (
            <div className="p-6 text-center text-gray-400 font-mono text-[11px]">
              No programs found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredApps.map((app) => {
              const Icon = iconMap[app.icon_name] || FileText;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleLaunchApp(app)}
                  className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-black"
                >
                  <div className="w-5 h-5 flex items-center justify-center text-[#000080] group-hover:text-white shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="truncate block font-medium text-xs">{app.title}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* System Power Options (No Admin Panel) */}
        <div className="pt-2 mt-2 border-t border-gray-400 space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSound('boot');
              startBoot();
              onClose();
            }}
            className="w-full px-2 py-1.5 flex items-center gap-2 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-red-900 font-bold"
          >
            <RotateCcw className="w-4 h-4 text-red-700 group-hover:text-white" />
            <span>Reboot MahiOS 05...</span>
          </button>
        </div>
      </div>
    </div>
  );
}
