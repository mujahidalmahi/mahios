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
  cascadeWindows: () => void;
  tileHorizontally: () => void;
  tileVertically: () => void;
  minimizeAllWindows: () => void;
  restoreAllWindows: () => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  highestZIndex: 100,

  openWindow: (app: DesktopApp) => {
    const { windows, highestZIndex } = get();
    const existing = windows.find((w) => w.appId === app.app_id);
    const currentMaxZ = Math.max(highestZIndex, ...windows.map((w) => w.zIndex || 0), 100);
    const newZ = currentMaxZ + 1;

    if (existing) {
      // If already open, restore if minimized and bring to top
      set({
        windows: windows.map((w) =>
          w.appId === app.app_id ? { ...w, isMinimized: false, zIndex: newZ } : w
        ),
        activeWindowId: app.app_id,
        highestZIndex: newZ,
      });
      return;
    }
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
      // Find highest z-index remaining visible window
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
    const currentMaxZ = Math.max(highestZIndex, ...windows.map((w) => w.zIndex || 0), 100);
    const newZ = currentMaxZ + 1;

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
    const { windows, highestZIndex } = get();
    const currentMaxZ = Math.max(highestZIndex, ...windows.map((w) => w.zIndex || 0), 100);
    const newZ = currentMaxZ + 1;
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

  cascadeWindows: () => {
    const { windows, highestZIndex } = get();
    const visible = windows.filter((w) => !w.isMinimized);
    if (visible.length === 0) return;

    let currentZ = highestZIndex;
    const cascaded = windows.map((w) => {
      const idx = visible.findIndex((v) => v.id === w.id);
      if (idx !== -1) {
        currentZ += 1;
        return {
          ...w,
          isMaximized: false,
          isMinimized: false,
          zIndex: currentZ,
          position: {
            x: 40 + (idx * 28),
            y: 40 + (idx * 28),
          },
          size: {
            width: Math.min(w.size.width, 740),
            height: Math.min(w.size.height, 520),
          },
        };
      }
      return w;
    });

    set({
      windows: cascaded,
      highestZIndex: currentZ,
      activeWindowId: visible[visible.length - 1]?.appId || null,
    });
  },

  tileHorizontally: () => {
    const { windows } = get();
    const visible = windows.filter((w) => !w.isMinimized);
    if (visible.length === 0) return;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight - 36 : 764;
    const rowHeight = Math.floor(vh / visible.length);

    const tiled = windows.map((w) => {
      const idx = visible.findIndex((v) => v.id === w.id);
      if (idx !== -1) {
        return {
          ...w,
          isMaximized: false,
          isMinimized: false,
          position: { x: 10, y: 10 + (idx * rowHeight) },
          size: { width: Math.max(320, vw - 20), height: Math.max(200, rowHeight - 12) },
        };
      }
      return w;
    });

    set({ windows: tiled });
  },

  tileVertically: () => {
    const { windows } = get();
    const visible = windows.filter((w) => !w.isMinimized);
    if (visible.length === 0) return;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight - 36 : 764;
    const colWidth = Math.floor(vw / visible.length);

    const tiled = windows.map((w) => {
      const idx = visible.findIndex((v) => v.id === w.id);
      if (idx !== -1) {
        return {
          ...w,
          isMaximized: false,
          isMinimized: false,
          position: { x: 10 + (idx * colWidth), y: 10 },
          size: { width: Math.max(280, colWidth - 14), height: Math.max(280, vh - 20) },
        };
      }
      return w;
    });

    set({ windows: tiled });
  },

  minimizeAllWindows: () => {
    const { windows } = get();
    set({
      windows: windows.map((w) => ({ ...w, isMinimized: true })),
      activeWindowId: null,
    });
  },

  restoreAllWindows: () => {
    const { windows } = get();
    set({
      windows: windows.map((w) => ({ ...w, isMinimized: false })),
    });
  },
}));
