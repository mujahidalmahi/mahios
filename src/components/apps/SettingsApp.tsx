'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Monitor, Volume2, Palette,
  Clock, Cpu, ShieldCheck, RotateCcw,
  Sparkles, CheckCircle2, Sliders, MousePointer
} from 'lucide-react';
import Link from 'next/link';
import { useSystemStore, CursorStyle, TimeFormat } from '@/stores/systemStore';

const wallpaperPresets = [
  { name: 'Windows 95 Teal', hex: '#008080' },
  { name: 'Classic Navy', hex: '#000080' },
  { name: 'Cyber Charcoal', hex: '#18191c' },
  { name: 'Vintage Grey', hex: '#808080' },
  { name: 'Matrix Dark', hex: '#0a140a' },
  { name: 'Neon Purple', hex: '#2d1b4e' },
  { name: 'Retro Wine', hex: '#4a0e17' },
  { name: 'Forest Moss', hex: '#13391b' },
];

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState<'display' | 'audio' | 'time' | 'system' | 'admin'>('display');
  const [uptimeStr, setUptimeStr] = useState('0s');

  const {
    crtMonitorFrame, toggleCrtMonitorFrame, setCrtMonitorFrame,
    crtScanlines, toggleScanlines,
    crtCurvature, toggleCurvature,
    crtFlicker, toggleFlicker,
    soundEnabled, toggleSound,
    volume, setVolume,
    desktopBgColor, setDesktopBgColor,
    wallpaperPattern, setWallpaperPattern,
    cursorStyle, setCursorStyle,
    timeFormat, setTimeFormat,
    showSeconds, setShowSeconds,
    osStartTime, resetToDefaults,
    playSound
  } = useSystemStore();

  useEffect(() => {
    const updateUptime = () => {
      const elapsedSec = Math.floor((Date.now() - osStartTime) / 1000);
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      setUptimeStr(`${mins}m ${secs}s`);
    };
    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    return () => clearInterval(interval);
  }, [osStartTime]);

  return (
    <div className="flex flex-col h-full text-[#111827] select-none text-xs space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Control Panel
            </h2>
            <p className="text-[10px] text-gray-500 font-mono">Real-Time System Customization & Hardware Profiles</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound('success');
            resetToDefaults();
          }}
          className="retro-btn px-2 py-1 text-[11px] font-bold text-red-700 flex items-center gap-1 cursor-pointer"
          title="Reset all settings to factory default"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 90s Property Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-300 pb-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('display'); }}
          className={`px-3 py-1 font-bold text-xs rounded-t-xs cursor-pointer ${
            activeTab === 'display'
              ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]'
              : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            <span>Display & CRT</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('audio'); }}
          className={`px-3 py-1 font-bold text-xs rounded-t-xs cursor-pointer ${
            activeTab === 'audio'
              ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]'
              : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Sound Card</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('time'); }}
          className={`px-3 py-1 font-bold text-xs rounded-t-xs cursor-pointer ${
            activeTab === 'time'
              ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]'
              : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Date & Time</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('system'); }}
          className={`px-3 py-1 font-bold text-xs rounded-t-xs cursor-pointer ${
            activeTab === 'system'
              ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]'
              : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>System Telemetry</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('admin'); }}
          className={`px-3 py-1 font-bold text-xs rounded-t-xs cursor-pointer ${
            activeTab === 'admin'
              ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]'
              : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administration</span>
          </span>
        </button>
      </div>

      {/* Tab Body Contents */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-[#f9fafb] retro-box-inset space-y-4">
        {/* TAB 1: DISPLAY & APPEARANCE */}
        {activeTab === 'display' && (
          <div className="space-y-4">
            {/* Display Mode Selection */}
            <div className="p-3 bg-white retro-box-inset space-y-2">
              <h3 className="font-bold text-xs text-[#000080] uppercase flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-700" />
                <span>Primary Screen Enclosure Mode</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label
                  onClick={() => { playSound('click'); setCrtMonitorFrame(false); }}
                  className={`p-2.5 flex items-start gap-2.5 border cursor-pointer ${
                    !crtMonitorFrame ? 'border-[#000080] bg-blue-50/60 font-bold' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    checked={!crtMonitorFrame}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs text-gray-900">Native Full-Screen Web OS (Default)</div>
                    <div className="text-[10px] text-gray-500 font-normal">Sleek, edge-to-edge desktop experience optimized for high-res monitors.</div>
                  </div>
                </label>

                <label
                  onClick={() => { playSound('click'); setCrtMonitorFrame(true); }}
                  className={`p-2.5 flex items-start gap-2.5 border cursor-pointer ${
                    crtMonitorFrame ? 'border-[#000080] bg-blue-50/60 font-bold' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    checked={crtMonitorFrame}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs text-gray-900">Vintage 90s CRT Monitor Housing</div>
                    <div className="text-[10px] text-gray-500 font-normal">Authentic physical beige plastic monitor casing with degauss buttons & green LED.</div>
                  </div>
                </label>
              </div>
            </div>

            {/* CRT Tube Visual Effects */}
            <div className="p-3 bg-white retro-box-inset space-y-2">
              <h3 className="font-bold text-xs text-[#000080] uppercase">Cathode Ray Tube Optical Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <label className="flex items-center justify-between p-2 bg-[#f3f4f6] border border-gray-300 rounded-2xs cursor-pointer">
                  <span>Horizontal Scanlines</span>
                  <input
                    type="checkbox"
                    checked={crtScanlines}
                    onChange={() => { playSound('click'); toggleScanlines(); }}
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-[#f3f4f6] border border-gray-300 rounded-2xs cursor-pointer">
                  <span>3D Curved Glass Distortion</span>
                  <input
                    type="checkbox"
                    checked={crtCurvature}
                    onChange={() => { playSound('click'); toggleCurvature(); }}
                  />
                </label>

                <label className="flex items-center justify-between p-2 bg-[#f3f4f6] border border-gray-300 rounded-2xs cursor-pointer">
                  <span>Cathode Power Flicker</span>
                  <input
                    type="checkbox"
                    checked={crtFlicker}
                    onChange={() => { playSound('click'); toggleFlicker(); }}
                  />
                </label>
              </div>
            </div>

            {/* Wallpaper Color Palette */}
            <div className="p-3 bg-white retro-box-inset space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#000080] uppercase flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-700" />
                  <span>Desktop Background Color</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono">Custom Color:</span>
                  <input
                    type="color"
                    value={desktopBgColor}
                    onChange={(e) => setDesktopBgColor(e.target.value)}
                    className="w-6 h-6 border border-gray-400 p-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {wallpaperPresets.map((p) => (
                  <button
                    key={p.hex}
                    type="button"
                    onClick={() => { playSound('click'); setDesktopBgColor(p.hex); }}
                    className={`retro-btn px-2 py-1.5 flex items-center gap-2 text-xs text-left cursor-pointer ${
                      desktopBgColor.toLowerCase() === p.hex.toLowerCase() ? 'retro-btn-pressed font-bold' : ''
                    }`}
                  >
                    <span className="w-4 h-4 border border-black shrink-0 rounded-2xs shadow-2xs" style={{ backgroundColor: p.hex }} />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallpaper Pattern */}
            <div className="p-3 bg-white retro-box-inset space-y-2">
              <h3 className="font-bold text-xs text-[#000080] uppercase">Wallpaper Pattern Texture</h3>
              <div className="flex gap-2 pt-1">
                {(['none', 'dither', 'grid'] as const).map((pat) => (
                  <button
                    key={pat}
                    type="button"
                    onClick={() => { playSound('click'); setWallpaperPattern(pat); }}
                    className={`retro-btn px-3 py-1 capitalize cursor-pointer ${
                      wallpaperPattern === pat ? 'retro-btn-pressed font-bold' : ''
                    }`}
                  >
                    {pat === 'none' ? 'Solid Color' : pat === 'dither' ? '90s Dither Mesh' : 'Matrix Grid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cursor Style */}
            <div className="p-3 bg-white retro-box-inset space-y-2">
              <h3 className="font-bold text-xs text-[#000080] uppercase flex items-center gap-1.5">
                <MousePointer className="w-4 h-4 text-blue-700" />
                <span>Mouse Pointer Scheme</span>
              </h3>
              <div className="flex gap-2 pt-1">
                {(['default', 'crosshair'] as const).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => { playSound('click'); setCursorStyle(cur); }}
                    className={`retro-btn px-3 py-1 capitalize cursor-pointer ${
                      cursorStyle === cur ? 'retro-btn-pressed font-bold' : ''
                    }`}
                  >
                    {cur === 'default' ? 'Classic Pointer' : 'Precision Crosshair (+)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOUND & SYNTHESIS */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="p-3 bg-white retro-box-inset space-y-3">
              <h3 className="font-bold text-xs text-[#000080] uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-700" />
                <span>8-Bit Sound Synthesizer & Audio Engine</span>
              </h3>

              <label className="flex items-center justify-between p-2.5 bg-[#f3f4f6] border border-gray-300 rounded-2xs cursor-pointer">
                <div>
                  <div className="font-bold text-gray-900">Master Sound FX</div>
                  <div className="text-[10px] text-gray-500">Synthesizes Web Audio oscillators for clicks, window chimes, and boots.</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={() => { toggleSound(); playSound('click'); }}
                />
              </label>

              {/* Master Volume Slider */}
              <div className="p-2.5 bg-[#f3f4f6] border border-gray-300 rounded-2xs space-y-1.5">
                <div className="flex justify-between font-semibold text-xs">
                  <span>Output Volume Gain:</span>
                  <span className="font-mono text-blue-800">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  disabled={!soundEnabled}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                  }}
                  className="w-full cursor-pointer accent-[#000080]"
                />
              </div>
            </div>

            {/* Live Audio Test Bench */}
            <div className="p-3 bg-white retro-box-inset space-y-2">
              <h3 className="font-bold text-xs text-[#000080] uppercase">Sound Synthesis Test Bench</h3>
              <p className="text-[11px] text-gray-600">Click any sound event below to test real-time Web Audio API waveform generation:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => playSound('click')}
                  className="retro-btn p-2 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold">Square Beep</span>
                  <span className="text-[10px] text-gray-500">Mouse Click</span>
                </button>

                <button
                  type="button"
                  onClick={() => playSound('open')}
                  className="retro-btn p-2 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold">Rising Chord</span>
                  <span className="text-[10px] text-gray-500">Window Open</span>
                </button>

                <button
                  type="button"
                  onClick={() => playSound('boot')}
                  className="retro-btn p-2 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold">Sine Chime</span>
                  <span className="text-[10px] text-gray-500">BIOS Startup</span>
                </button>

                <button
                  type="button"
                  onClick={() => playSound('success')}
                  className="retro-btn p-2 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <span className="font-bold">Fanfare (Tada!)</span>
                  <span className="text-[10px] text-gray-500">Achievement</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATE & TIME */}
        {activeTab === 'time' && (
          <div className="space-y-4">
            <div className="p-3 bg-white retro-box-inset space-y-3">
              <h3 className="font-bold text-xs text-[#000080] uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>Clock & Taskbar Tray Time Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 12h vs 24h */}
                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300 rounded-2xs space-y-2">
                  <span className="font-bold text-gray-800">Time Notation Format:</span>
                  <div className="flex gap-2">
                    {(['12h', '24h'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => { playSound('click'); setTimeFormat(fmt); }}
                        className={`retro-btn px-3 py-1 cursor-pointer ${
                          timeFormat === fmt ? 'retro-btn-pressed font-bold' : ''
                        }`}
                      >
                        {fmt === '12h' ? '12-Hour (AM/PM)' : '24-Hour (Military)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Seconds */}
                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300 rounded-2xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-800">Show Live Seconds</div>
                    <div className="text-[10px] text-gray-500">Display precision seconds in system tray.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showSeconds}
                    onChange={() => { playSound('click'); setShowSeconds(!showSeconds); }}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM TELEMETRY */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div className="p-3 bg-white retro-box-inset space-y-3">
              <h3 className="font-bold text-xs text-[#000080] uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-700" />
                <span>Hardware Architecture & Kernel Telemetry</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300">
                  <div className="text-[10px] text-gray-500 uppercase">OS Build</div>
                  <div className="font-bold text-[#000080]">MahiOS v2.0.26</div>
                </div>

                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300">
                  <div className="text-[10px] text-gray-500 uppercase">Registered To</div>
                  <div className="font-bold text-[#000080]">Mujahid Islam Mahi</div>
                </div>

                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300">
                  <div className="text-[10px] text-gray-500 uppercase">Active Session Uptime</div>
                  <div className="font-bold text-emerald-700">{uptimeStr}</div>
                </div>

                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300">
                  <div className="text-[10px] text-gray-500 uppercase">CPU Model</div>
                  <div className="font-bold text-gray-800">Quantum RISC-V 8C</div>
                </div>

                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300">
                  <div className="text-[10px] text-gray-500 uppercase">Allocated Memory</div>
                  <div className="font-bold text-gray-800">65,536 KB RAM</div>
                </div>

                <div className="p-2.5 bg-[#f3f4f6] border border-gray-300">
                  <div className="text-[10px] text-gray-500 uppercase">Database Driver</div>
                  <div className="font-bold text-emerald-700">Supabase PG OK</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMINISTRATION */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="p-4 bg-white retro-box-inset space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 retro-box-outset bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#000080]">Master Content Management Control Center</h3>
                  <p className="text-[11px] text-gray-600">Full CRUD editing authority over all biography sections, projects, experiences, and SEO tags.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin"
                  target="_blank"
                  className="retro-btn px-4 py-2 font-bold text-xs text-[#000080] inline-flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Master Admin Dashboard &gt;</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel Bottom Status Bar */}
      <div className="p-2 bg-[#dfdfdf] retro-box-outset flex items-center justify-between text-[11px] text-gray-700 shrink-0">
        <span className="font-mono">STATE: PERSISTED IN MEMORY</span>
        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Real-time Sync Active</span>
        </div>
      </div>
    </div>
  );
}
