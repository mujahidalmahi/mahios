'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette, Save, CheckCircle2, AlertCircle, Monitor, Sparkles,
  Volume2, VolumeX, Eye, Sliders, RefreshCw, Loader2
} from 'lucide-react';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SiteSettings } from '@/types/database';

const presetWallpapers = [
  { name: 'Windows 95 Teal', hex: '#008080' },
  { name: 'Classic Navy', hex: '#000080' },
  { name: 'Vintage Slate', hex: '#4a5568' },
  { name: 'Cyber Charcoal', hex: '#111827' },
  { name: 'CRT Matrix Green', hex: '#022c15' },
  { name: 'Retro Amber Glow', hex: '#2d1500' },
  { name: 'Synthwave Purple', hex: '#2b1055' },
  { name: 'Pure Midnight', hex: '#030712' },
];

const presetAccents = [
  { name: 'Win95 Royal Blue', hex: '#000080' },
  { name: 'Electric Cyan', hex: '#00ffff' },
  { name: 'Terminal Green', hex: '#00ff66' },
  { name: 'Cyberpunk Yellow', hex: '#facc15' },
  { name: 'Neon Coral', hex: '#f43f5e' },
  { name: 'Deep Amethyst', hex: '#7c3aed' },
];

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [original, setOriginal] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isDirty = useMemo(() => {
    const normalize = (s: SiteSettings) => {
      const copy: Record<string, any> = { ...s };
      delete copy.updated_at;
      return copy;
    };
    return JSON.stringify(normalize(settings)) !== JSON.stringify(normalize(original));
  }, [settings, original]);

  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setSettings(data);
          setOriginal(data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = { ...settings, updated_at: new Date().toISOString() };

    try {
      const res = await adminMutate<SiteSettings>({
        table: 'site_settings',
        action: 'upsert',
        data: updated,
      });
      if (!res.success) throw new Error(res.error);
      const raw = res.data;
      const saved = ((Array.isArray(raw) ? raw[0] : raw) as SiteSettings) || updated;
      setSettings(saved);
      setOriginal(saved);
      setFeedback({ type: 'success', text: 'Theme & CRT effects updated successfully across MahiOS!' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Failed to save: ${err instanceof Error ? err.message : 'Database error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleResetToWin95 = () => {
    setSettings({
      ...settings,
      desktop_background_color: '#008080',
      theme_accent_color: '#000080',
      crt_scanlines_enabled: false,
      crt_curvature_enabled: false,
      matrix_rain_enabled: false,
      sound_effects_enabled: true,
    });
  };

  if (loading) return <SkeletonFormPage />;

  const bgColor = settings.desktop_background_color || '#008080';
  const accentColor = settings.theme_accent_color || '#000080';

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <span>Theme & CRT Monitor Effects</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure retro desktop aesthetics, window titlebar styling, cathode-ray tube shaders, and 8-bit audio
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={handleResetToWin95}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Default Win95</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Theme'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Live Desktop Interactive Simulator Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Live CRT Desktop Preview</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>Bg: <strong className="text-slate-200">{bgColor}</strong></span>
            <span>•</span>
            <span>Accent: <strong className="text-slate-200">{accentColor}</strong></span>
          </div>
        </div>

        {/* Outer Monitor Bezel */}
        <div className="bg-[#2a2d32] p-4 rounded-xl border-4 border-[#1e2023] shadow-inner relative max-w-2xl mx-auto">
          {/* CRT Screen Display */}
          <div
            className={`relative rounded-lg overflow-hidden h-64 transition-all duration-300 flex flex-col justify-between border-2 border-black/40 ${
              settings.crt_curvature_enabled ? 'rounded-2xl shadow-inner scale-[0.98]' : ''
            }`}
            style={{ backgroundColor: bgColor }}
          >
            {/* Scanlines Overlay Simulation */}
            {settings.crt_scanlines_enabled && (
              <div
                className="absolute inset-0 pointer-events-none z-10 opacity-30"
                style={{
                  background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.7) 50%)',
                  backgroundSize: '100% 4px',
                }}
              />
            )}

            {/* Matrix Rain Simulation */}
            {settings.matrix_rain_enabled && (
              <div className="absolute inset-0 pointer-events-none z-5 opacity-20 font-mono text-[9px] text-emerald-400 overflow-hidden leading-none p-2 select-none">
                01011001 01101111 01110101 01110010 00100000 01010011 01111001 01110011 01110100 01100101 01101101<br />
                M A H I O S _ Q U A N T U M _ K E R N E L _ A C T I V E<br />
                01000011 01010010 01010100 00100000 01010011 01001000 01000001 01000100 01000101 01010010<br />
                11010010 10101100 01010101 11100101 00010101 10101010 01010101 11010010 10101100 01010101
              </div>
            )}

            {/* Desktop Icons */}
            <div className="p-3 grid grid-cols-4 gap-3 w-48 relative z-10">
              {['My Computer', 'Projects', 'Terminal', 'Mail'].map((name, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer">
                  <div className="w-8 h-8 rounded bg-slate-900/60 border border-white/20 flex items-center justify-center text-[10px] text-white shadow">
                    📁
                  </div>
                  <span className="text-[9px] font-mono text-white bg-black/40 px-1 rounded truncate max-w-full">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            {/* Sample Active Window */}
            <div className="absolute top-8 left-16 right-8 bottom-12 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-[#404040] shadow-2xl flex flex-col z-20">
              {/* Window Title Bar */}
              <div
                className="px-2 py-1 flex items-center justify-between text-white font-mono text-[10px] font-bold select-none"
                style={{ backgroundColor: accentColor }}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>💻</span>
                  <span>MahiOS Window Manager — Sample Preview</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-3.5 h-3.5 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#404040] text-black text-[8px] flex items-center justify-center leading-none">
                    _
                  </div>
                  <div className="w-3.5 h-3.5 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#404040] text-black text-[8px] flex items-center justify-center leading-none">
                    □
                  </div>
                  <div className="w-3.5 h-3.5 bg-[#c0c0c0] border-t border-l border-white border-r border-b border-[#404040] text-black text-[8px] flex items-center justify-center leading-none font-bold">
                    ×
                  </div>
                </div>
              </div>

              {/* Window Content */}
              <div className="p-3 flex-1 bg-white text-slate-800 text-[11px] font-sans overflow-hidden space-y-1">
                <p className="font-bold">Retro Operating System Customizer</p>
                <p className="text-[10px] text-slate-600">
                  Changes made here instantaneously customize your public MahiOS desktop experience.
                </p>
              </div>
            </div>

            {/* Win95 Taskbar */}
            <div className="h-7 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-2 z-20 select-none">
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-[#404040] font-bold text-[10px] text-black flex items-center gap-1">
                  <span>🪟</span>
                  <span>Start</span>
                </div>
                <div
                  className="px-2 py-0.5 border text-[10px] font-semibold text-white flex items-center gap-1"
                  style={{ backgroundColor: accentColor, borderColor: '#404040' }}
                >
                  Sample Preview
                </div>
              </div>

              <div className="px-2 py-0.5 bg-[#c0c0c0] border-t border-l border-[#808080] border-r border-b border-white text-[9px] font-mono text-black">
                {settings.sound_effects_enabled ? '🔊' : '🔇'} 04:20 PM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Desktop & Titlebar Palettes</span>
          </h3>

          {/* Wallpaper Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Desktop Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setSettings({ ...settings, desktop_background_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-slate-700 bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setSettings({ ...settings, desktop_background_color: e.target.value })}
                className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div className="pt-2">
              <span className="text-[11px] text-slate-400">Desktop Presets:</span>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {presetWallpapers.map((pc) => (
                  <button
                    key={pc.hex}
                    type="button"
                    onClick={() => setSettings({ ...settings, desktop_background_color: pc.hex })}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 hover:border-slate-600 cursor-pointer transition-all"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pc.hex }} />
                    <span>{pc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase">Window Accent / Titlebar Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setSettings({ ...settings, theme_accent_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-slate-700 bg-transparent"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setSettings({ ...settings, theme_accent_color: e.target.value })}
                className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>
            <div className="pt-2">
              <span className="text-[11px] text-slate-400">Accent Presets:</span>
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {presetAccents.map((pa) => (
                  <button
                    key={pa.hex}
                    type="button"
                    onClick={() => setSettings({ ...settings, theme_accent_color: pa.hex })}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 hover:border-slate-600 cursor-pointer transition-all"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pa.hex }} />
                    <span>{pa.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CRT & Audio Shaders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>CRT Shaders & Sensory Controls</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
              <div>
                <div className="text-xs font-semibold text-white">CRT Scanlines Overlay</div>
                <div className="text-[11px] text-slate-400">Horizontal cathode ray phosphors with authentic flicker</div>
              </div>
              <input
                type="checkbox"
                checked={settings.crt_scanlines_enabled}
                onChange={(e) => setSettings({ ...settings, crt_scanlines_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
              <div>
                <div className="text-xs font-semibold text-white">CRT Glass Curvature</div>
                <div className="text-[11px] text-slate-400">Slight 3D perspective distortion of a real 90s glass tube</div>
              </div>
              <input
                type="checkbox"
                checked={settings.crt_curvature_enabled}
                onChange={(e) => setSettings({ ...settings, crt_curvature_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
              <div>
                <div className="text-xs font-semibold text-white">Matrix Phosphor Rain</div>
                <div className="text-[11px] text-slate-400">Digital green code waterfall background effect during boot screen</div>
              </div>
              <input
                type="checkbox"
                checked={settings.matrix_rain_enabled}
                onChange={(e) => setSettings({ ...settings, matrix_rain_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2">
                {settings.sound_effects_enabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">8-Bit Audio Sound Effects</div>
                  <div className="text-[11px] text-slate-400">Synthesized audio for window clicks, chimes, and typing</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sound_effects_enabled}
                onChange={(e) => setSettings({ ...settings, sound_effects_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
