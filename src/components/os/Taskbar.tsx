'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Database, X } from 'lucide-react';
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
    timeFormat, showSeconds,
    playSound, volume, setVolume
  } = useSystemStore();

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [clockPopoverOpen, setClockPopoverOpen] = useState(false);
  const [volumePopoverOpen, setVolumePopoverOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const trayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now);
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

  // Handle outside click to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setClockPopoverOpen(false);
        setVolumePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close Start Menu on any click outside
  useEffect(() => {
    if (!startMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('button[data-start-btn="true"]') &&
        !target.closest('[data-start-menu="true"]')
      ) {
        setStartMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick, true);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick, true);
    };
  }, [startMenuOpen]);

  const handleWindowTabClick = (appId: string, isMinimized: boolean) => {
    playSound('click');
    if (activeWindowId === appId && !isMinimized) {
      minimizeWindow(appId);
    } else {
      focusWindow(appId);
    }
  };

  // Calendar days calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = currentDate.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 retro-taskbar flex items-center justify-between px-1 z-[900] select-none text-xs text-black font-sans">
      {/* Start Button & Window Tabs */}
      <div className="flex items-center gap-1 min-w-0 flex-1 h-full py-0.5">
        {/* Start Button with Custom Transparent Logo */}
        <button
          data-start-btn="true"
          type="button"
          onClick={() => {
            playSound('click');
            setStartMenuOpen(!startMenuOpen);
          }}
          className={`h-full px-2 flex items-center gap-1.5 font-bold font-sans text-xs cursor-pointer ${
            startMenuOpen ? 'retro-btn-pressed' : 'retro-btn'
          }`}
        >
          {/* Custom MahiOS Logo (Bigger) */}
          <img
            src="/images/mahios-logo.png"
            alt="MahiOS Logo"
            className="w-5 h-5 object-contain shrink-0 drop-shadow-xs"
          />
          <span className="font-bold tracking-wide">MahiOS</span>
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

      {/* System Tray & Interactive Clock/Volume */}
      <div ref={trayRef} className="relative flex items-center shrink-0 ml-1">
        {/* RETRO VOLUME SLIDER POPOVER */}
        {volumePopoverOpen && (
          <div className="absolute bottom-9 right-16 w-32 bg-[#c0c0c0] retro-box-outset p-2 shadow-2xl z-50 text-center font-sans space-y-2">
            <div className="bg-[#000080] text-white text-[11px] font-bold py-0.5 px-1 flex items-center justify-between">
              <span>Volume</span>
              <button
                type="button"
                onClick={() => setVolumePopoverOpen(false)}
                className="hover:text-gray-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-center h-28">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundEnabled ? volume : 0}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (!soundEnabled) toggleSound();
                }}
                className="w-24 -rotate-90 origin-center accent-[#000080] cursor-pointer"
              />
            </div>

            <div className="pt-1 border-t border-gray-400">
              <label className="flex items-center justify-center gap-1.5 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!soundEnabled}
                  onChange={() => toggleSound()}
                  className="rounded-none cursor-pointer"
                />
                <span>Mute</span>
              </label>
            </div>
          </div>
        )}

        {/* RETRO CALENDAR & CLOCK POPOVER */}
        {clockPopoverOpen && (
          <div className="absolute bottom-9 right-0 w-64 bg-[#c0c0c0] retro-box-outset p-2.5 shadow-2xl z-50 font-sans space-y-2">
            <div className="bg-[#000080] text-white text-[11px] font-bold py-0.5 px-1.5 flex items-center justify-between">
              <span>Date / Time Properties</span>
              <button
                type="button"
                onClick={() => setClockPopoverOpen(false)}
                className="hover:text-gray-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Current Time Display */}
            <div className="bg-white border-2 border-[#808080] retro-box-inset p-1.5 text-center font-mono text-sm font-bold text-[#000080]">
              {timeString}
            </div>

            {/* Month & Year Header */}
            <div className="flex items-center justify-between font-bold text-xs px-1">
              <span>{monthNames[month]} {year}</span>
            </div>

            {/* Days Grid */}
            <div className="bg-white border-2 border-[#808080] retro-box-inset p-1">
              <div className="grid grid-cols-7 text-center font-bold text-[10px] text-gray-600 border-b border-gray-200 pb-0.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-mono gap-y-0.5 pt-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === todayDate;
                  return (
                    <span
                      key={day}
                      className={`p-0.5 rounded-2xs ${
                        isToday ? 'bg-[#000080] text-white font-bold' : 'text-black hover:bg-blue-100'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-gray-600 font-mono text-center">
              MahiOS 05 Real-Time Clock Subsystem
            </div>
          </div>
        )}

        {/* System Tray Bar */}
        <div className="retro-box-inset px-2 py-0.5 flex items-center gap-2.5 h-[24px]">
          {/* Live Database Heartbeat */}
          <div
            className="flex items-center gap-1 cursor-help text-emerald-700"
            title="Supabase PostgreSQL: Connected & Synchronized in Real-Time"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Volume Trigger */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setVolumePopoverOpen(!volumePopoverOpen);
              setClockPopoverOpen(false);
            }}
            className="hover:opacity-75 cursor-pointer text-gray-700"
            title="Adjust Master Volume"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-700" /> : <VolumeX className="w-3.5 h-3.5 text-red-600" />}
          </button>

          {/* Digital Clock Trigger */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setClockPopoverOpen(!clockPopoverOpen);
              setVolumePopoverOpen(false);
            }}
            className="flex items-center gap-1 font-mono text-[11px] font-semibold text-black hover:bg-gray-200 px-1 rounded-2xs cursor-pointer"
            title="Click to view Date & Calendar"
          >
            <span>{timeString || '12:00 PM'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
