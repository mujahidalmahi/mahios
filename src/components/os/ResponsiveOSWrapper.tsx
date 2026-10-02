'use client';

import React, { useState, useEffect } from 'react';
import { BiographyDatabaseData } from '@/types/database';
import { useBootStore } from '@/stores/bootStore';
import Desktop from './Desktop';
import BootScreen from './BootScreen';

interface ResponsiveOSWrapperProps {
  data: BiographyDatabaseData;
}

export default function ResponsiveOSWrapper({ data }: ResponsiveOSWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const { isBooting, finishBoot } = useBootStore();

  useEffect(() => {
    setMounted(true);

    // If deep-link or hash route is requested, bypass boot screen for instant visitor access
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if ((search && search.length > 1) || (hash && hash.length > 1)) {
        finishBoot();
      }
    }
  }, [finishBoot]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-full bg-black flex items-center justify-center text-slate-400 font-sans text-xs select-none overflow-hidden">
        <div className="flex items-center gap-2">
          <img src="/images/mahios-logo.png" alt="MahiOS" className="w-6 h-6 object-contain" />
          <span>Starting up...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] max-w-[100vw] bg-[#18191c] flex items-center justify-center overflow-hidden select-none p-0 m-0">
      {/* Boot Loading Screen Overlay */}
      {isBooting && (
        <BootScreen
          bootLogs={data.bootLogs}
          settings={data.settings}
          onBootComplete={() => finishBoot()}
        />
      )}

      {/* Native Full-Screen Web OS Desktop (Universal across all devices) */}
      <div className="w-full h-full relative overflow-hidden">
        <Desktop data={data} />
      </div>
    </div>
  );
}
