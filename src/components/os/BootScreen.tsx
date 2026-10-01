'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';
import { BootLog, SiteSettings } from '@/types/database';

interface BootScreenProps {
  bootLogs: BootLog[];
  settings: SiteSettings;
  onBootComplete: () => void;
}

export default function BootScreen({ bootLogs, settings, onBootComplete }: BootScreenProps) {
  const { isBooting, finishBoot } = useBootStore();
  const { playSound } = useSystemStore();
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Starting MahiOS 05...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasTriggeredComplete = useRef(false);

  // Derive milestones from bootLogs or defaults
  const milestones = React.useMemo(() => {
    if (bootLogs && bootLogs.length > 0) {
      const activeLogs = bootLogs.filter((l) => l.is_active !== false);
      if (activeLogs.length > 0) {
        return activeLogs.map((l) =>
          l.message
            .replace(/\[OK\]|\[INIT\]|\[COMPLETE\]/g, '')
            .trim()
        );
      }
    }
    return [
      'Starting MahiOS 05...',
      'Detecting storage devices & memory allocation...',
      'Mounting Next.js 16 App Router Kernel & Turbopack...',
      'Initializing graphical shell & audio synthesizers...',
      'Loading user preferences & desktop environment...',
      'Welcome to MahiOS',
    ];
  }, [bootLogs]);

  useEffect(() => {
    if (!isBooting) return;

    let animFrameId: number;
    let startTime: number | null = null;
    const TOTAL_DURATION_MS = 2100; // 2.1s optimal nostalgic OS boot duration

    const completeBoot = () => {
      if (hasTriggeredComplete.current) return;
      hasTriggeredComplete.current = true;

      setIsFadingOut(true);
      playSound('boot');

      setTimeout(() => {
        finishBoot();
        onBootComplete();
      }, 260);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / TOTAL_DURATION_MS);

      // Smooth, natural operating system boot progression curve:
      // Starts gracefully, accelerates through hardware/kernel checks,
      // brief realistic stabilization at ~86%, then finishes smoothly to 100%.
      let calcProgress: number;
      if (t < 0.25) {
        // 0% -> 30% in first 25% of time
        calcProgress = (t / 0.25) * 30;
      } else if (t < 0.6) {
        // 30% -> 70% in next 35% of time
        calcProgress = 30 + ((t - 0.25) / 0.35) * 40;
      } else if (t < 0.82) {
        // 70% -> 86%
        calcProgress = 70 + ((t - 0.6) / 0.22) * 16;
      } else if (t < 0.9) {
        // Gentle micro-hold around 86-90% (mounting desktop shell)
        calcProgress = 86 + ((t - 0.82) / 0.08) * 4;
      } else {
        // Final smooth finish 90% -> 100%
        calcProgress = 90 + ((t - 0.9) / 0.1) * 10;
      }

      const clamped = Math.min(100, Math.max(0, calcProgress));
      setProgress(clamped);

      // Dynamically select status message based on progress
      const milestoneIndex = Math.min(
        milestones.length - 1,
        Math.floor((clamped / 100) * milestones.length)
      );
      setStatusMessage(milestones[milestoneIndex] || 'Starting MahiOS...');

      if (t < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        setProgress(100);
        setStatusMessage(milestones[milestones.length - 1] || 'Welcome to MahiOS');
        setTimeout(() => {
          completeBoot();
        }, 160);
      }
    };

    animFrameId = requestAnimationFrame(step);

    const handleSkip = () => {
      cancelAnimationFrame(animFrameId);
      setProgress(100);
      completeBoot();
    };

    const handleKeyDown = () => {
      handleSkip();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBooting, milestones, finishBoot, onBootComplete, playSound]);

  if (!isBooting) return null;

  const cleanSubtitle = (settings.boot_subtitle || 'Professional Edition — Personal Computing System')
    .replace(/1995/g, '2005')
    .replace(/MahiOS 95/g, 'MahiOS 05');

  return (
    <div
      onClick={() => {
        if (!hasTriggeredComplete.current) {
          hasTriggeredComplete.current = true;
          setIsFadingOut(true);
          playSound('boot');
          setTimeout(() => {
            finishBoot();
            onBootComplete();
          }, 200);
        }
      }}
      className={`fixed inset-0 z-[9999] retro-boot-backdrop text-white font-sans flex flex-col justify-between items-center select-none overflow-hidden p-6 sm:p-10 cursor-pointer transition-opacity duration-300 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle CRT scanline texture */}
      <div className="retro-boot-scanlines absolute inset-0 pointer-events-none opacity-35 z-0" />

      {/* Top subtle OS header */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs text-slate-400 font-mono tracking-wider pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-slate-300 font-semibold">MAHIOS WORKSTATION</span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          BUILD 2026.09 • 32-BIT PROTECTED MODE
        </div>
      </div>

      {/* Center Stage: Authentic Retro OS Splash & Smooth Loading Bar */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center my-auto px-4">
        {/* Retro OS Emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -inset-6 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
          <img
            src="/images/mahios-logo.png"
            alt="MahiOS"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain relative z-10 drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* Brand Wordmark & Edition */}
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]">
            MahiOS
          </h1>
          <span className="retro-badge-gold px-2.5 py-0.5 rounded-xs text-xs sm:text-sm font-black tracking-wider uppercase font-mono shadow-md">
            05
          </span>
        </div>

        {/* Tagline */}
        <div className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide mt-2">
          {cleanSubtitle}
        </div>
        <div className="text-[11px] text-blue-300/80 font-mono tracking-widest mt-1 uppercase">
          Mujahid Al Mahi • Systems & Full-Stack Engineer
        </div>

        {/* The Retro OS Loading Bar */}
        <div className="w-full max-w-md space-y-2 mt-8">
          {/* Status Header above track */}
          <div className="flex items-center justify-between text-xs text-slate-300 px-1">
            <span className="truncate max-w-[280px] sm:max-w-[340px] text-left font-medium text-blue-200">
              {statusMessage}
            </span>
            <span className="font-mono text-cyan-300 font-bold tabular-nums ml-2">
              {Math.round(progress)}%
            </span>
          </div>

          {/* The Iconic Sunken Segmented Progress Track */}
          <div className="retro-progress-track h-6 sm:h-7 p-1 rounded-xs relative overflow-hidden flex items-center">
            {/* Progress Fill Bar */}
            <div
              className="retro-progress-bar-fill h-full rounded-xs transition-[width] duration-75 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated Specular Sheen */}
              <div className="retro-progress-sheen absolute inset-0" />
            </div>

            {/* Classic 90s Segmented Block Grid */}
            <div className="retro-progress-segment-grid absolute inset-1 pointer-events-none" />
          </div>

          {/* Hardware Telemetry */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono pt-1 px-1">
            <span>MEM: 65,536 KB OK</span>
            <span>VGA 1024x768 @ 75Hz</span>
            <span className="hidden sm:inline">TURBOPACK 16 OK</span>
          </div>
        </div>
      </div>

      {/* Footer Instructions & Copyright */}
      <div className="relative z-10 w-full max-w-4xl text-center space-y-1.5 pb-2">
        <div className="text-[11px] sm:text-xs text-slate-400 animate-pulse tracking-wide font-sans">
          Press <span className="text-slate-200 font-semibold">ANY KEY</span> or{' '}
          <span className="text-slate-200 font-semibold">CLICK</span> anywhere to bypass
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Copyright © 2005-2026 Mujahid Al Mahi. All rights reserved.
        </div>
      </div>
    </div>
  );
}
