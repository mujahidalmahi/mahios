'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Save, CheckCircle2, AlertCircle, Globe, Image as ImageIcon,
  Share2, Hash, Eye, Loader2
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createClient } from '@/lib/supabase/client';
import { SiteSettings } from '@/types/database';
import { fallbackBiographyData } from '@/lib/data/initialData';

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [original, setOriginal] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState<'serp' | 'og' | 'twitter' | null>('serp');

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) { setSettings(data); setOriginal(data); }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updated = { ...settings, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('site_settings').upsert(updated);
      if (error) throw error;
      setOriginal(updated);
      setFeedback({ type: 'success', text: 'SEO settings saved! Changes will reflect on next site build.' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const titleLen = (settings.seo_title || '').length;
  const descLen = (settings.seo_description || '').length;

  if (loading) return <SkeletonFormPage />;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-green-400" />
            <span>SEO & Search Visibility</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Meta tags, Open Graph, Twitter cards, and search engine indexing</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
              Unsaved changes
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save SEO'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Core Meta */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-400" />
          <span>Core Meta Tags</span>
        </h3>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">SEO Page Title</label>
            <span className={`text-[10px] font-mono ${titleLen > 60 ? 'text-red-400' : titleLen > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {titleLen}/60
            </span>
          </div>
          <input
            type="text"
            value={settings.seo_title}
            onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
            maxLength={70}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
          {titleLen > 60 && <p className="text-[10px] text-red-400">⚠ Over 60 characters — Google may truncate this title</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Meta Description</label>
            <span className={`text-[10px] font-mono ${descLen > 160 ? 'text-red-400' : descLen > 140 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {descLen}/160
            </span>
          </div>
          <textarea
            rows={3}
            value={settings.seo_description}
            onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
            maxLength={180}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
          />
          {descLen > 160 && <p className="text-[10px] text-red-400">⚠ Over 160 characters — Google may truncate this description</p>}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {[
            { key: 'serp', label: '🔍 Google SERP', icon: Search },
            { key: 'og', label: '🌐 Open Graph', icon: Globe },
            { key: 'twitter', label: '🐦 Twitter Card', icon: Share2 },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setShowPreview(prev => prev === key ? null : key as 'serp' | 'og' | 'twitter')}
              className={`px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                showPreview === key
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="flex-1 flex items-center justify-end px-3">
            <span className="text-[10px] text-slate-500">Live preview</span>
          </div>
        </div>

        {/* SERP Preview */}
        {showPreview === 'serp' && (
          <div className="p-6">
            <div className="max-w-xl bg-white rounded-lg p-4 space-y-1 shadow-sm">
              <div className="text-[11px] text-slate-500 font-mono">mujahidmahi.me</div>
              <div className="text-blue-700 text-base font-medium leading-snug hover:underline cursor-pointer truncate">
                {settings.seo_title || 'Your SEO title will appear here'}
              </div>
              <div className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                {settings.seo_description || 'Your meta description will appear here. Keep it under 160 characters for best results.'}
              </div>
            </div>
          </div>
        )}

        {/* OG Preview */}
        {showPreview === 'og' && (
          <div className="p-6">
            <div className="max-w-sm border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
              {settings.og_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.og_image_url} alt="OG" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  No OG image set
                </div>
              )}
              <div className="p-3 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">mujahidmahi.me</div>
                <div className="text-sm font-semibold text-slate-900 leading-snug">{settings.seo_title || 'Page Title'}</div>
                <div className="text-xs text-slate-500 leading-snug line-clamp-2">{settings.seo_description || 'Description'}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase">OG Image Upload (1200×630px recommended)</label>
              <MediaUploader
                value={settings.og_image_url || ''}
                onChange={(url) => setSettings({ ...settings, og_image_url: url })}
                label="Upload Open Graph Image"
                folder="mahios/og"
              />
            </div>
          </div>
        )}

        {/* Twitter Card Preview */}
        {showPreview === 'twitter' && (
          <div className="p-6">
            <div className="max-w-sm border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
              {settings.og_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.og_image_url} alt="Twitter card" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  No card image set
                </div>
              )}
              <div className="p-3 space-y-1">
                <div className="text-sm font-semibold text-white leading-snug">{settings.seo_title || 'Page Title'}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{settings.seo_description || 'Description'}</div>
                <div className="text-[10px] text-slate-500">{settings.twitter_handle || '@username'} · mujahidmahi.me</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Robots */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>Search Engine Indexing</span>
        </h3>
        <p className="text-[11px] text-slate-500">
          Your site&apos;s <code className="bg-slate-800 px-1 rounded">robots.txt</code> and meta robots are auto-generated. The site is publicly indexable by default — admin pages are excluded.
        </p>
        <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-300">Public site: <strong>index, follow</strong> · Admin pages: <strong>noindex, nofollow</strong></span>
        </div>
      </div>
    </form>
  );
}
