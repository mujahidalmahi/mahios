'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Save, CheckCircle2, Monitor, Volume2, Sparkles } from 'lucide-react';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SiteSettings } from '@/types/database';

const presetColors = [
  { name: 'Windows 95 Teal', hex: '#008080' },
  { name: 'Classic Navy', hex: '#000080' },
  { name: 'Vintage Grey', hex: '#808080' },
  { name: 'Cyber Charcoal', hex: '#1c1f24' },
  { name: 'CRT Phosphor Green', hex: '#003300' },
  { name: 'Retro Amber', hex: '#331a00' },
];

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) setSettings(data);
      } catch {
        // Fallback
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = { ...settings, updated_at: new Date().toISOString() };

    try {
      const supabase = createClient();
      await supabase.from('site_settings').upsert(updated);
    } catch {
      // Local
    }

    setIsSaving(false);
    setNotification('Theme settings saved!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <span>Theme & CRT Monitor Effects</span>
          </h1>
          <p className="text-xs text-slate-400">Control visual styling, CRT tube curvature, scanlines, and audio effects</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Theme'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Colors */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Desktop Colors</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase">Desktop Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.desktop_background_color || '#008080'}
                onChange={(e) => setSettings({ ...settings, desktop_background_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-slate-700 bg-transparent"
              />
              <input
                type="text"
                value={settings.desktop_background_color || '#008080'}
                onChange={(e) => setSettings({ ...settings, desktop_background_color: e.target.value })}
                className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400">Presets:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {presetColors.map((pc) => (
                  <button
                    key={pc.hex}
                    type="button"
                    onClick={() => setSettings({ ...settings, desktop_background_color: pc.hex })}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 hover:border-slate-500"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pc.hex }} />
                    <span>{pc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CRT & Audio Toggles */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Visual FX & Sound Toggles</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white">CRT Scanlines Overlay</div>
                <div className="text-[11px] text-slate-400">Horizontal cathode ray scan lines</div>
              </div>
              <input
                type="checkbox"
                checked={settings.crt_scanlines_enabled}
                onChange={(e) => setSettings({ ...settings, crt_scanlines_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white">CRT Glass Curvature</div>
                <div className="text-[11px] text-slate-400">Slight 3D perspective distortion of a real 90s CRT bulb</div>
              </div>
              <input
                type="checkbox"
                checked={settings.crt_curvature_enabled}
                onChange={(e) => setSettings({ ...settings, crt_curvature_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white">Matrix Rain Animation</div>
                <div className="text-[11px] text-slate-400">Digital green phosphor rain during boot screen</div>
              </div>
              <input
                type="checkbox"
                checked={settings.matrix_rain_enabled}
                onChange={(e) => setSettings({ ...settings, matrix_rain_enabled: e.target.checked })}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-white">8-Bit Sound Effects</div>
                <div className="text-[11px] text-slate-400">Synthesized audio for clicks, window opens, and chimes</div>
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
