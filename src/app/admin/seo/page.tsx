'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Save, CheckCircle2, AlertCircle, Globe, Image as ImageIcon,
  Share2, Hash, Eye, Loader2, Sparkles, ExternalLink, RefreshCw,
  FileCode, Check, Copy
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createClient } from '@/lib/supabase/client';
import { SiteSettings } from '@/types/database';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { adminMutate } from '@/lib/api/adminMutate';

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [original, setOriginal] = useState<SiteSettings>(fallbackBiographyData.settings);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState<'serp' | 'og' | 'twitter'>('serp');
  const [newKeyword, setNewKeyword] = useState('');

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('site_settings').select('*').single();
        if (data) {
          setSettings(data);
          setOriginal(data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = { ...settings, updated_at: new Date().toISOString() };
      const res = await adminMutate<SiteSettings>({
        table: 'site_settings',
        action: 'upsert',
        data: updated,
      });

      if (!res.success) throw new Error(res.error);
      setOriginal(updated);
      setFeedback({ type: 'success', text: 'SEO settings saved! Changes and sitemap take effect immediately.' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Automated Intelligent SEO Synthesizer
  const handleAutoSynthesizeSeo = async () => {
    setIsSynthesizing(true);
    try {
      const supabase = createClient();
      const [skillsRes, projRes, aboutRes] = await Promise.all([
        supabase.from('skills').select('name'),
        supabase.from('projects').select('title, tags'),
        supabase.from('about_content').select('full_name, taglines, location').single(),
      ]);

      const fullName = aboutRes.data?.full_name || 'Mujahid Al Mahi';
      const location = aboutRes.data?.location || 'Dhaka, Bangladesh';
      const skillNames = (skillsRes.data || []).map((s) => s.name);
      const projectTags = (projRes.data || []).flatMap((p) => p.tags || []);
      const taglines = aboutRes.data?.taglines || ['Full-Stack Systems Engineer', 'Next.js 16 Specialist'];

      // Generate comprehensive unique keyword array
      const dynamicKeywords = Array.from(
        new Set([
          fullName,
          `${fullName} Portfolio`,
          `${fullName} Software Engineer`,
          'Software Engineer',
          'Full Stack Systems Engineer',
          'Next.js 16',
          'React 19',
          'TypeScript Specialist',
          'Supabase PostgreSQL',
          'Retro Desktop OS Portfolio',
          'MahiOS',
          'MahiOS 05',
          `Software Engineer in ${location}`,
          ...taglines,
          ...skillNames,
          ...projectTags,
        ])
      ).slice(0, 25);

      const dynamicTitle = `${fullName} | Full-Stack Systems Engineer & Digital Biography`;
      const dynamicDesc = `Explore the interactive retro operating system, engineering portfolio, open-source distributed systems, and technical biography of ${fullName} (${location}).`;

      setSettings({
        ...settings,
        seo_title: dynamicTitle,
        seo_description: dynamicDesc,
        seo_keywords: dynamicKeywords,
      });

      setFeedback({
        type: 'success',
        text: 'Automated SEO parameters synthesized! Review and click Save to publish.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: `Synthesis failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setIsSynthesizing(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleAddKeyword = () => {
    const clean = newKeyword.trim();
    if (!clean) return;
    if (!settings.seo_keywords?.includes(clean)) {
      setSettings({
        ...settings,
        seo_keywords: [...(settings.seo_keywords || []), clean],
      });
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setSettings({
      ...settings,
      seo_keywords: settings.seo_keywords?.filter((k) => k !== kw),
    });
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
            <Search className="w-5 h-5 text-emerald-400" />
            <span>SEO, Knowledge Graph & Search Engine Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic meta tags, automated Schema.org Knowledge Graphs, and search crawlability.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoSynthesizeSeo}
            disabled={isSynthesizing}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            title="Auto-generate optimized keywords and meta descriptions based on live database data"
          >
            {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Auto-Generate SEO</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save All SEO'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 animate-fadeIn ${
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

      {/* Real-time Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs group transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-400" />
            <div>
              <div className="font-bold text-white group-hover:text-blue-400">Dynamic sitemap.xml</div>
              <div className="text-[11px] text-slate-400">Live query routes for all apps & posts</div>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
        </a>

        <a
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs group transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-bold text-white group-hover:text-amber-400">Dynamic RSS 2.0 /feed.xml</div>
              <div className="text-[11px] text-slate-400">Auto-discovers new dev notes & updates</div>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
        </a>

        <a
          href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fmujahidmahi.me"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs group transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-bold text-white group-hover:text-emerald-400">Google Rich Results Test</div>
              <div className="text-[11px] text-slate-400">Test Schema.org Knowledge Graph</div>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
        </a>
      </div>

      {/* Core Meta */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Core Meta Tags & Search Results</span>
        </h3>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">SEO Page Title</label>
            <span
              className={`text-[10px] font-mono ${
                titleLen > 60 ? 'text-red-400' : titleLen > 50 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {titleLen}/60
            </span>
          </div>
          <input
            type="text"
            value={settings.seo_title}
            onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
            maxLength={75}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
          {titleLen > 60 && (
            <p className="text-[10px] text-red-400">⚠ Over 60 characters — Google may truncate this title</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              SEO Meta Description
            </label>
            <span
              className={`text-[10px] font-mono ${
                descLen > 160 ? 'text-red-400' : descLen > 140 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {descLen}/160
            </span>
          </div>
          <textarea
            rows={3}
            value={settings.seo_description}
            onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
            maxLength={200}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Dynamic Keywords Chip Builder */}
        <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <span>Target SEO Keywords ({(settings.seo_keywords || []).length})</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Press Enter to add</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add keyword (e.g. Next.js 16, Distributed Systems, Software Engineer)..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(settings.seo_keywords || []).map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-blue-300 font-medium flex items-center gap-1.5"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-slate-500 hover:text-red-400 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* OpenGraph & Social Image */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span>Open Graph & Social Share Image (1200x630)</span>
          </h4>
          <MediaUploader
            value={settings.og_image_url}
            onChange={(url) => setSettings({ ...settings, og_image_url: url })}
            label="Social Share Card (OG Banner)"
            folder="mahios/seo"
          />
        </div>
      </div>

      {/* Live Previews Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Live Social & Search Previews</span>
          </h3>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setShowPreview('serp')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                showPreview === 'serp' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Google Search
            </button>
            <button
              type="button"
              onClick={() => setShowPreview('og')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                showPreview === 'og' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Facebook / LinkedIn
            </button>
            <button
              type="button"
              onClick={() => setShowPreview('twitter')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                showPreview === 'twitter' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              X (Twitter)
            </button>
          </div>
        </div>

        {/* Google SERP Preview */}
        {showPreview === 'serp' && (
          <div className="p-4 bg-white rounded-lg max-w-xl text-black space-y-1">
            <div className="text-[11px] text-[#202124] flex items-center gap-1 font-sans">
              <span className="text-gray-500">https://mujahidmahi.me</span>
              <span className="text-gray-400">›</span>
              <span className="text-gray-500">digital-biography</span>
            </div>
            <div className="text-[#1a0dab] font-sans font-medium text-lg leading-snug hover:underline cursor-pointer">
              {settings.seo_title || `${settings.owner_name} | Digital Biography & Interactive OS`}
            </div>
            <div className="text-xs text-[#4d5156] leading-relaxed font-sans line-clamp-2">
              {settings.seo_description || settings.bio_short}
            </div>
          </div>
        )}

        {/* OpenGraph Preview */}
        {showPreview === 'og' && (
          <div className="max-w-md bg-[#242526] border border-gray-700 rounded-lg overflow-hidden text-white">
            {settings.og_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.og_image_url}
                alt="OG Preview"
                className="w-full h-48 object-cover bg-slate-800"
              />
            ) : (
              <div className="w-full h-48 bg-[#000080] flex items-center justify-center text-white font-bold text-xl">
                MahiOS Digital Biography
              </div>
            )}
            <div className="p-3 space-y-1 bg-[#242526]">
              <div className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">mujahidmahi.me</div>
              <div className="font-bold text-sm text-white line-clamp-1">{settings.seo_title}</div>
              <div className="text-xs text-gray-300 line-clamp-2">{settings.seo_description}</div>
            </div>
          </div>
        )}

        {/* Twitter Card Preview */}
        {showPreview === 'twitter' && (
          <div className="max-w-md bg-black border border-gray-800 rounded-2xl overflow-hidden text-white">
            {settings.og_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.og_image_url}
                alt="Twitter Preview"
                className="w-full h-48 object-cover bg-slate-900"
              />
            ) : (
              <div className="w-full h-48 bg-[#000080] flex items-center justify-center text-white font-bold text-xl">
                MahiOS Digital Biography
              </div>
            )}
            <div className="p-3 space-y-0.5">
              <div className="text-[11px] text-gray-500">mujahidmahi.me</div>
              <div className="font-bold text-sm text-white line-clamp-1">{settings.seo_title}</div>
              <div className="text-xs text-gray-400 line-clamp-2">{settings.seo_description}</div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
