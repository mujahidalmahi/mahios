'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Terminal, Globe, User, Image as ImageIcon, Sparkles } from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SiteSettings } from '@/types/database';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) setSettings(data);
      } catch {
        // Fallback
      }
    }
    loadSettings();
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
    setNotification('Site and BIOS settings updated successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Site & BIOS Boot Configuration</span>
          </h1>
          <p className="text-xs text-slate-400">Global site identity, browser favicon, social links, and hacker boot sequence parameters</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity & Global */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Identity & Owner Info</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">Site Title</label>
            <input
              type="text"
              required
              value={settings.site_title}
              onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">Owner Name</label>
            <input
              type="text"
              required
              value={settings.owner_name}
              onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Favicon Uploader */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Browser Favicon (.ico / .png / .svg)</span>
              </label>
              {settings.favicon_url && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.favicon_url} alt="Favicon preview" className="w-4 h-4 object-contain" />
                  <span>Favicon Active</span>
                </div>
              )}
            </div>
            <MediaUploader
              value={settings.favicon_url}
              onChange={(url) => setSettings({ ...settings, favicon_url: url })}
              label="Upload Favicon Icon"
              folder="mahios/favicon"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">Headline / Tagline</label>
            <input
              type="text"
              value={settings.headline}
              onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">Short Bio</label>
            <textarea
              rows={2}
              value={settings.bio_short}
              onChange={(e) => setSettings({ ...settings, bio_short: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">Taskbar Status Message</label>
            <input
              type="text"
              value={settings.status_message}
              onChange={(e) => setSettings({ ...settings, status_message: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* BIOS & Boot Screen Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Hacker Boot & BIOS Parameters</span>
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">BIOS Boot Header</label>
            <input
              type="text"
              value={settings.boot_title}
              onChange={(e) => setSettings({ ...settings, boot_title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase">BIOS Copyright Subtitle</label>
            <input
              type="text"
              value={settings.boot_subtitle}
              onChange={(e) => setSettings({ ...settings, boot_subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-semibold uppercase">Terminal Log Stream Speed</span>
              <span className="font-mono text-emerald-400">{settings.terminal_speed}ms/log</span>
            </div>
            <input
              type="range"
              min="15"
              max="150"
              value={settings.terminal_speed}
              onChange={(e) => setSettings({ ...settings, terminal_speed: parseInt(e.target.value) || 45 })}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pt-3 border-t border-slate-800">
            Social & Contact Channels
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 uppercase">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 uppercase">Location</label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 uppercase">GitHub URL</label>
              <input
                type="url"
                value={settings.github_url}
                onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 uppercase">LinkedIn URL</label>
              <input
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
