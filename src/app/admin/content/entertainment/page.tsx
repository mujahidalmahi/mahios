'use client';

import React, { useState, useEffect } from 'react';
import {
  Gamepad2, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Star, Image as ImageIcon, Sparkles
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { EntertainmentItem } from '@/types/database';

export default function EntertainmentAdminPage() {
  const [items, setItems] = useState<EntertainmentItem[]>(fallbackBiographyData.entertainment);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<EntertainmentItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('entertainment_items').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setItems(data as EntertainmentItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allDistinctTypes = Array.from(new Set(items.map((i) => i.type).filter(Boolean)));

  const openNew = () => {
    setIsNew(true);
    setEditingItem({
      id: `ent-${Date.now()}`,
      title: '',
      type: allDistinctTypes[0] || 'game',
      creator: '',
      rating_score: 9.5,
      review_summary: '',
      favorite_quote: '',
      cover_url: '',
      sort_order: items.length + 1,
    });
  };

  const openEdit = (item: EntertainmentItem) => {
    setIsNew(false);
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      const supabase = createClient();
      await supabase.from('entertainment_items').delete().eq('id', id);
    } catch {
      // Local
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setFeedback({ type: 'success', text: 'Media item deleted.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    if (isNew) {
      setItems((prev) => [...prev, editingItem]);
    } else {
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? editingItem : i)));
    }

    try {
      const supabase = createClient();
      await supabase.from('entertainment_items').upsert(editingItem);
    } catch {
      // Local
    }

    setEditingItem(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Media "${editingItem.title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const updated = newItems.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setItems(updated);

    try {
      const supabase = createClient();
      updated.forEach(async (item) => {
        await supabase.from('entertainment_items').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  const filtered = typeFilter === 'all'
    ? items
    : items.filter((i) => i.type.toLowerCase() === typeFilter.toLowerCase());

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Media & Entertainment...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span>Entertainment & Creative Media Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total dynamic freedom across all media types. Showcase video games, movies, anime, literature, or custom creative works.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Work</span>
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

      {/* Dynamic Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            typeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Types ({items.length})
        </button>

        {allDistinctTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 capitalize ${
              typeFilter.toLowerCase() === type.toLowerCase()
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-18 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shrink-0 shadow-md">
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono bg-slate-950 text-blue-300 px-2 py-0.5 rounded border border-slate-800">
                      {item.type}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-mono text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.rating_score}/10</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1 truncate">{item.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{item.creator}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {item.review_summary}
              </p>

              {item.favorite_quote && (
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] italic text-amber-300">
                  {item.favorite_quote}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-500">Rank: #{item.sort_order || idx + 1}</span>

              <div className="flex items-center gap-1">
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
                  disabled={idx === items.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-400" />
                <span>{isNew ? 'Add Media Work' : `Edit: ${editingItem.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk 2077, Interstellar, Steins;Gate"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Dynamic Category/Type Picker */}
              <CategoryPicker
                value={editingItem.type}
                onChange={(t) => setEditingItem({ ...editingItem, type: t })}
                existingCategories={allDistinctTypes.length > 0 ? allDistinctTypes : ['game', 'movie', 'anime', 'book', 'podcast']}
                label="Media Type / Category"
                helperText="Select an existing type or type any custom type (e.g. Manga, Podcast, VR Experience)."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Author / Director / Studio</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Christopher Nolan, CD Projekt RED"
                    value={editingItem.creator}
                    onChange={(e) => setEditingItem({ ...editingItem, creator: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Rating Score (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    required
                    value={editingItem.rating_score}
                    onChange={(e) => setEditingItem({ ...editingItem, rating_score: parseFloat(e.target.value) || 9.0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Cover Media Uploader */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Cover Artwork Poster</span>
                </label>
                <MediaUploader
                  value={editingItem.cover_url}
                  onChange={(url) => setEditingItem({ ...editingItem, cover_url: url })}
                  label="Upload Artwork Poster"
                  folder="mahios/entertainment"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Review & Impact</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Review summary of the world-building, mechanics, or narrative impact..."
                  value={editingItem.review_summary}
                  onChange={(e) => setEditingItem({ ...editingItem, review_summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Memorable Quote (Optional)</label>
                <input
                  type="text"
                  placeholder='e.g. "Do not go gentle into that good night."'
                  value={editingItem.favorite_quote || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, favorite_quote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 italic"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Media Work'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
