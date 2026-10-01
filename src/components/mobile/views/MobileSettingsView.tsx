'use client';

import React from 'react';
import { Settings, Volume2, VolumeX, Clock, Smartphone, Info, Shield, Check } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function MobileSettingsView() {
  const {
    soundEnabled,
    toggleSound,
    timeFormat,
    setTimeFormat,
    desktopBgColor,
  } = useSystemStore();

  return (
    <div className="space-y-4 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Pocket OS Preferences & Control Center
      </div>

      {/* Audio Mode */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Sound Effects</h4>
              <p className="text-[10px] text-slate-500">Audio feedback & DTMF tones</p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.75 ${
                soundEnabled ? 'left-6.25' : 'left-0.75'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Time Format */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Time Format</h4>
              <p className="text-[10px] text-slate-500">System clock display mode</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setTimeFormat('12h')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                timeFormat === '12h' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              12H
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat('24h')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                timeFormat === '24h' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              24H
            </button>
          </div>
        </div>
      </div>

      {/* OS About Details */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">MahiOS Pocket Edition</h4>
            <p className="text-[10px] text-slate-500 font-mono">Version 2.0.0 (Mobile & Tablet)</p>
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100 space-y-1">
          <p>
            Designed and engineered exclusively for touchscreens, handheld devices, and tablets by Mujahid Al Mahi.
          </p>
          <div className="text-[10px] font-mono text-slate-400 pt-1">
            Engineered with Next.js 16, React 19, Supabase, Tailwind CSS v4.
          </div>
        </div>
      </div>
    </div>
  );
}
