'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';
import { WindowState } from '@/types/os';
import { getAppIcon } from '@/lib/utils/appIcons';
import VintageOsIcon from './VintageOsIcon';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

function WindowComponent({ window: win, children }: WindowProps) {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
  } = useWindowStore();

  const { playSound } = useSystemStore();
  const isActive = activeWindowId === win.appId;

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  // Resizing state
  type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startPosX: number;
    startPosY: number;
    direction: ResizeDirection;
  } | null>(null);

  // Snapping guide state
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | null>(null);

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

  // Handle Resize Start (8-way)
  const handleMouseDownResize = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation();
    focusWindow(win.appId);
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: win.size.width,
      startH: win.size.height,
      startPosX: win.position.x,
      startPosY: win.position.y,
      direction,
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

        // Edge snap detection during drag
        if (e.clientY <= 10) {
          setSnapPreview('top');
        } else if (e.clientX <= 12) {
          setSnapPreview('left');
        } else if (e.clientX >= maxW - 12) {
          setSnapPreview('right');
        } else {
          setSnapPreview(null);
        }
      }

      if (isResizing && resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const { startW, startH, startPosX, startPosY, direction } = resizeRef.current;

        let newWidth = startW;
        let newHeight = startH;
        let newPosX = startPosX;
        let newPosY = startPosY;

        // Horizontal sizing
        if (direction.includes('e')) {
          newWidth = Math.min(maxW - startPosX, Math.max(320, startW + dx));
        } else if (direction.includes('w')) {
          const candidateW = startW - dx;
          if (candidateW >= 320) {
            const candidateX = Math.max(0, startPosX + dx);
            newWidth = startW + (startPosX - candidateX);
            newPosX = candidateX;
          } else {
            newWidth = 320;
            newPosX = startPosX + (startW - 320);
          }
        }

        // Vertical sizing
        if (direction.includes('s')) {
          newHeight = Math.min(maxH - startPosY, Math.max(260, startH + dy));
        } else if (direction.includes('n')) {
          const candidateH = startH - dy;
          if (candidateH >= 260) {
            const candidateY = Math.max(0, startPosY + dy);
            newHeight = startH + (startPosY - candidateY);
            newPosY = candidateY;
          } else {
            newHeight = 260;
            newPosY = startPosY + (startH - 260);
          }
        }

        if (newPosX !== win.position.x || newPosY !== win.position.y) {
          updateWindowPosition(win.appId, { x: newPosX, y: newPosY });
        }
        if (newWidth !== win.size.width || newHeight !== win.size.height) {
          updateWindowSize(win.appId, { width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging && snapPreview) {
        snapWindow(win.appId, snapPreview);
        setSnapPreview(null);
      }
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
  }, [isDragging, isResizing, snapPreview, win.appId, win.position.x, win.position.y, win.size.width, win.size.height, updateWindowPosition, updateWindowSize, snapWindow]);

  if (win.isMinimized) return null;

  return (
    <>
      {/* Edge Snap Phantom Guide */}
      {snapPreview && (
        <div
          className={`fixed pointer-events-none z-[9999] border-2 border-dashed border-sky-400 bg-sky-500/20 shadow-2xl transition-all duration-75 ${
            snapPreview === 'top'
              ? 'top-0 left-0 right-0 h-[calc(100vh-34px)]'
              : snapPreview === 'left'
              ? 'top-0 left-0 w-1/2 h-[calc(100vh-34px)]'
              : 'top-0 right-0 w-1/2 h-[calc(100vh-34px)]'
          }`}
        />
      )}

      <div
        role="dialog"
        aria-label={win.title}
        aria-modal={false}
        onMouseDown={() => {
          if (activeWindowId !== win.appId) {
            focusWindow(win.appId);
          }
        }}
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
          onDoubleClick={() => {
            playSound('click');
            maximizeWindow(win.appId);
          }}
          className={`h-7 px-2 flex items-center justify-between cursor-move text-xs font-bold shrink-0 select-none ${
            isActive ? 'retro-titlebar' : 'retro-titlebar-inactive'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate min-w-0 mr-2">
            {/* Authentic 16x16 Title Bar App Icon */}
            <VintageOsIcon appId={win.appId} className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] truncate tracking-wide">{win.title}</span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Minimize */}
            <button
              type="button"
              aria-label={`Minimize ${win.title}`}
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
              aria-label={win.isMaximized ? `Restore ${win.title}` : `Maximize ${win.title}`}
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
              aria-label={`Close ${win.title}`}
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

        {/* Sunken Content Area with Retro Scrollbars */}
        <div className="flex-1 min-h-0 bg-[#ffffff] m-1 retro-box-inset retro-scroll retro-window overflow-y-auto overflow-x-hidden text-[#000000] p-3 sm:p-4 text-xs font-sans leading-normal break-words">
          {children}
        </div>

        {/* 8-Way Resize Handles */}
        {!win.isMaximized && (
          <>
            {/* Edges */}
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'n')}
              className="absolute top-0 left-2 right-2 h-1.5 cursor-ns-resize z-10"
              title="Resize window"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 's')}
              className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize z-10"
              title="Resize window"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'w')}
              className="absolute top-2 bottom-2 left-0 w-1.5 cursor-ew-resize z-10"
              title="Resize window"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'e')}
              className="absolute top-2 bottom-2 right-0 w-1.5 cursor-ew-resize z-10"
              title="Resize window"
            />

            {/* Corners */}
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
              className="absolute top-0 left-0 w-2.5 h-2.5 cursor-nwse-resize z-20"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
              className="absolute top-0 right-0 w-2.5 h-2.5 cursor-nesw-resize z-20"
            />
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
              className="absolute bottom-0 left-0 w-2.5 h-2.5 cursor-nesw-resize z-20"
            />
            {/* South-East grip */}
            <div
              onMouseDown={(e) => handleMouseDownResize(e, 'se')}
              className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 cursor-nwse-resize flex items-end justify-end p-0.5 z-20"
              title="Resize window"
            >
              <div className="w-2 h-2 border-r-2 border-b-2 border-gray-600" />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default React.memo(WindowComponent);

