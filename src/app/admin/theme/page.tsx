'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette, Save, CheckCircle2, AlertCircle, Monitor, Sparkles,
  Volume2, VolumeX, Eye, Sliders, RefreshCw, Loader2, Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import MediaUploader from '@/components/admin/MediaUploader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SiteSettings } from '@/types/database';
import { getWallpaperStyle, isImageWallpaper } from '@/lib/utils/wallpaper';

const presetWallpapers = [
  { name: 'Windows 95 Teal', hex: '#008080' },
  { name: 'Classic Navy', hex: '#000080' },
  { name: 'Vintage Slate', hex: '#4a5568' },
  { name: 'Cyber Charcoal', hex: '#111827' },
  { name: 'Terminal Green', hex: '#022c15' },
  { name: 'Retro Amber Glow', hex: '#2d1500' },
  { name: 'Synthwave Violet', hex: '#2b1055' },
  { name: 'Midnight Black', hex: '#030712' },
  { name: 'Win98 Cobalt', hex: '#3a6ea5' },
  { name: 'Forest Moss', hex: '#13391b' },
];

const presetAccents = [
  { name: 'Win95 Royal Blue', hex: '#000080' },
  { name: 'Electric Cyan', hex: '#00ffff' },
  { name: 'Terminal Green', hex: '#00ff66' },
  { name: 'Cyberpunk Yellow', hex: '#facc15' },
  { name: 'Neon Coral', hex: '#f43f5e' },
  { name: 'Deep Amethyst', hex: '#7c3aed' },
];

