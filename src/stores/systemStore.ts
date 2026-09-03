import { create } from 'zustand';

export type ThemeScheme = 'classic-blue' | 'vintage-silver' | 'matrix-green' | 'amiga-orange' | 'midnight-dark';
export type CursorStyle = 'default' | 'retro-pointer' | 'crosshair';
export type TimeFormat = '12h' | '24h';

interface SystemStore {
  // Display & CRT
  crtMonitorFrame: boolean;
  crtScanlines: boolean;
  crtCurvature: boolean;
  crtFlicker: boolean;
  desktopBgColor: string;
  wallpaperPattern: 'none' | 'dither' | 'grid';
  themeScheme: ThemeScheme;
  cursorStyle: CursorStyle;
  
  // Audio
  soundEnabled: boolean;
  volume: number;

  // Date & Time
  timeFormat: TimeFormat;
  showSeconds: boolean;

  // Selection & UI
  selectedIconId: string | null;
  osStartTime: number;
  activeAppProperties: import('@/types/database').DesktopApp | null;
  desktopSortBy: 'name' | 'category' | 'order';
  desktopIconSize: 'normal' | 'large' | 'small';

  // Actions
  toggleCrtMonitorFrame: () => void;
  setCrtMonitorFrame: (val: boolean) => void;
  toggleScanlines: () => void;
  setScanlines: (val: boolean) => void;
  toggleCurvature: () => void;
  setCurvature: (val: boolean) => void;
  toggleFlicker: () => void;
  setFlicker: (val: boolean) => void;
  setDesktopBgColor: (color: string) => void;
  setWallpaperPattern: (pattern: 'none' | 'dither' | 'grid') => void;
  setThemeScheme: (scheme: ThemeScheme) => void;
  setCursorStyle: (cursor: CursorStyle) => void;

  toggleSound: () => void;
  setSoundEnabled: (val: boolean) => void;
  setVolume: (volume: number) => void;

  setTimeFormat: (format: TimeFormat) => void;
  setShowSeconds: (val: boolean) => void;
  setSelectedIconId: (id: string | null) => void;
  setActiveAppProperties: (app: import('@/types/database').DesktopApp | null) => void;
  setDesktopSortBy: (sort: 'name' | 'category' | 'order') => void;
  setDesktopIconSize: (size: 'normal' | 'large' | 'small') => void;

  resetToDefaults: () => void;
  playSound: (soundType: 'click' | 'open' | 'close' | 'boot' | 'error' | 'success') => void;
}

export const useSystemStore = create<SystemStore>((set, get) => {
  return {
    // CRT & Display: Default is clean fullscreen OS without CRT enclosure
    crtMonitorFrame: false,
    crtScanlines: false,
    crtCurvature: false,
    crtFlicker: false,
    desktopBgColor: '#008080', // Classic Windows 95 teal
    wallpaperPattern: 'none',
    themeScheme: 'classic-blue',
    cursorStyle: 'default',

    // Audio
    soundEnabled: true,
    volume: 0.6,

    // Time
    timeFormat: '12h',
    showSeconds: false,

    // Selection & Telemetry
    selectedIconId: null,
    osStartTime: Date.now(),
    activeAppProperties: null,
    desktopSortBy: 'order',
    desktopIconSize: 'normal',

    // Actions
    toggleCrtMonitorFrame: () => set((s) => ({ crtMonitorFrame: !s.crtMonitorFrame })),
    setCrtMonitorFrame: (crtMonitorFrame) => set({ crtMonitorFrame }),
    toggleScanlines: () => set((s) => ({ crtScanlines: !s.crtScanlines })),
    setScanlines: (crtScanlines) => set({ crtScanlines }),
    toggleCurvature: () => set((s) => ({ crtCurvature: !s.crtCurvature })),
    setCurvature: (crtCurvature) => set({ crtCurvature }),
    toggleFlicker: () => set((s) => ({ crtFlicker: !s.crtFlicker })),
    setFlicker: (crtFlicker) => set({ crtFlicker }),
    setDesktopBgColor: (desktopBgColor) => set({ desktopBgColor }),
    setWallpaperPattern: (wallpaperPattern) => set({ wallpaperPattern }),
    setThemeScheme: (themeScheme) => set({ themeScheme }),
    setCursorStyle: (cursorStyle) => set({ cursorStyle }),

    toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    setVolume: (volume) => set({ volume }),

    setTimeFormat: (timeFormat) => set({ timeFormat }),
    setShowSeconds: (showSeconds) => set({ showSeconds }),
    setSelectedIconId: (selectedIconId) => set({ selectedIconId }),
    setActiveAppProperties: (activeAppProperties) => set({ activeAppProperties }),
    setDesktopSortBy: (desktopSortBy) => set({ desktopSortBy }),
    setDesktopIconSize: (desktopIconSize) => set({ desktopIconSize }),

    resetToDefaults: () => set({
      crtMonitorFrame: false,
      crtScanlines: false,
      crtCurvature: false,
      crtFlicker: false,
      desktopBgColor: '#008080',
      wallpaperPattern: 'none',
      themeScheme: 'classic-blue',
      cursorStyle: 'default',
      soundEnabled: true,
      volume: 0.6,
      timeFormat: '12h',
      showSeconds: false,
      selectedIconId: null,
    }),

    playSound: (soundType) => {
      const { soundEnabled, volume } = get();
      if (!soundEnabled || typeof window === 'undefined') return;

      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        const masterVol = Math.max(0, Math.min(1, volume));

        if (soundType === 'click') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
          gain.gain.setValueAtTime(0.06 * masterVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
        } else if (soundType === 'open') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
          gain.gain.setValueAtTime(0.08 * masterVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (soundType === 'close') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(540, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
          gain.gain.setValueAtTime(0.08 * masterVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (soundType === 'boot') {
          const notes = [261.63, 329.63, 392.00, 523.25];
          notes.forEach((freq, idx) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(freq, now + idx * 0.08);
            g.gain.setValueAtTime(0.08 * masterVol, now + idx * 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start(now + idx * 0.08);
            o.stop(now + 0.6);
          });
        } else if (soundType === 'error') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.setValueAtTime(110, now + 0.08);
          gain.gain.setValueAtTime(0.12 * masterVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (soundType === 'success') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.06);
          osc.frequency.setValueAtTime(783.99, now + 0.12);
          gain.gain.setValueAtTime(0.08 * masterVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      } catch {
        // Ignored if browser audio policy blocks before user interaction
      }
    },
  };
});
