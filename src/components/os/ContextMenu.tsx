'use client';

import React, { useEffect, useRef } from 'react';
import {
  RotateCcw, Settings, Terminal, Monitor,
  Info, Sparkles, FolderOpen, ShieldCheck
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { DesktopApp } from '@/types/database';

interface ContextMenuProps {
  x: number;
  y: number;
  targetApp?: DesktopApp | null;
  apps: DesktopApp[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, targetApp, apps, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { openWindow } = useWindowStore();
  const { playSound, toggleCrtMonitorFrame, crtMonitorFrame } = useSystemStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust coordinates so menu doesn't clip off-screen
  const menuWidth = 180;
  const menuHeight = targetApp ? 120 : 190;
  const adjustedX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - menuWidth - 10 : x);
  const adjustedY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - menuHeight - 10 : y);

  const openAppByName = (appId: string) => {
    const found = apps.find((a) => a.app_id === appId || a.id === appId);
    if (found) {
      playSound('open');
      openWindow(found);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-48 bg-[#c0c0c0] retro-box-outset p-0.5 text-xs text-black font-sans shadow-2xl select-none"
    >
      {targetApp ? (
        /* Icon Context Menu */
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              playSound('open');
              openWindow(targetApp);
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white font-bold cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Open {targetApp.title}</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          <button
            type="button"
            onClick={() => {
              openAppByName('settings');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Properties</span>
          </button>
        </div>
      ) : (
        /* Desktop Wallpaper Context Menu */
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Desktop</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          <button
            type="button"
            onClick={() => {
              openAppByName('terminal');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open MS-DOS Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              toggleCrtMonitorFrame();
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{crtMonitorFrame ? 'Exit CRT Monitor Chassis' : 'Mount CRT Monitor Chassis'}</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          <button
            type="button"
            onClick={() => {
              openAppByName('about');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About MahiOS...</span>
          </button>

          <button
            type="button"
            onClick={() => {
              openAppByName('settings');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer font-bold"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Control Panel / Properties</span>
          </button>
        </div>
      )}
    </div>
  );
}
