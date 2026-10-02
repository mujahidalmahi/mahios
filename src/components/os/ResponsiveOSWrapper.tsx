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
  const [scale, setScale] = useState(1);
  const [virtualDim, setVirtualDim] = useState({ w: 1024, h: 520 });
  const [screenDim, setScreenDim] = useState({ w: 0, h: 0 });
  const { isBooting, finishBoot } = useBootStore();

  useEffect(() => {
    setMounted(true);

    const updateOrientationAndScale = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScreenDim({ w, h });

      // Identify mobile or tablet device - strictly excluding desktop PCs
      const isMobileDevice =
        /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches) ||
        (w <= 1024 && h <= 600 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

      if (!isMobileDevice) {
        // Desktop PC: 100% untouched native resolution
        setIsRotated(false);
        setScale(1);
        setVirtualDim({ w, h });
        return;
      }

      // Check if mobile device is held in portrait
      const shouldRotate = h > w;
      setIsRotated(shouldRotate);

      // Available landscape width and height
      const landW = shouldRotate ? h : w;
      const landH = shouldRotate ? w : h;

      // Reference canvas height (520px) matching the reference desktop layout
      // Ensures all 7 rows of icons, taskbar, and floating windows fit with zero collision
      const BASE_HEIGHT = 520;

      if (landH < BASE_HEIGHT) {
        const computedScale = Math.min(1, landH / BASE_HEIGHT);
        const computedVirtualW = Math.max(1024, Math.round(landW / computedScale));
        const computedVirtualH = BASE_HEIGHT;
        setScale(computedScale);
        setVirtualDim({ w: computedVirtualW, h: computedVirtualH });
      } else {
        setScale(1);
        setVirtualDim({ w: landW, h: landH });
      }

      // Attempt native orientation lock if supported
      if (screen.orientation && 'lock' in screen.orientation) {
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

    updateOrientationAndScale();
    window.addEventListener('resize', updateOrientationAndScale);
    window.addEventListener('orientationchange', updateOrientationAndScale);
    return () => {
      window.removeEventListener('resize', updateOrientationAndScale);
      window.removeEventListener('orientationchange', updateOrientationAndScale);
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

  // Exact desktop canvas transform
  const desktopContainerStyle: React.CSSProperties = isRotated
    ? {
        position: 'fixed',
        width: `${virtualDim.w}px`,
        height: `${virtualDim.h}px`,
        left: `${(screenDim.w - virtualDim.w) / 2}px`,
        top: `${(screenDim.h - virtualDim.h) / 2}px`,
        transform: `rotate(90deg) scale(${scale})`,
        transformOrigin: 'center center',
        overflow: 'hidden',
      }
    : scale < 1
    ? {
        position: 'fixed',
        width: `${virtualDim.w}px`,
        height: `${virtualDim.h}px`,
        left: `${(screenDim.w - virtualDim.w) / 2}px`,
        top: `${(screenDim.h - virtualDim.h) / 2}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        overflow: 'hidden',
      }
    : {
        // Desktop PC view: completely unchanged, 100% native
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      };

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] max-w-[100vw] bg-[#18191c] flex items-center justify-center overflow-hidden select-none p-0 m-0"
      data-desktop-wrapper="true"
      data-auto-rotated={isRotated ? 'true' : 'false'}
      data-scale={scale}
      data-virtual-w={virtualDim.w}
      data-virtual-h={virtualDim.h}
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
