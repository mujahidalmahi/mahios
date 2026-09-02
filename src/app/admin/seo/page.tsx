'use client';

import React, { useState, useEffect } from 'react';
import { Search, Save, CheckCircle2, Globe, Sparkles, Image as ImageIcon } from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SiteSettings } from '@/types/database';

export default function SEOManagerPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [keywordsInput, setKeywordsInput] = useState(settings.seo_keywords.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setSettings(data);
          setKeywordsInput(data.seo_keywords?.join(', ') || '');
        }
      } catch {
        // Fallback
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = {
      ...settings,
      seo_keywords: keywordsInput.split(',').map((k) => k.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      await supabase.from('site_settings').upsert(updated);
    } catch {
      // Local
    }

    setIsSaving(false);
    setNotification('SEO & Favicon configuration updated successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            <span>Search Engine Optimization (SEO) & Favicon</span>
          </h1>
          <p className="text-xs text-slate-400">Meta tags, Open Graph cards, browser favicon, structured data, and search engine ranking</p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save SEO Config'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase">Page Title (Title Tag)</label>
              <input
                type="text"
                required
                value={settings.seo_title}
                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 font-mono">{settings.seo_title.length}/60 characters</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase">Meta Description</label>
              <textarea
                rows={3}
                required
                value={settings.seo_description}
                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 font-mono">{settings.seo_description.length}/160 characters</span>
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
                label="Upload Browser Favicon Icon"
                folder="mahios/favicon"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase">SEO Keywords (comma separated)</label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase">Twitter Handle</label>
                <input
                  type="text"
                  value={settings.twitter_handle}
                  onChange={(e) => setSettings({ ...settings, twitter_handle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase">Canonical URL</label>
                <input
                  type="text"
                  value="https://mujahidmahi.xyz"
                  readOnly
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Social Share Image (OpenGraph / 1200x630)</span>
              </label>
              <MediaUploader
                value={settings.og_image_url}
                onChange={(url) => setSettings({ ...settings, og_image_url: url })}
                label="Social Share Image (OpenGraph / 1200x630)"
                folder="mahios/seo"
              />
            </div>
          </div>
        </div>

        {/* Realtime SERP Preview */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Google Search Live Snippet</span>
            </h3>

            <div className="bg-white p-4 rounded-xl shadow-sm space-y-1 text-left text-slate-900">
              <div className="text-[11px] text-[#202124] flex items-center gap-1.5">
                {settings.favicon_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.favicon_url} alt="Site icon" className="w-4 h-4 rounded-full object-contain" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">M</span>
                )}
                <span className="truncate font-sans text-xs">mujahidmahi.xyz</span>
              </div>
              <h4 className="text-base text-[#1a0dab] hover:underline font-medium cursor-pointer line-clamp-1">
                {settings.seo_title || 'Mujahid Mahi | Digital Biography'}
              </h4>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {settings.seo_description || 'Enter MahiOS: An interactive 90s vintage operating system...'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Structured Data (JSON-LD)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              MahiOS automatically embeds <code>schema.org/Person</code>, <code>schema.org/WebSite</code>, and <code>schema.org/CreativeWork</code> schema for Google indexing and AI search crawlers.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
