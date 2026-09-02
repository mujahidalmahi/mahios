'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { WindowState } from '@/types/os';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function Window({ window: win, children }: WindowProps) {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  const { playSound } = useSystemStore();
  const isActive = activeWindowId === win.appId;

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Handle Drag Start
  const handleMouseDownTitle = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    focusWindow(win.appId);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: win.position.x,
      startPosY: win.position.y,
    };
  };

  // Handle Resize Start
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    focusWindow(win.appId);
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: win.size.width,
      startH: win.size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const maxW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const maxH = typeof window !== 'undefined' ? window.innerHeight - 34 : 800;

      if (isDragging && dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const clampedX = Math.max(0, Math.min(maxW - 80, dragRef.current.startPosX + dx));
        const clampedY = Math.max(0, Math.min(maxH - 30, dragRef.current.startPosY + dy));

        updateWindowPosition(win.appId, {
          x: clampedX,
          y: clampedY,
        });
      }

      if (isResizing && resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const newWidth = Math.min(maxW - win.position.x, Math.max(320, resizeRef.current.startW + dx));
        const newHeight = Math.min(maxH - win.position.y, Math.max(260, resizeRef.current.startH + dy));

        updateWindowSize(win.appId, {
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragRef.current = null;
      resizeRef.current = null;
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, win.appId, win.position.x, win.position.y, updateWindowPosition, updateWindowSize]);

  if (win.isMinimized) return null;

  return (
    <div
      onClick={() => focusWindow(win.appId)}
      style={{
        position: 'absolute',
        left: win.isMaximized ? 0 : `${win.position.x}px`,
        top: win.isMaximized ? 0 : `${win.position.y}px`,
        width: win.isMaximized ? '100%' : `${win.size.width}px`,
        height: win.isMaximized ? 'calc(100% - 32px)' : `${win.size.height}px`,
        minWidth: '320px',
        minHeight: '260px',
        maxWidth: '100%',
        maxHeight: 'calc(100% - 32px)',
        zIndex: win.zIndex,
      }}
      className={`retro-box-outset flex flex-col select-none shadow-2xl transition-none ${
        isDragging ? 'opacity-95' : ''
      }`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDownTitle}
        className={`h-7 px-2 flex items-center justify-between cursor-move text-xs font-bold shrink-0 ${
          isActive ? 'retro-titlebar' : 'retro-titlebar-inactive'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate min-w-0 mr-2">
          <span className="text-[11px] truncate">{win.title}</span>
        </div>

        {/* Window Control Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Minimize */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              minimizeWindow(win.appId);
            }}
            className="retro-window-btn cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-2.5 h-2.5 stroke-[3]" />
          </button>

          {/* Maximize / Restore */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              maximizeWindow(win.appId);
            }}
            className="retro-window-btn cursor-pointer"
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            <Square className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playSound('close');
              closeWindow(win.appId);
            }}
            className="retro-window-btn hover:bg-red-500 hover:text-white cursor-pointer"
            title="Close"
          >
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Sunken Content Area */}
      <div className="flex-1 min-h-0 bg-[#ffffff] m-1 retro-box-inset overflow-y-auto overflow-x-hidden text-[#000000] p-3 sm:p-4 text-xs font-sans leading-normal break-words">
        {children}
      </div>

      {/* Resize Handle at Bottom-Right */}
      {!win.isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 cursor-nwse-resize flex items-end justify-end p-0.5 z-20"
          title="Resize window"
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-gray-600" />
        </div>
      )}
    </div>
  );
}
