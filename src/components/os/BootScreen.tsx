'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';
import { BootLog, SiteSettings } from '@/types/database';
import MatrixRain from './MatrixRain';

interface BootScreenProps {
  bootLogs: BootLog[];
  settings: SiteSettings;
  onBootComplete: () => void;
}

export default function BootScreen({ bootLogs, settings, onBootComplete }: BootScreenProps) {
  const { isBooting, finishBoot } = useBootStore();
  const { playSound } = useSystemStore();
  const [displayedLogs, setDisplayedLogs] = useState<BootLog[]>([]);
  const [progress, setProgress] = useState(0);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isBooting) return;

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const runBootStep = (index: number) => {
      if (isCancelled) return;

      if (index < bootLogs.length) {
        const nextLog = bootLogs[index];
        setDisplayedLogs((prev) => [...prev, nextLog]);
        
        // Progress percentage calculation
        const percent = Math.min(98, Math.round(((index + 1) / bootLogs.length) * 100));
        setProgress(percent);
        
        // Optional subtle terminal click audio
        if (index % 2 === 0) {
          playSound('click');
        }

        // Auto-scroll terminal down
        if (logsContainerRef.current) {
          logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }

        // Calculate realistic delay (slower, deliberate hacker boot)
        // Base delay from log item or settings * multiplier
        const baseDelay = nextLog.delay_ms ? Math.max(260, nextLog.delay_ms * 2.8) : 320;
        
        timeoutId = setTimeout(() => {
          runBootStep(index + 1);
        }, baseDelay);
      } else {
        // Final completion pause
        setProgress(100);
        timeoutId = setTimeout(() => {
          if (!isCancelled) {
            playSound('boot');
            finishBoot();
            onBootComplete();
          }
        }, 800);
      }
    };

    // Initial brief 300ms pause before logs begin
    timeoutId = setTimeout(() => {
      runBootStep(0);
    }, 350);

    const handleKeyDown = () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      playSound('boot');
      finishBoot();
      onBootComplete();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBooting, bootLogs, finishBoot, onBootComplete, playSound]);

  if (!isBooting) return null;

  const cleanBootTitle = (settings.boot_title || 'MAHI QUANTUM BIOS v4.08 (C) 2005-2026')
    .replace(/1995/g, '2005')
    .replace(/MahiOS 95/g, 'MahiOS 05');

  const cleanBootSubtitle = (settings.boot_subtitle || 'MahiOS Modular Kernel Initialization Engine')
    .replace(/1995/g, '2005')
    .replace(/MahiOS 95/g, 'MahiOS 05');

  return (
    <div
      onClick={() => {
        playSound('boot');
        finishBoot();
        onBootComplete();
      }}
      className="fixed inset-0 z-50 bg-black text-[#00ff66] font-mono p-4 sm:p-8 flex flex-col justify-between select-none cursor-pointer overflow-hidden crt-scanlines"
    >
      {/* Background Matrix Rain */}
      {settings.matrix_rain_enabled && <MatrixRain opacity={0.35} />}

      <div className="relative z-10 space-y-4 max-w-4xl w-full mx-auto">
        {/* BIOS Header */}
        <div className="border-b border-[#008833] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-sm sm:text-base font-bold tracking-wider matrix-green-glow flex items-center gap-2">
              <span>{cleanBootTitle}</span>
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            </div>
            <div className="text-xs text-[#00cc55] opacity-80">
              {cleanBootSubtitle}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[11px] text-amber-400 font-bold tracking-widest">[ENERGY STAR ALLIANCE]</div>
            <div className="text-[10px] text-[#00aa44]">MODULAR KERNEL 2026.09</div>
          </div>
        </div>

        {/* Terminal Boot Sequence Logs */}
        <div
          ref={logsContainerRef}
          className="space-y-1.5 text-xs sm:text-sm font-mono max-h-[55vh] overflow-y-auto pr-2"
        >
          {displayedLogs.map((log, idx) => (
            <div key={log.id || idx} className="flex items-start gap-2 animate-fadeIn">
              <span className={`font-bold shrink-0 ${
                log.status_type === 'OK' ? 'text-[#00ff66]' :
                log.status_type === 'COMPLETE' ? 'text-cyan-300 matrix-cyan-glow' :
                log.status_type === 'WARN' ? 'text-amber-400' : 'text-[#88ffaa]'
              }`}>
                [{log.status_type}]
              </span>
              <span className="text-[#d0ffd0] leading-relaxed">{log.message}</span>
            </div>
          ))}

          <div className="flex items-center gap-1 text-[#00ff66] pt-1">
            <span>&gt;</span>
            <span className="term-cursor" />
          </div>
        </div>
      </div>

      {/* Progress & Skip Notice */}
      <div className="relative z-10 space-y-3 pt-4 border-t border-[#008833] max-w-4xl w-full mx-auto">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#00ee55] font-semibold tracking-wider">
            <span>INITIALIZING MAHIOS USERSPACE ENVIRONMENT</span>
            <span className="font-bold text-cyan-300 matrix-cyan-glow">{progress}%</span>
          </div>
          <div className="ascii-progress-container rounded-xs">
            <div
              className="ascii-progress-bar rounded-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-[#00aa44]">
          <span className="animate-pulse">&gt; Press ANY KEY or CLICK anywhere to bypass boot sequence...</span>
          <span className="font-mono text-[10px] opacity-75">SYS_RAM: 65536KB OK | CACHE: MOUNTED</span>
        </div>
      </div>
    </div>
  );
}
