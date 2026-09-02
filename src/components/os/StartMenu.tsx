'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  User, Briefcase, FolderGit2, Cpu, GraduationCap,
  Terminal, Image as ImageIcon, Award, FileText, FileBadge,
  Mail, Settings, RotateCcw, ShieldCheck, Power,
  Compass, Radio, BookOpen, Share2, Scale, Gamepad2, Target, Sparkles, Flame, Star, Globe, Rocket
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

  return (
    <div
      ref={menuRef}
      className="absolute bottom-8 left-0 z-50 retro-box-outset bg-[#c0c0c0] flex shadow-2xl overflow-hidden select-none w-64 text-black text-xs font-sans"
    >
      {/* 90s Vertical Banner */}
      <div className="w-8 bg-gradient-to-t from-[#000080] via-[#1084d0] to-[#000080] flex items-end justify-center py-4 px-1 text-white font-bold font-mono tracking-widest uppercase">
        <span className="transform -rotate-90 origin-center whitespace-nowrap text-sm drop-shadow">
          MahiOS 95
        </span>
      </div>

      {/* Menu Options */}
      <div className="flex-1 p-1 flex flex-col justify-between">
        <div className="space-y-0.5 max-h-[360px] overflow-y-auto">
          {apps.map((app) => {
            const Icon = iconMap[app.icon_name] || FileText;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  playSound('open');
                  openWindow(app);
                  onClose();
                }}
                className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group"
              >
                <div className="w-5 h-5 flex items-center justify-center text-[#000080] group-hover:text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate font-medium">{app.title}</span>
              </button>
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
