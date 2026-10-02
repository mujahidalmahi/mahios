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
  const [virtualDim] = useState({ w: 1024, h: 540 });
  const [viewportDim, setViewportDim] = useState({ w: 0, h: 0 });
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const { isBooting, finishBoot } = useBootStore();

  useEffect(() => {
    setMounted(true);

    const updateOrientationAndScale = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      setViewportDim({ w, h });

      // Identify mobile or tablet device - strictly excluding desktop PCs
      const isMobileDevice =
        /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches) ||
        (w <= 1024 && h <= 600 && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

      if (!isMobileDevice) {
        // Desktop PC: 100% untouched native resolution
        setIsRotated(false);
        setScale(1);
        return;
      }

      // Check if mobile device is held in portrait
      const shouldRotate = h > w;
      setIsRotated(shouldRotate);

      // Available landscape width and height from the actual visible viewport
      const availW = shouldRotate ? h : w;
      const availH = shouldRotate ? w : h;

      // Fixed 1024x540 reference desktop canvas:
      // Scale uniformly so that 100% of the desktop fits within the screen on ANY device
      const scaleX = availW / 1024;
      const scaleY = availH / 540;
      const computedScale = Math.min(scaleX, scaleY);

      setScale(computedScale);

      // Attempt native orientation lock if supported
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setShowKeyboardHint(true);
      }
    };

    const handleFocusOut = () => {
      setShowKeyboardHint(false);
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
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('resize', updateOrientationAndScale);
      window.removeEventListener('orientationchange', updateOrientationAndScale);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
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
        left: `${(viewportDim.w - virtualDim.w) / 2}px`,
        top: `${(viewportDim.h - virtualDim.h) / 2}px`,
        transform: `rotate(90deg) scale(${scale})`,
        transformOrigin: 'center center',
        overflow: 'hidden',
      }
    : scale < 1
    ? {
        position: 'fixed',
        width: `${virtualDim.w}px`,
        height: `${virtualDim.h}px`,
        left: `${(viewportDim.w - virtualDim.w) / 2}px`,
        top: `${(viewportDim.h - virtualDim.h) / 2}px`,
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
      {/* Typing helper toast when input is active in rotated mode */}
      {isRotated && showKeyboardHint && (
        <div className="fixed top-2 z-[9999] bg-[#ffffcc] text-black border border-[#808080] shadow-md px-3 py-1 rounded-xs text-[11px] font-sans flex items-center gap-1.5 pointer-events-none animate-pulse">
          <span>⌨️ Turn phone sideways for horizontal keyboard</span>
        </div>
      )}

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