const presetImages = [
  {
    name: 'Windows 95 Bliss & Clouds',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop',
    category: 'Retro OS',
  },
  {
    name: 'Cyberpunk Grid & Neon',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
    category: 'Cyberpunk',
  },
  {
    name: 'Retro Synthwave Sun',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    category: 'Vaporwave',
  },
  {
    name: 'Deep Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop',
    category: 'Space',
  },
  {
    name: 'Minimal Dark Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop',
    category: 'Minimal',
  },
];

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [original, setOriginal] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [wallpaperMode, setWallpaperMode] = useState<'color' | 'image'>('color');
  const [customImageUrl, setCustomImageUrl] = useState('');

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
          if (isImageWallpaper(data.desktop_background_color)) {
            setWallpaperMode('image');
            setCustomImageUrl(data.desktop_background_color);
          } else {
            setWallpaperMode('color');
          }
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
    const updated: SiteSettings = {
      ...settings,
      crt_scanlines_enabled: false,
      crt_curvature_enabled: false,
      updated_at: new Date().toISOString(),
    };

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
      setFeedback({ type: 'success', text: 'Desktop wallpaper and theme settings saved successfully!' });
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
      sound_effects_enabled: true,
    });
    setWallpaperMode('color');
  };

  if (loading) return <SkeletonFormPage />;

  const bgColor = settings.desktop_background_color || '#008080';
  const accentColor = settings.theme_accent_color || '#000080';
  const isImageActive = isImageWallpaper(bgColor);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            <span>Desktop Wallpaper & Appearance Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure desktop wallpaper (solid color or custom image), window titlebar styling, and audio effects
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

      {/* Live Clean Desktop Simulator Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Desktop Wallpaper Preview
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>
              Mode: <strong className="text-slate-200">{isImageActive ? 'Custom Image' : 'Solid Color'}</strong>
            </span>
            <span>•</span>
            <span>
              Accent: <strong className="text-slate-200">{accentColor}</strong>
            </span>
          </div>
        </div>

        {/* Clean Screen Display Viewport */}
        <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl relative max-w-3xl mx-auto">
          <div
            className="relative h-72 sm:h-80 transition-all duration-300 flex flex-col justify-between"
            style={getWallpaperStyle(bgColor)}
          >
            {/* Desktop Icons */}
            <div className="p-3 grid grid-cols-4 gap-3 w-48 relative z-10">
              {['My Computer', 'Projects', 'Terminal', 'Mail'].map((name, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 cursor-default">
                  <div className="w-8 h-8 rounded bg-slate-900/60 border border-white/20 flex items-center justify-center text-[10px] text-white shadow backdrop-blur-xs">
                    📁
                  </div>
                  <span className="text-[9px] font-mono text-white bg-black/50 px-1 rounded truncate max-w-full">
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
                  <span>MahiOS Desktop — Sample Application</span>
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
                <p className="font-bold text-gray-900">Desktop Wallpaper Customizer</p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {isImageActive
                    ? 'Currently rendering a high-resolution custom background image across the workspace.'
                    : 'Currently rendering a high-contrast vintage solid desktop color.'}
                </p>
              </div>
            </div>

            {/* Win95 Taskbar */}
            <div className="h-7 bg-[#c0c0c0] border-t-2 border-white flex items-center justify-between px-2 z-20 select-none">
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-[#404040] font-bold text-[10px] text-black flex items-center gap-1 shadow-xs">
                  <span>🪟</span>
                  <span>Start</span>
                </div>
                <div
                  className="px-2 py-0.5 border text-[10px] font-semibold text-white flex items-center gap-1 shadow-inner"
                  style={{ backgroundColor: accentColor, borderColor: '#404040' }}
                >
                  Active Window
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
        {/* Wallpaper Customizer Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>Desktop Wallpaper Selection</span>
            </h3>
            <span className="text-[11px] font-mono text-blue-400">
              {wallpaperMode === 'color' ? 'Solid Color Mode' : 'Custom Image Mode'}
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setWallpaperMode('color');
                if (isImageActive) {
                  setSettings({ ...settings, desktop_background_color: '#008080' });
                }
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                wallpaperMode === 'color'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Solid Color</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWallpaperMode('image');
                if (!isImageActive) {
                  setSettings({ ...settings, desktop_background_color: presetImages[0].url });
                }
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                wallpaperMode === 'image'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Custom Image</span>
            </button>
          </div>

          {/* SOLID COLOR CONTROLS */}
          {wallpaperMode === 'color' && (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Custom Solid Hex Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={isImageActive ? '#008080' : bgColor}
                    onChange={(e) => setSettings({ ...settings, desktop_background_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={isImageActive ? '#008080' : bgColor}
                    onChange={(e) => setSettings({ ...settings, desktop_background_color: e.target.value })}
                    className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Curated Solid Palettes:</span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {presetWallpapers.map((pc) => (
                    <button
                      key={pc.hex}
                      type="button"
                      onClick={() => setSettings({ ...settings, desktop_background_color: pc.hex })}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-slate-200 cursor-pointer transition-all ${
                        bgColor.toLowerCase() === pc.hex.toLowerCase()
                          ? 'bg-blue-950/60 border-blue-500 font-bold'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded shrink-0 shadow" style={{ backgroundColor: pc.hex }} />
                      <span className="truncate">{pc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* IMAGE WALLPAPER CONTROLS */}
          {wallpaperMode === 'image' && (
            <div className="space-y-4 pt-1">
              {/* Cloudinary Image Uploader */}
              <MediaUploader
                label="Upload Wallpaper Image"
                folder="mahios/wallpapers"
                helperText="Upload any high-resolution JPG/PNG/WebP image (1920x1080 recommended)."
                value={isImageActive ? bgColor : ''}
                onChange={(url) => {
                  setSettings({ ...settings, desktop_background_color: url });
                  setCustomImageUrl(url);
                }}
              />

              {/* Direct Image URL Input */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Or Enter Direct Image URL</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://example.com/wallpaper.jpg"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customImageUrl.trim()) {
                        setSettings({ ...settings, desktop_background_color: customImageUrl.trim() });
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium cursor-pointer border border-slate-700"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Curated High-Res Wallpapers */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">Curated Aesthetic Wallpapers:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {presetImages.map((wp) => (
                    <button
                      key={wp.name}
                      type="button"
                      onClick={() => {
                        setSettings({ ...settings, desktop_background_color: wp.url });
                        setCustomImageUrl(wp.url);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        bgColor === wp.url
                          ? 'bg-blue-950/60 border-blue-500 font-bold'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-10 h-7 rounded border border-white/20 bg-cover bg-center shrink-0 shadow"
                        style={{ backgroundImage: `url("${wp.url}")` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-slate-200 truncate">{wp.name}</div>
                        <div className="text-[10px] text-slate-500">{wp.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accent Color & Sensory Options */}
        <div className="space-y-6">
          {/* Accent Color */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>Window Titlebar & Accent Palette</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Titlebar Gradient Accent Color</label>
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
                  className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase"
                />
              </div>
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 font-medium">Accent Presets:</span>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {presetAccents.map((pa) => (
                    <button
                      key={pa.hex}
                      type="button"
                      onClick={() => setSettings({ ...settings, theme_accent_color: pa.hex })}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all border ${
                        accentColor.toLowerCase() === pa.hex.toLowerCase()
                          ? 'bg-blue-950/60 border-blue-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pa.hex }} />
                      <span>{pa.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Sensory */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Sensory & Audio Engine</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2.5">
                  {settings.sound_effects_enabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">8-Bit Audio Sound Synthesizer</div>
                    <div className="text-[11px] text-slate-400">
                      Synthesized sound effects for window clicks, chimes, and dialog interactions
                    </div>
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
      </div>
    </form>
  );
}
