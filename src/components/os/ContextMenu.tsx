'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw, Settings, Terminal,
  FolderOpen, Layers, Rows, Columns, Minus,
  FileCode, FileEdit, ExternalLink, ShieldCheck
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

  const {
    playSound,
    setActiveAppProperties,
  } = useSystemStore();

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

  const menuWidth = 200;
  const menuHeight = targetApp ? 120 : 250;
  const adjustedX = Math.min(x, typeof window !== 'undefined' ? window.innerWidth - menuWidth - 10 : x);
  const adjustedY = Math.min(y, typeof window !== 'undefined' ? window.innerHeight - menuHeight - 10 : y);

  const openAppById = (appId: string) => {
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

  const handleNewTextDoc = () => {
    playSound('open');
    openAppById('notepad');
    onClose();
  };

  const handleOpenTerminal = () => {
    playSound('open');
    openAppById('terminal');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-[1100] w-52 bg-[#c0c0c0] retro-box-outset p-0.5 text-xs text-black font-sans shadow-2xl select-none"
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

          {/* Run as Administrator (Issue 4) */}
          <button
            type="button"
            onClick={() => {
              playSound('open');
              openWindow(targetApp);
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer font-medium text-black"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
            <span>Run as Administrator</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          {/* Genuine App Properties Dialog */}
          <button
            type="button"
            onClick={() => {
              playSound('open');
              setActiveAppProperties(targetApp);
              onClose();
            }}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white font-bold cursor-pointer text-black"
          >
            <FileCode className="w-3.5 h-3.5 text-[#000080]" />
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

          {/* New Text Document Shortcut (Issue 3) */}
          <button
            type="button"
            onClick={handleNewTextDoc}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5 text-blue-900" />
            <span>New Text Document</span>
          </button>

          {/* Open Terminal Shortcut (Issue 3) */}
          <button
            type="button"
            onClick={handleOpenTerminal}
            className="w-full px-3 py-1 text-left flex items-center gap-2 hover:bg-[#000080] hover:text-white cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-black" />
            <span>Open Terminal</span>
          </button>

          <div className="border-t border-gray-400 my-0.5" />

          {/* Intentionally disabled window layout features (per user instruction: Issue 3) */}
          <div className="w-full px-3 py-1 text-left flex items-center gap-2 text-gray-400 cursor-not-allowed select-none opacity-60">
            <Layers className="w-3.5 h-3.5" />
            <span>Cascade Windows</span>
          </div>

          <div className="w-full px-3 py-1 text-left flex items-center gap-2 text-gray-400 cursor-not-allowed select-none opacity-60">
            <Rows className="w-3.5 h-3.5" />
            <span>Tile Windows Horizontally</span>
          </div>

          <div className="w-full px-3 py-1 text-left flex items-center gap-2 text-gray-400 cursor-not-allowed select-none opacity-60">
            <Columns className="w-3.5 h-3.5" />
            <span>Tile Windows Vertically</span>
          </div>

          <div className="w-full px-3 py-1 text-left flex items-center gap-2 text-gray-400 cursor-not-allowed select-none opacity-60">
            <Minus className="w-3.5 h-3.5" />
            <span>Show Desktop</span>
          </div>

          <div className="border-t border-gray-400 my-0.5" />

          {/* Display Properties */}
          <button
            type="button"
            onClick={() => {
              openAppById('settings');
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
