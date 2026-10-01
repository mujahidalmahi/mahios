'use client';

import React, { useState, useEffect } from 'react';

const TOTAL_BLOCKS = 22;

export default function Loading() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Smooth marquee chaser while server data is loading
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (TOTAL_BLOCKS + 4));
    }, 90);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white font-sans flex flex-col justify-between items-center select-none overflow-hidden p-6 sm:p-10">
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
          </div>

          {/* Sunken 3D Track with Discrete 3D Royal Blue Blocks */}
          <div className="retro-progress-track w-full h-5 sm:h-6 p-[3px] flex items-center gap-[3px]">
            {Array.from({ length: TOTAL_BLOCKS }).map((_, index) => {
              // Classic 3-block chaser while server streams
              const isChaser = index >= activeStep - 3 && index <= activeStep;
              const isLead = index === activeStep;
              return (
                <div
                  key={index}
                  className={`flex-1 h-full rounded-[1px] transition-all duration-75 ${
                    isChaser
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

      {/* Footer Copyright */}
      <div className="w-full max-w-xl text-center space-y-1 pb-2">
        <div className="text-[10px] text-slate-600 font-mono">
          Copyright © 2005-2026 Mujahid Al Mahi
        </div>
      </div>
    </div>
  );
}
