'use client';

import React, { useState, useEffect } from 'react';
import { BiographyDatabaseData } from '@/types/database';
import { useBootStore } from '@/stores/bootStore';
import { useMobileTouchScroll } from '@/hooks/useMobileTouchScroll';
import Desktop from './Desktop';
import BootScreen from './BootScreen';
import CRTMonitor from './CRTMonitor';
import { useSystemStore } from '@/stores/systemStore';

interface ResponsiveOSWrapperProps {
  data: BiographyDatabaseData;
}

export default function ResponsiveOSWrapper({ data }: ResponsiveOSWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [scale, setScale] = useState(1);
  const [virtualDim] = useState({ w: 1024, h: 540 });
  const [viewportDim, setViewportDim] = useState({ w: 0, h: 0 });
  const { isBooting, finishBoot } = useBootStore();
  const { crtMonitorFrame } = useSystemStore();

  // High performance touch scrolling engine for rotated and scaled mobile layouts
  useMobileTouchScroll({
    isRotated,
    scale,
    enabled: isMobile || scale < 1 || isRotated,
  });

  useEffect(() => {
    setMounted(true);

    const updateOrientationAndScale = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewportDim({ w, h });

      // Identify mobile or tablet device
      const isMobileDevice =
        /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches) ||
        (w <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

      setIsMobile(isMobileDevice);
      setIsRotated(false);
      setScale(1);
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

  // Native responsive desktop container
  const desktopContainerStyle: React.CSSProperties = {
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

      {/* Web OS Desktop Canvas (with optional vintage CRT monitor housing) */}
      <div style={desktopContainerStyle} className="transition-transform duration-200">
        {crtMonitorFrame ? (
          <CRTMonitor>
            <Desktop data={data} />
          </CRTMonitor>
        ) : (
          <Desktop data={data} />
        )}
      </div>
    </div>
  );
}
