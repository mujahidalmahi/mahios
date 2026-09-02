'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, Clock } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { DesktopApp } from '@/types/database';
import StartMenu from './StartMenu';

interface TaskbarProps {
  apps: DesktopApp[];
}

export default function Taskbar({ apps }: TaskbarProps) {
  const { windows, activeWindowId, focusWindow, minimizeWindow } = useWindowStore();
  const {
    soundEnabled, toggleSound,
    crtMonitorFrame, toggleCrtMonitorFrame,
    timeFormat, showSeconds,
    playSound
  } = useSystemStore();

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      if (timeFormat === '12h') {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = hours.toString().padStart(2, '0');
        setTimeString(showSeconds ? `${hoursStr}:${minutes}:${seconds} ${ampm}` : `${hoursStr}:${minutes} ${ampm}`);
      } else {
        const hoursStr = hours.toString().padStart(2, '0');
        setTimeString(showSeconds ? `${hoursStr}:${minutes}:${seconds}` : `${hoursStr}:${minutes}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeFormat, showSeconds]);

  const handleWindowTabClick = (appId: string, isMinimized: boolean) => {
    playSound('click');
    if (activeWindowId === appId && !isMinimized) {
      minimizeWindow(appId);
    } else {
      focusWindow(appId);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 retro-taskbar flex items-center justify-between px-1 z-40 select-none text-xs text-black font-sans">
      {/* Start Button & Window Tabs */}
      <div className="flex items-center gap-1 min-w-0 flex-1 h-full py-0.5">
        {/* Start Button */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setStartMenuOpen(!startMenuOpen);
          }}
          className={`h-full px-2.5 flex items-center gap-1.5 font-bold font-sans text-xs cursor-pointer ${
            startMenuOpen ? 'retro-btn-pressed' : 'retro-btn'
          }`}
        >
          {/* 4-Color Retro Flag */}
          <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
            <span className="bg-[#ff0000] rounded-2xs" />
            <span className="bg-[#00ff00] rounded-2xs" />
            <span className="bg-[#0000ff] rounded-2xs" />
            <span className="bg-[#ffff00] rounded-2xs" />
          </div>
          <span>Start</span>
        </button>

        {/* Start Menu Popover */}
        <StartMenu
          isOpen={startMenuOpen}
          onClose={() => setStartMenuOpen(false)}
          apps={apps}
        />

        {/* Divider */}
        <div className="w-0.5 h-5 bg-gray-400 border-r border-white mx-0.5 hidden sm:block" />

        {/* Window Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto h-full flex-1">
          {windows.map((win) => {
            const isActive = activeWindowId === win.appId && !win.isMinimized;
            return (
              <button
                key={win.id}
                type="button"
                onClick={() => handleWindowTabClick(win.appId, win.isMinimized)}
                className={`h-full px-2 max-w-[150px] min-w-[90px] flex items-center gap-1.5 truncate text-left text-[11px] font-medium cursor-pointer ${
                  isActive ? 'retro-btn-pressed bg-[#dfdfdf] font-bold' : 'retro-btn'
                }`}
              >
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Tray */}
      <div className="retro-box-inset px-2 py-0.5 flex items-center gap-2.5 h-[24px] shrink-0 ml-1">
        {/* CRT Frame Toggle */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            toggleCrtMonitorFrame();
          }}
          className={`hover:opacity-75 cursor-pointer ${crtMonitorFrame ? 'text-blue-800 font-bold' : 'text-gray-600'}`}
          title={crtMonitorFrame ? 'Switch to Full-Screen OS Mode' : 'Mount Vintage CRT Monitor Housing'}
        >
          <Monitor className="w-3.5 h-3.5" />
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => {
            toggleSound();
            playSound('click');
          }}
          className="hover:opacity-75 cursor-pointer text-gray-700"
          title={soundEnabled ? 'Mute 8-Bit Audio' : 'Unmute 8-Bit Audio'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-700" /> : <VolumeX className="w-3.5 h-3.5 text-red-600" />}
        </button>

        {/* Digital Clock */}
        <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-black">
          <span>{timeString || '12:00 PM'}</span>
        </div>
      </div>
    </div>
  );
}
