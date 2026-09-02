'use client';

import React, { useState, useEffect } from 'react';
import {
  Star, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { FavouriteItem } from '@/types/database';

export default function FavouritesAdminPage() {
  const [items, setItems] = useState<FavouriteItem[]>(fallbackBiographyData.favourites);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<FavouriteItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('favourite_items').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setItems(data as FavouriteItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allDistinctCategories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));

  const openNew = () => {
    setIsNew(true);
    setEditingItem({
      id: `fav-${Date.now()}`,
      item_name: '',
      category: allDistinctCategories[0] || 'Developer Tools',
      subcategory: '',
      reason: '',
      rating: 10,
      sort_order: items.length + 1,
    });
  };

  const openEdit = (fav: FavouriteItem) => {
    setIsNew(false);
    setEditingItem({ ...fav });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this favourite item?')) return;
    try {
      const supabase = createClient();
      await supabase.from('favourite_items').delete().eq('id', id);
    } catch {
      // Local
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setFeedback({ type: 'success', text: 'Favourite item removed.' });
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
      await supabase.from('favourite_items').upsert(editingItem);
    } catch {
      // Local
    }

    setEditingItem(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Item "${editingItem.item_name}" saved!` });
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
        await supabase.from('favourite_items').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  const filtered = categoryFilter === 'all'
    ? items
    : items.filter((i) => i.category.toLowerCase() === categoryFilter.toLowerCase());

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Favourites Hall of Fame...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Favourites & Hall of Fame Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total dynamic freedom across all categories. Create custom categories, score ratings, and descriptions.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Favourite Item</span>
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
          All Categories ({items.length})
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

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((fav, idx) => (
          <div
            key={fav.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono bg-slate-950 text-blue-300 px-2 py-0.5 rounded border border-slate-800">
                      {fav.category.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-mono text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{fav.rating}/10</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">{fav.item_name}</h3>
                  <p className="text-xs font-mono text-slate-400">{fav.subcategory}</p>
                </div>

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
                    onClick={() => openEdit(fav)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(fav.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {fav.reason}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>ORDER: #{fav.sort_order || idx + 1}</span>
              <span className="text-amber-400 font-bold">★ Hall of Fame</span>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL WITH TOTAL CATEGORY FREEDOM ==================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{isNew ? 'Add Favourite Item' : `Edit: ${editingItem.item_name}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 16, Sony Trinitron CRT, Ethiopian Pour-Over"
                  value={editingItem.item_name}
                  onChange={(e) => setEditingItem({ ...editingItem, item_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Universal Dynamic Category Picker */}
              <CategoryPicker
                value={editingItem.category}
                onChange={(cat) => setEditingItem({ ...editingItem, category: cat })}
                existingCategories={allDistinctCategories}
                label="Category / Domain"
                helperText="Select an existing category or create a brand new custom category name."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Subcategory / Author / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Martin Kleppmann, Holy Panda"
                    value={editingItem.subcategory}
                    onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Score (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    required
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: parseFloat(e.target.value) || 10 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Why It’s Beloved & Impact</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain why this item holds a permanent spot in your personal Hall of Fame..."
                  value={editingItem.reason}
                  onChange={(e) => setEditingItem({ ...editingItem, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  <span>{saving ? 'Saving...' : 'Save Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
