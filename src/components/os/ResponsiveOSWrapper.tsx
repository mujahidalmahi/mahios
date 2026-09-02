'use client';

import React, { useState, useEffect } from 'react';
import { BiographyDatabaseData } from '@/types/database';
import { ViewportMode } from '@/types/os';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';
import CRTMonitor from './CRTMonitor';
import Desktop from './Desktop';
import MobileShell from '@/components/mobile/MobileShell';
import TabletShell from '@/components/tablet/TabletShell';
import BootScreen from './BootScreen';

interface ResponsiveOSWrapperProps {
  data: BiographyDatabaseData;
}

export default function ResponsiveOSWrapper({ data }: ResponsiveOSWrapperProps) {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('crt-desktop');
  const [mounted, setMounted] = useState(false);
  const { isBooting, finishBoot } = useBootStore();
  const { crtMonitorFrame, crtScanlines, crtCurvature, crtFlicker } = useSystemStore();

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewportMode('mobile');
      } else if (width < 1024) {
        setViewportMode('tablet');
      } else {
        setViewportMode('crt-desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-full bg-black flex items-center justify-center text-[#00ff66] font-mono text-sm select-none overflow-hidden">
        [INITIALIZING MAHIOS...]
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

      {/* Responsive Viewport Rendering */}
      {viewportMode === 'mobile' ? (
        <MobileShell data={data} />
      ) : viewportMode === 'tablet' ? (
        <TabletShell data={data} />
      ) : crtMonitorFrame ? (
        /* Optional Vintage Beige CRT Monitor Frame Housing */
        <CRTMonitor>
          <Desktop data={data} />
        </CRTMonitor>
      ) : (
        /* Native Full-Screen Web OS Desktop (Default) */
        <div
          className={`w-full h-full relative overflow-hidden ${
            crtCurvature ? 'crt-screen-curvature' : ''
          } ${crtScanlines ? 'crt-scanlines' : ''} ${crtFlicker ? 'crt-flicker' : ''}`}
        >
          <Desktop data={data} />
        </div>
      )}
    </div>
  );
}
