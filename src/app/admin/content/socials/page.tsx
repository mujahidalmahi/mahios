'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, ExternalLink, ShieldCheck
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SocialLinkItem } from '@/types/database';

export default function SocialsAdminPage() {
  const [links, setLinks] = useState<SocialLinkItem[]>(fallbackBiographyData.socialLinks);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<SocialLinkItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('social_links').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setLinks(data as SocialLinkItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allDistinctCategories = Array.from(new Set(links.map((l) => l.category).filter(Boolean)));

  const openNew = () => {
    setIsNew(true);
    setEditingLink({
      id: `soc-${Date.now()}`,
      platform_name: '',
      username: '',
      url: 'https://',
      icon_name: 'Globe',
      category: allDistinctCategories[0] || 'social',
      is_verified: true,
      accent_color: '#000080',
      sort_order: links.length + 1,
    });
  };

  const openEdit = (l: SocialLinkItem) => {
    setIsNew(false);
    setEditingLink({ ...l });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link endpoint?')) return;
    try {
      const supabase = createClient();
      await supabase.from('social_links').delete().eq('id', id);
    } catch {
      // Local
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setFeedback({ type: 'success', text: 'Social endpoint removed.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setSaving(true);

    if (isNew) {
      setLinks((prev) => [...prev, editingLink]);
    } else {
      setLinks((prev) => prev.map((l) => (l.id === editingLink.id ? editingLink : l)));
    }

    try {
      const supabase = createClient();
      await supabase.from('social_links').upsert(editingLink);
    } catch {
      // Local
    }

    setEditingLink(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Platform "${editingLink.platform_name}" saved!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIdx];
    newLinks[targetIdx] = temp;

    const updated = newLinks.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setLinks(updated);

    try {
      const supabase = createClient();
      updated.forEach(async (item) => {
        await supabase.from('social_links').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  const filtered = categoryFilter === 'all'
    ? links
    : links.filter((l) => l.category.toLowerCase() === categoryFilter.toLowerCase());

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Social Links Hub...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <span>Social Links & Digital ID Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total dynamic freedom across communication channels, custom categories, verified badges, and brand colors.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Channel</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Dynamic Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            categoryFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Channels ({links.length})
        </button>

        {allDistinctCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 capitalize ${
              categoryFilter.toLowerCase() === cat.toLowerCase()
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Social Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((link, idx) => (
          <div
            key={link.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md"
                style={{ backgroundColor: link.accent_color || '#2563eb' }}
              >
                {link.platform_name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white truncate">{link.platform_name}</h3>
                  {link.is_verified && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-800 flex items-center gap-0.5 shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-400 truncate">{link.username}</p>
                <span className="text-[10px] text-slate-500 font-mono capitalize">{link.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                title="Open Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === links.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openEdit(link)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                title="Edit Channel"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(link.id)}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                title="Delete Channel"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Add Social Channel' : `Edit: ${editingLink.platform_name}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingLink(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Platform Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GitHub, LinkedIn, Discord, Bluesky"
                    value={editingLink.platform_name}
                    onChange={(e) => setEditingLink({ ...editingLink, platform_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Handle / Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. @mujahidmahi"
                    value={editingLink.username}
                    onChange={(e) => setEditingLink({ ...editingLink, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Direct Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/mujahidmahi"
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Dynamic Category Picker */}
              <CategoryPicker
                value={editingLink.category}
                onChange={(cat) => setEditingLink({ ...editingLink, category: cat })}
                existingCategories={allDistinctCategories.length > 0 ? allDistinctCategories : ['code', 'social', 'contact', 'gaming', 'media']}
                label="Channel Category"
                helperText="Select an existing category or type any custom category (e.g. Enterprise, Web3, Creative)."
              />

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Brand Hex Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={editingLink.accent_color || '#000080'}
                    onChange={(e) => setEditingLink({ ...editingLink, accent_color: e.target.value })}
                    className="w-9 h-9 rounded bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editingLink.accent_color || '#000080'}
                    onChange={(e) => setEditingLink({ ...editingLink, accent_color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLink.is_verified}
                    onChange={(e) => setEditingLink({ ...editingLink, is_verified: e.target.checked })}
                    className="rounded border-slate-700 accent-emerald-500"
                  />
                  <span>Display Verified Identity Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Channel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
