'use client';

import React from 'react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { DesktopApp } from '@/types/database';
import VintageOsIcon from './VintageOsIcon';


interface DesktopIconProps {
  app: DesktopApp;
  onContextMenu?: (e: React.MouseEvent, app: DesktopApp) => void;
}

const DesktopIcon = React.memo(function DesktopIcon({ app, onContextMenu }: DesktopIconProps) {
  const { openWindow } = useWindowStore();
  const { playSound, selectedIconId, setSelectedIconId } = useSystemStore();

  const isSelected = selectedIconId === app.id;

  const handleOpen = () => {
    playSound('open');
    openWindow(app);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setSelectedIconId(app.id);

    // On touch devices without double-click, open immediately
    if ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)) {
      handleOpen();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpen();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIconId(app.id);
    if (onContextMenu) {
      onContextMenu(e, app);
    }
  };

  return (
    <div
      data-desktop-icon="true"
      role="button"
      aria-label={`Open ${app.title}`}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      className="group w-[74px] h-[66px] p-0.5 flex flex-col items-center justify-start text-center select-none cursor-pointer focus:outline-none focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-white focus-visible:bg-[#000080]/40 rounded-xs transition-none overflow-hidden"
    >
      {/* Authentic Windows 95 Vintage OS Icon Sprite */}
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0 mb-0">
        <VintageOsIcon appId={app.app_id} isSelected={isSelected} className="w-8 h-8" />
      </div>

      {/* Fixed-height Icon Label Container ensures horizontal and vertical alignment for 1 or 2 lines */}
      <div className="h-[28px] w-full flex items-center justify-center px-0.5">
        <span
          className={`text-[11px] font-sans leading-[13px] line-clamp-2 px-1 py-0.5 transition-none select-none max-w-[72px] text-center ${
            isSelected
              ? 'bg-[#000080] text-white outline-1 outline-dotted outline-white shadow-xs'
              : 'text-white drop-shadow-[1px_1px_1px_rgba(0,0,0,1)]'
          }`}
        >
          {app.title}
        </span>
      </div>
    </div>

  );
});

export default DesktopIcon;

