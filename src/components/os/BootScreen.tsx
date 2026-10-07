'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';

import { BootLog, SiteSettings } from '@/types/database';

interface BootScreenProps {
  bootLogs?: BootLog[];
  settings?: SiteSettings;
  onBootComplete: () => void;
}

const TOTAL_BLOCKS = 22;

export default function BootScreen({ onBootComplete }: BootScreenProps) {
  const { isBooting, finishBoot } = useBootStore();
  const { playSound } = useSystemStore();
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasTriggeredComplete = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('mahios_booted') === 'true') {
      finishBoot();
      onBootComplete();
      return;
    }

    let animFrameId: number;
    let startTime: number | null = null;
    const TOTAL_DURATION_MS = 1800; // Authentic vintage boot duration

    const completeBoot = () => {
      if (hasTriggeredComplete.current) return;
      hasTriggeredComplete.current = true;

      try {
        sessionStorage.setItem('mahios_booted', 'true');
      } catch {
        // Storage access might be restricted
      }

      setIsFadingOut(true);
      playSound('boot');

      setTimeout(() => {
        finishBoot();
        onBootComplete();
      }, 200);
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / TOTAL_DURATION_MS);

      // Smooth retro OS progression curve
      let calcProgress: number;
      if (t < 0.25) {
        calcProgress = (t / 0.25) * 28;
      } else if (t < 0.65) {
        calcProgress = 28 + ((t - 0.25) / 0.4) * 44;
      } else if (t < 0.85) {
        calcProgress = 72 + ((t - 0.65) / 0.2) * 16;
      } else {
        calcProgress = 88 + ((t - 0.85) / 0.15) * 12;
      }

      const clamped = Math.min(100, Math.max(0, calcProgress));
      setProgress(clamped);

      if (t < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        setProgress(100);
        setTimeout(() => {
          completeBoot();
        }, 180);
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
  }, [isBooting, finishBoot, onBootComplete, playSound]);

  if (!isBooting) return null;

  const activeBlocks = Math.floor((progress / 100) * TOTAL_BLOCKS);

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
          }, 180);
        }
      }}
      className={`fixed inset-0 z-[9999] bg-black text-white font-sans flex flex-col justify-between items-center select-none overflow-hidden p-6 sm:p-10 cursor-pointer transition-opacity duration-200 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacing */}
      <div className="w-full max-w-xl h-6" />

      {/* Center Stage: Authentic Vintage OS Branding & Loading Bar */}
      <div className="flex flex-col items-center justify-center my-auto">
        {/* OS Logo */}
        <img
          src="/images/mahios-logo.png"
          alt="MahiOS"
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-4 select-none pointer-events-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
        />

        {/* OS Wordmark */}
        <div className="flex items-center justify-center gap-2.5">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
            MahiOS
          </span>
          <span className="text-xs sm:text-sm font-bold text-sky-400 font-mono px-2 py-0.5 border border-sky-400/50 rounded-xs bg-sky-950/60 shadow-sm">
            05
          </span>
        </div>

        {/* Edition Tagline */}
        <div className="text-xs text-slate-400 font-sans tracking-widest uppercase mt-2">
          Professional Edition
        </div>

        {/* Authentic Vintage Loading Bar */}
        <div className="flex flex-col items-center w-72 sm:w-84 max-w-[85vw] mt-10 sm:mt-12">
          {/* Header above bar */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-0.5 font-sans">
            <span>Starting up...</span>
            <span className="font-mono text-slate-300 font-semibold tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Sunken 3D Track with Discrete 3D Royal Blue Blocks */}
          <div className="retro-progress-track w-full h-5 sm:h-6 p-[3px] flex items-center gap-[3px]">
            {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => {
              const isActive = index < activeBlocks;
              const isLead = index === activeBlocks - 1 && progress < 100;
              return (
                <div
                  key={index}
                  className={`flex-1 h-full rounded-[1px] transition-all duration-75 ${
                    isActive
                      ? isLead
                        ? 'retro-progress-block-lead'
                        : 'retro-progress-block'
                      : 'retro-progress-block-empty'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Notice & Copyright */}
      <div className="w-full max-w-xl text-center space-y-1 pb-2">
        <div className="text-[11px] text-slate-500 font-sans">
          Click anywhere or press any key to skip
        </div>
        <div className="text-[10px] text-slate-600 font-mono">
          Copyright © 2005-2026 Mujahid Al Mahi
        </div>
      </div>
    </div>
  );
}
