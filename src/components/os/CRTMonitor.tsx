'use client';

import React from 'react';
import { useSystemStore } from '@/stores/systemStore';

interface CRTMonitorProps {
  children: React.ReactNode;
}

export default function CRTMonitor({ children }: CRTMonitorProps) {
  const { crtScanlines, crtCurvature, crtFlicker, playSound } = useSystemStore();

  return (
    <div className="w-full h-full max-h-[100dvh] max-w-[1500px] mx-auto flex flex-col items-center justify-center p-1 sm:p-2 md:p-3 select-none overflow-hidden">
      {/* Outer Chassis */}
      <div className="w-full h-full max-h-[calc(100dvh-28px)] crt-monitor-chassis p-2 sm:p-3 md:p-4 flex flex-col justify-between">
        {/* Sunken Inner Screen Bezel */}
        <div className="w-full flex-1 min-h-0 crt-screen-bezel bg-black relative flex flex-col">
          {/* Glass Screen with curvature and effects */}
          <div
            className={`w-full h-full flex-1 min-h-0 relative overflow-hidden bg-[#008080] ${
              crtCurvature ? 'crt-screen-curvature' : ''
            } ${crtScanlines ? 'crt-scanlines' : ''} ${crtFlicker ? 'crt-flicker' : ''}`}
          >
            {children}
          </div>
        </div>

        {/* Monitor Bottom Control Panel */}
        <div className="mt-2 pt-1 flex items-center justify-between px-3 sm:px-6 text-[#555045] shrink-0">
          {/* Retro Monitor Brand Badge */}
          <div className="flex items-center gap-2">
            <span className="crt-badge">MahiVision 1795</span>
            <span className="text-[10px] font-mono text-[#777265] hidden sm:inline">HIGH RESOLUTION DIGITAL CRT</span>
          </div>

          {/* Physical Buttons & Green LED */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => playSound('click')}
                className="w-4 h-2.5 sm:w-4.5 sm:h-3 bg-[#8e887a] border border-[#beb9ac] border-b-[#5c574b] border-r-[#5c574b] rounded-2xs shadow-2xs active:translate-y-0.5 cursor-pointer"
                title="Brightness Control"
              />
              <button
                type="button"
                onClick={() => playSound('click')}
                className="w-4 h-2.5 sm:w-4.5 sm:h-3 bg-[#8e887a] border border-[#beb9ac] border-b-[#5c574b] border-r-[#5c574b] rounded-2xs shadow-2xs active:translate-y-0.5 cursor-pointer"
                title="Contrast Control"
              />
              <button
                type="button"
                onClick={() => playSound('click')}
                className="w-4 h-2.5 sm:w-4.5 sm:h-3 bg-[#8e887a] border border-[#beb9ac] border-b-[#5c574b] border-r-[#5c574b] rounded-2xs shadow-2xs active:translate-y-0.5 cursor-pointer"
                title="Degauss CRT"
              />
            </div>

            {/* Power Switch with Glowing Green LED */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#8e887a]">
              <span className="crt-led-on" title="Power LED" />
              <button
                type="button"
                onClick={() => playSound('click')}
                className="w-5 h-5 sm:w-6 sm:h-6 bg-[#7c7668] border-2 border-[#b8b2a3] border-b-[#4a463c] border-r-[#4a463c] rounded-2xs shadow-xs flex items-center justify-center text-[9px] font-bold text-[#333] active:translate-y-0.5 cursor-pointer"
                title="Power Switch"
              >
                ⏻
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monitor Neck & Base */}
      <div className="crt-monitor-neck hidden xl:block shrink-0" />
      <div className="crt-monitor-base hidden xl:block shrink-0" />
    </div>
  );
}
