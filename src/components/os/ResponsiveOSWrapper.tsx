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
  const [isRotated, setIsRotated] = useState(false);
  const [screenDim, setScreenDim] = useState({ w: 0, h: 0 });
  const { isBooting, finishBoot } = useBootStore();

  useEffect(() => {
    setMounted(true);

    const updateOrientation = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScreenDim({ w, h });

      // Identify mobile or tablet device (touch enabled or dimension < 1024)
      const isMobileOrTablet =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        Math.min(w, h) < 1024;

      // Always landscape for mobiles and tablets:
      // If held in portrait (h > w), auto-rotate 90 degrees into landscape
      if (isMobileOrTablet && h > w) {
        setIsRotated(true);
      } else {
        setIsRotated(false);
      }

      // Attempt native orientation lock if supported
      if (isMobileOrTablet && screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    };

    // If deep-link or hash route is requested, bypass boot screen for instant visitor access
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if ((search && search.length > 1) || (hash && hash.length > 1)) {
        finishBoot();
      }
    }

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
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

  // When rotated 90deg, the container width becomes height and height becomes width
  const desktopContainerStyle: React.CSSProperties = isRotated
    ? {
        position: 'fixed',
        width: `${screenDim.h}px`,
        height: `${screenDim.w}px`,
        left: `${(screenDim.w - screenDim.h) / 2}px`,
        top: `${(screenDim.h - screenDim.w) / 2}px`,
        transform: 'rotate(90deg)',
        transformOrigin: 'center center',
        overflow: 'hidden',
      }
    : {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      };

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] max-w-[100vw] bg-[#18191c] flex items-center justify-center overflow-hidden select-none p-0 m-0"
      data-auto-rotated={isRotated ? 'true' : 'false'}
    >
      {/* Boot Loading Screen Overlay */}
      {isBooting && (
        <BootScreen
          bootLogs={data.bootLogs}
          settings={data.settings}
          onBootComplete={() => finishBoot()}
        />
      )}

      {/* Always-Horizontal Web OS Desktop */}
      <div style={desktopContainerStyle} className="transition-transform duration-200">
        <Desktop data={data} />
      </div>
    </div>
  );
}
