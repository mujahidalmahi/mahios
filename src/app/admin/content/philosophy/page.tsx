'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { PhilosophyItem } from '@/types/database';

export default function PhilosophyAdminPage() {
  const [items, setItems] = useState<PhilosophyItem[]>(fallbackBiographyData.philosophies);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PhilosophyItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('philosophies').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setItems(data as PhilosophyItem[]);
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
      id: `phi-${Date.now()}`,
      title: '',
      axiom: '',
      description: '',
      category: allDistinctCategories[0] || 'engineering',
      icon_name: 'Compass',
      sort_order: items.length + 1,
    });
  };

  const openEdit = (item: PhilosophyItem) => {
    setIsNew(false);
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this principle?')) return;
    try {
      const supabase = createClient();
      await supabase.from('philosophies').delete().eq('id', id);
    } catch {
      // Local
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setFeedback({ type: 'success', text: 'Principle deleted.' });
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
      await supabase.from('philosophies').upsert(editingItem);
    } catch {
      // Local
    }

    setEditingItem(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Principle "${editingItem.title}" saved successfully!` });
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
        await supabase.from('philosophies').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  const filtered = categoryFilter === 'all'
    ? items
    : items.filter((i) => i.category.toLowerCase() === categoryFilter.toLowerCase());

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Philosophy & Guiding Principles Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define your core principles across engineering, product design, life, and leadership with full category freedom.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guiding Principle</span>
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
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Principles ({items.length})
        </button>

        {allDistinctCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 capitalize ${
              categoryFilter.toLowerCase() === cat.toLowerCase()
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono bg-slate-950 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">
                    {item.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{item.title}</h3>
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
                    onClick={() => openEdit(item)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                    title="Edit Principle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                    title="Delete Principle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-indigo-300 font-semibold italic">
                &ldquo;{item.axiom}&rdquo;
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>RANK: #{item.sort_order || idx + 1}</span>
              <span className="text-indigo-400 font-bold">â˜… Active Principle</span>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <span>{isNew ? 'Add Guiding Principle' : `Edit: ${editingItem.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Principle Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Simplicity Over Complexity"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Dynamic Category Picker */}
              <CategoryPicker
                value={editingItem.category}
                onChange={(cat) => setEditingItem({ ...editingItem, category: cat })}
                existingCategories={allDistinctCategories.length > 0 ? allDistinctCategories : ['engineering', 'design', 'life', 'career']}
                label="Domain / Category"
                helperText="Select an existing domain or type any custom domain (e.g. Architecture, Leadership)."
              />

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Core Rule / One-Liner Statement</label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "Clean, explicit code with well-defined boundaries always wins."'
                  value={editingItem.axiom}
                  onChange={(e) => setEditingItem({ ...editingItem, axiom: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 italic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Detailed Rationale & Real-World Application</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the mental model, why this principle matters, and how you apply it in practice..."
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Principle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



