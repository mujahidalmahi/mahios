import { create } from 'zustand';

interface BootStore {
  isBooting: boolean;
  isBootComplete: boolean;
  currentLogIndex: number;
  progressPercent: number;
  matrixRainActive: boolean;
  hasVisitedBefore: boolean;
  startBoot: () => void;
  finishBoot: () => void;
  skipBoot: () => void;
  setProgress: (percent: number) => void;
  toggleMatrixRain: (active?: boolean) => void;
}

export const useBootStore = create<BootStore>((set) => ({
  isBooting: true,
  isBootComplete: false,
  currentLogIndex: 0,
  progressPercent: 0,
  matrixRainActive: true,
  hasVisitedBefore: false,

  startBoot: () => {
    set({ isBooting: true, isBootComplete: false, currentLogIndex: 0, progressPercent: 0 });
  },

  finishBoot: () => {
    set({ isBooting: false, isBootComplete: true, progressPercent: 100 });
  },

  skipBoot: () => {
    set({ isBooting: false, isBootComplete: true, progressPercent: 100 });
  },

  setProgress: (progressPercent: number) => {
    set({ progressPercent });
  },

  toggleMatrixRain: (active?: boolean) => {
    set((state) => ({ matrixRainActive: active !== undefined ? active : !state.matrixRainActive }));
  },
}));
