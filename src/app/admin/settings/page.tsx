'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Save, CheckCircle2, AlertCircle, Terminal, Globe, User,
  Image as ImageIcon, Sparkles, Mail, Phone, MapPin, Hash,
  Share2, Globe2, Link2, Copyright, Loader2
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createClient } from '@/lib/supabase/client';
import { SiteSettings } from '@/types/database';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { adminMutate } from '@/lib/api/adminMutate';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newKeyword, setNewKeyword] = useState('');

  const isDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setSettings(data);
          setOriginalSettings(data);
        }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    }
    load();
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
      setOriginalSettings(updated);
      setFeedback({ type: 'success', text: 'All site settings saved successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw || (settings.seo_keywords || []).includes(kw)) return;
    setSettings({ ...settings, seo_keywords: [...(settings.seo_keywords || []), kw] });
    setNewKeyword('');
  };

  const removeKeyword = (kw: string) => {
    setSettings({ ...settings, seo_keywords: (settings.seo_keywords || []).filter((k) => k !== kw) });
  };

  const inputCls = 'w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors';
  const labelCls = 'text-xs font-semibold text-slate-300 uppercase tracking-wide';

  if (loading) return <SkeletonFormPage />;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Site & BIOS Boot Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Global site identity, social links, SEO keywords, and boot sequence</p>
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50 transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
            : 'bg-red-950/60 border border-red-800 text-red-300'
        }`}>
          {feedback.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity & Owner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Identity & Owner Info</span>
          </h3>

          {[
            { label: 'Site Title', key: 'site_title', type: 'text' },
            { label: 'Owner Name', key: 'owner_name', type: 'text' },
            { label: 'Headline / Tagline', key: 'headline', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key} className="space-y-1.5">
              <label className={labelCls}>{label}</label>
              <input
                type={type}
                value={(settings as unknown as Record<string, unknown>)[key] as string || ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className={inputCls}
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className={labelCls}>Short Bio</label>
            <textarea
              rows={2}
              value={settings.bio_short}
              onChange={(e) => setSettings({ ...settings, bio_short: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Taskbar Status Message</label>
            <input
              type="text"
              value={settings.status_message || ''}
              onChange={(e) => setSettings({ ...settings, status_message: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Copyright Text</label>
            <input
              type="text"
              value={settings.copyright_text || ''}
              onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
              className={inputCls}
              placeholder="© 1995-2026 Mujahid Al Mahi. All systems operational."
            />
          </div>

          {/* Avatar Upload */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
            <label className={`${labelCls} flex items-center gap-2`}>
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <span>Avatar / Profile Photo</span>
            </label>
            {settings.avatar_url && (
              <img src={settings.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-700" />
            )}
            <MediaUploader
              value={settings.avatar_url || ''}
              onChange={(url) => setSettings({ ...settings, avatar_url: url })}
              label="Upload Avatar"
              folder="mahios/avatar"
            />
          </div>

          {/* Favicon Upload */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className={`${labelCls} flex items-center gap-2`}>
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Browser Favicon (.ico / .png)</span>
              </label>
              {settings.favicon_url && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.favicon_url} alt="Favicon" className="w-4 h-4 object-contain" />
                  <span>Active</span>
                </div>
              )}
            </div>
            <MediaUploader
              value={settings.favicon_url || ''}
              onChange={(url) => setSettings({ ...settings, favicon_url: url })}
              label="Upload Favicon Icon"
              folder="mahios/favicon"
            />
          </div>
        </div>

        {/* BIOS & Social */}
        <div className="space-y-6">
          {/* BIOS Boot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Hacker Boot & BIOS Parameters</span>
            </h3>

            <div className="space-y-1.5">
              <label className={labelCls}>BIOS Boot Header</label>
              <input
                type="text"
                value={settings.boot_title}
                onChange={(e) => setSettings({ ...settings, boot_title: e.target.value })}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>BIOS Copyright Subtitle</label>
              <input
                type="text"
                value={settings.boot_subtitle}
                onChange={(e) => setSettings({ ...settings, boot_subtitle: e.target.value })}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className={labelCls}>Terminal Stream Speed</label>
                <span className="text-[11px] font-mono text-emerald-400">{settings.terminal_speed}ms/line</span>
              </div>
              <input
                type="range"
                min="15"
                max="150"
                value={settings.terminal_speed}
                onChange={(e) => setSettings({ ...settings, terminal_speed: parseInt(e.target.value) || 45 })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Fast (15ms)</span>
                <span>Slow (150ms)</span>
              </div>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Contact & Social Channels</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Contact Email', key: 'email', icon: Mail, type: 'email', placeholder: 'you@email.com' },
                { label: 'Phone Number', key: 'phone', icon: Phone, type: 'tel', placeholder: '+880 17XX-XXXXXX' },
                { label: 'Location', key: 'location', icon: MapPin, type: 'text', placeholder: 'Dhaka, Bangladesh' },
                { label: 'Twitter Handle', key: 'twitter_handle', icon: Share2, type: 'text', placeholder: '@username' },
                { label: 'GitHub URL', key: 'github_url', icon: Link2, type: 'url', placeholder: 'https://github.com/...' },
                { label: 'LinkedIn URL', key: 'linkedin_url', icon: Globe2, type: 'url', placeholder: 'https://linkedin.com/...' },
                { label: 'Twitter URL', key: 'twitter_url', icon: Share2, type: 'url', placeholder: 'https://twitter.com/...' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 uppercase font-semibold tracking-wide">{label}</label>
                  <input
                    type={type}
                    value={(settings as unknown as Record<string, unknown>)[key] as string || ''}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Keywords */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Hash className="w-4 h-4 text-purple-400" />
          <span>SEO Keywords</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(settings.seo_keywords || []).map((kw) => (
            <span
              key={kw}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/40 border border-purple-800/60 text-purple-300 rounded-full text-xs font-mono"
            >
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="text-purple-400 hover:text-red-400 cursor-pointer transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Add keyword and press Enter"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* OG Image Upload */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          <span>Open Graph & Social Share Image</span>
        </h3>
        <p className="text-[11px] text-slate-500">Used when your site is shared on Twitter, LinkedIn, and other social platforms. Recommended: 1200×630px.</p>
        {settings.og_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.og_image_url}
            alt="OG Image Preview"
            className="w-full max-w-sm h-32 object-cover rounded-lg border border-slate-700"
          />
        )}
        <MediaUploader
          value={settings.og_image_url || ''}
          onChange={(url) => setSettings({ ...settings, og_image_url: url })}
          label="Upload OG Share Image"
          folder="mahios/og"
        />
      </div>
    </form>
  );
}
