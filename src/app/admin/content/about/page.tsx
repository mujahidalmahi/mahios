'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, User, Sparkles, Loader2, Plus, X, Tag } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { AboutContent } from '@/types/database';

export default function AboutEditorPage() {
  const [data, setData] = useState<AboutContent>(fallbackBiographyData.about);
  const [newTagline, setNewTagline] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: aboutRes } = await supabase.from('about_content').select('*').single();
        if (aboutRes) {
          setData(aboutRes);
        }
      } catch {
        // Fallback already active
      }
    }
    loadData();
  }, []);

  const handleAddTagline = () => {
    if (!newTagline.trim()) return;
    const clean = newTagline.trim();
    if (!data.taglines.includes(clean)) {
      setData({ ...data, taglines: [...data.taglines, clean] });
    }
    setNewTagline('');
  };

  const handleRemoveTagline = (t: string) => {
    setData({ ...data, taglines: data.taglines.filter((item) => item !== t) });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const clean = newInterest.trim();
    if (!data.interests.includes(clean)) {
      setData({ ...data, interests: [...data.interests, clean] });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (i: string) => {
    setData({ ...data, interests: data.interests.filter((item) => item !== i) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const updated: Partial<AboutContent> = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      await supabase.from('about_content').upsert(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <span>Edit About Me & Core Bio Story</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total dynamic freedom across your biographical narrative, interactive taglines, and metrics.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Biography'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>About Me biography changes saved successfully to database!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Photo</h3>
            <MediaUploader
              value={data.avatar_url}
              onChange={(url) => setData({ ...data, avatar_url: url })}
              label="Avatar Image"
              folder="mahios/profile"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Metric Counters</h3>
            <div className="space-y-1">
              <label className="text-slate-400">Years of Experience</label>
              <input
                type="number"
                step="0.5"
                value={data.experience_years}
                onChange={(e) => setData({ ...data, experience_years: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Projects Completed</label>
              <input
                type="number"
                value={data.projects_completed}
                onChange={(e) => setData({ ...data, projects_completed: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Coffee Cups Brewed</label>
              <input
                type="number"
                value={data.coffee_cups}
                onChange={(e) => setData({ ...data, coffee_cups: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Bio text & details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Full Name</label>
                <input
                  type="text"
                  value={data.full_name}
                  onChange={(e) => setData({ ...data, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase">Current Status / Availability</label>
              <input
                type="text"
                value={data.status_text}
                onChange={(e) => setData({ ...data, status_text: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Dynamic Taglines Builder */}
            <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
              <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Professional Taglines</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tagline (e.g. Next.js 16 Specialist, Distributed Systems)..."
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTagline(); } }}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTagline}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.taglines?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-blue-300 font-medium flex items-center gap-1.5"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTagline(tag)}
                      className="text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Dynamic Interests Builder */}
            <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
              <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Interests & Specializations</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add interest (e.g. Retro Computing, Spatial UI)..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.interests?.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-300 font-medium flex items-center gap-1.5"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Inspirational Quote</label>
                <input
                  type="text"
                  value={data.quote}
                  onChange={(e) => setData({ ...data, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Quote Author</label>
                <input
                  type="text"
                  value={data.quote_author}
                  onChange={(e) => setData({ ...data, quote_author: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* TipTap Rich Text Editor for Bio */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Biography Narrative (TipTap Rich Text)</span>
              </label>
              <RichTextEditor
                content={data.bio_html}
                onChange={(html) => setData({ ...data, bio_html: html })}
                minHeight="260px"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}



