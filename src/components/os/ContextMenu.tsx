'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw, Settings, Terminal, Monitor,
  Info, Sparkles, FolderOpen, ShieldCheck,
  Layers, LayoutGrid, Rows, Columns, Minus,
  SlidersHorizontal, Check, ArrowDownAZ, Activity,
  ExternalLink, FileCode
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
  const {
    openWindow,
    cascadeWindows,
    tileHorizontally,
    tileVertically,
    minimizeAllWindows,
    restoreAllWindows,
    windows
  } = useWindowStore();

  const {
    playSound,
    toggleCrtMonitorFrame,
    crtMonitorFrame,
    setActiveAppProperties,
    desktopSortBy,
    setDesktopSortBy,
  } = useSystemStore();

  const [activeSubmenu, setActiveSubmenu] = useState<'sort' | 'arrange' | null>(null);

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
  const menuWidth = 210;
  const menuHeight = targetApp ? 140 : 280;
  const adjustedX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - menuWidth - 10 : x);
  const adjustedY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - menuHeight - 10 : y);

  const openAppByName = (appId: string) => {
    const found = apps.find((a) => a.app_id === appId || a.id === appId);
    if (found) {
      playSound('open');
      openWindow(found);
    }
  };

  const handleRefresh = () => {
    playSound('click');
    onClose();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-52 bg-[#c0c0c0] retro-box-outset p-0.5 text-xs text-black font-sans shadow-2xl select-none"
    >
      {targetApp ? (
        /* APPLICATION ICON CONTEXT MENU */
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
            <span className="truncate">Open {targetApp.title}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Create Shortcut</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          {/* AUTHENTIC APP PROPERTIES (Fixes opening control panel) */}
          <button
            type="button"
            onClick={() => {
              playSound('open');
              setActiveAppProperties(targetApp);
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white font-bold cursor-pointer text-black"
          >
            <FileCode className="w-3.5 h-3.5 text-[#000080] group-hover:text-white" />
            <span>Properties</span>
          </button>
        </div>
      ) : (
        /* DESKTOP WORKBENCH CONTEXT MENU */
        <div className="space-y-0.5">
          {/* Refresh Desktop with live data sync */}
          <button
            type="button"
            onClick={handleRefresh}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Desktop (Sync)</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          {/* Sort By Submenu */}
          <div
            onMouseEnter={() => setActiveSubmenu('sort')}
            className="relative"
          >
            <div className="w-full px-3 py-1 text-left flex items-center justify-between hover:bg-[#000080] hover:text-white cursor-pointer">
              <span className="flex items-center gap-2">
                <ArrowDownAZ className="w-3.5 h-3.5" />
                <span>Sort by</span>
              </span>
              <span className="text-[10px]">▶</span>
            </div>

            {activeSubmenu === 'sort' && (
              <div className="absolute left-[98%] top-0 w-36 bg-[#c0c0c0] retro-box-outset p-0.5 shadow-xl space-y-0.5">
                {[
                  { key: 'name', label: 'Name (A-Z)' },
                  { key: 'category', label: 'Category' },
                  { key: 'order', label: 'Default Order' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setDesktopSortBy(key as typeof desktopSortBy);
                      onClose();
                    }}
                    className="w-full px-2 py-1 text-left flex items-center justify-between hover:bg-[#000080] hover:text-white cursor-pointer"
                  >
                    <span>{label}</span>
                    {desktopSortBy === key && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-400 my-0.5" />

          {/* Real OS Window Management Actions */}
          <button
            type="button"
            disabled={windows.length === 0}
            onClick={() => {
              playSound('click');
              cascadeWindows();
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer disabled:opacity-40"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cascade Windows</span>
          </button>

          <button
            type="button"
            disabled={windows.length === 0}
            onClick={() => {
              playSound('click');
              tileHorizontally();
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer disabled:opacity-40"
          >
            <Rows className="w-3.5 h-3.5" />
            <span>Tile Windows Horizontally</span>
          </button>

          <button
            type="button"
            disabled={windows.length === 0}
            onClick={() => {
              playSound('click');
              tileVertically();
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer disabled:opacity-40"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Tile Windows Vertically</span>
          </button>

          <button
            type="button"
            disabled={windows.length === 0}
            onClick={() => {
              playSound('click');
              minimizeAllWindows();
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Show Desktop (Minimize All)</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          {/* CRT Frame Toggle */}
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
            <span>{crtMonitorFrame ? 'Exit CRT Chassis Housing' : 'Mount Vintage CRT Chassis'}</span>
          </button>

          {/* Desktop Properties */}
          <button
            type="button"
            onClick={() => {
              openAppByName('settings');
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer font-bold"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Display Properties</span>
          </button>
        </div>
      )}
    </div>
  );
}
