import { create } from 'zustand';
import { WindowState } from '@/types/os';
import { DesktopApp } from '@/types/database';

interface WindowStore {
  windows: WindowState[];
  activeWindowId: string | null;
  highestZIndex: number;
  openWindow: (app: DesktopApp) => void;
  closeWindow: (appId: string) => void;
  minimizeWindow: (appId: string) => void;
  maximizeWindow: (appId: string) => void;
  focusWindow: (appId: string) => void;
  updateWindowPosition: (appId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (appId: string, size: { width: number; height: number }) => void;
  closeAllWindows: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  highestZIndex: 10,

  openWindow: (app: DesktopApp) => {
    const { windows, highestZIndex } = get();
    const existing = windows.find((w) => w.appId === app.app_id);

    if (existing) {
      // If already open, restore if minimized and bring to front
      const newZ = highestZIndex + 1;
      set({
        windows: windows.map((w) =>
          w.appId === app.app_id ? { ...w, isMinimized: false, zIndex: newZ } : w
        ),
        activeWindowId: app.app_id,
        highestZIndex: newZ,
      });
      return;
    }

    const newZ = highestZIndex + 1;
    const count = windows.length;
    // Slight cascade offset so multiple overlapping windows remain visible
    const cascadeOffset = (count % 5) * 20;

    // Viewport responsive sizing
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    const desiredWidth = app.default_width || 780;
    const desiredHeight = app.default_height || 540;

    // Constrain width and height to fit screen gracefully
    const computedWidth = Math.min(desiredWidth, Math.max(320, vw - 40));
    const computedHeight = Math.min(desiredHeight, Math.max(280, vh - 100));

    // Centered spawn coordinates
    const centeredX = Math.max(10, Math.round((vw - computedWidth) / 2) + cascadeOffset);
    const centeredY = Math.max(10, Math.round((vh - 34 - computedHeight) / 2) + cascadeOffset);

    // Final safety clamps within visible area
    const clampedX = Math.max(10, Math.min(vw - computedWidth - 10, centeredX));
    const clampedY = Math.max(10, Math.min(vh - computedHeight - 44, centeredY));

    const newWindow: WindowState = {
      id: `win-${app.app_id}-${Date.now()}`,
      appId: app.app_id,
      title: app.title,
      iconName: app.icon_name,
      componentKey: app.component_key,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZ,
      position: {
        x: clampedX,
        y: clampedY,
      },
      size: {
        width: computedWidth,
        height: computedHeight,
      },
    };

    set({
      windows: [...windows, newWindow],
      activeWindowId: app.app_id,
      highestZIndex: newZ,
    });
  },

  closeWindow: (appId: string) => {
    const { windows, activeWindowId } = get();
    const updated = windows.filter((w) => w.appId !== appId);
    let nextActive = activeWindowId === appId ? null : activeWindowId;

    if (nextActive === null && updated.length > 0) {
      // Find highest z-index remaining window
      const topWin = [...updated].sort((a, b) => b.zIndex - a.zIndex)[0];
      if (topWin) nextActive = topWin.appId;
    }

    set({
      windows: updated,
      activeWindowId: nextActive,
    });
  },

  minimizeWindow: (appId: string) => {
    const { windows, activeWindowId } = get();
    const updated = windows.map((w) =>
      w.appId === appId ? { ...w, isMinimized: true } : w
    );

    let nextActive = activeWindowId === appId ? null : activeWindowId;
    if (nextActive === null) {
      const visible = updated.filter((w) => !w.isMinimized);
      if (visible.length > 0) {
        const topWin = [...visible].sort((a, b) => b.zIndex - a.zIndex)[0];
        if (topWin) nextActive = topWin.appId;
      }
    }

    set({
      windows: updated,
      activeWindowId: nextActive,
    });
  },

  maximizeWindow: (appId: string) => {
    const { windows, highestZIndex } = get();
    const newZ = highestZIndex + 1;

    set({
      windows: windows.map((w) => {
        if (w.appId !== appId) return w;
        if (w.isMaximized) {
          // Restore
          return {
            ...w,
            isMaximized: false,
            position: w.prevPosition || w.position,
            size: w.prevSize || w.size,
            zIndex: newZ,
          };
        } else {
          // Maximize
          return {
            ...w,
            isMaximized: true,
            prevPosition: { ...w.position },
            prevSize: { ...w.size },
            zIndex: newZ,
          };
        }
      }),
      activeWindowId: appId,
      highestZIndex: newZ,
    });
  },

  focusWindow: (appId: string) => {
    const { windows, highestZIndex, activeWindowId } = get();
    if (activeWindowId === appId) return;

    const newZ = highestZIndex + 1;
    set({
      windows: windows.map((w) =>
        w.appId === appId ? { ...w, isMinimized: false, zIndex: newZ } : w
      ),
      activeWindowId: appId,
      highestZIndex: newZ,
    });
  },

  updateWindowPosition: (appId: string, position: { x: number; y: number }) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.appId === appId ? { ...w, position } : w
      ),
    }));
  },

  updateWindowSize: (appId: string, size: { width: number; height: number }) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.appId === appId ? { ...w, size } : w
      ),
    }));
  },

  closeAllWindows: () => {
    set({ windows: [], activeWindowId: null });
  },
}));
