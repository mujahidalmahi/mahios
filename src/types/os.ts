import { DesktopApp } from './database';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  iconName: string;
  componentKey: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
}

export type ViewportMode = 'crt-desktop' | 'tablet' | 'mobile';

export interface SystemTimeState {
  hours: string;
  minutes: string;
  seconds: string;
  period: string;
  dateString: string;
}

export interface BootSequenceState {
  isBooting: boolean;
  isBootComplete: boolean;
  currentLogIndex: number;
  terminalLogs: string[];
  progressPercent: number;
  matrixRainActive: boolean;
}
