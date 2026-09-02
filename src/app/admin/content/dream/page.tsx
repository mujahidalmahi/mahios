'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Rocket, Globe
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { DreamItem } from '@/types/database';

export default function DreamAdminPage() {
  const [dreams, setDreams] = useState<DreamItem[]>(fallbackBiographyData.dreams);
  const [loading, setLoading] = useState(true);
  const [editingDream, setEditingDream] = useState<DreamItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [horizonFilter, setHorizonFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('dream_items').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setDreams(data as DreamItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allDistinctHorizons = Array.from(new Set(dreams.map((d) => d.horizon).filter(Boolean)));

  const openNew = () => {
    setIsNew(true);
    setEditingDream({
      id: `drm-${Date.now()}`,
      title: '',
      horizon: allDistinctHorizons[0] || '10-Year Horizon',
      vision_manifesto: '',
      impact_area: 'Human-Computer Symbiosis',
      sort_order: dreams.length + 1,
    });
  };

  const openEdit = (d: DreamItem) => {
    setIsNew(false);
    setEditingDream({ ...d });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vision manifesto?')) return;
    try {
      const supabase = createClient();
      await supabase.from('dream_items').delete().eq('id', id);
    } catch {
      // Local
    }
    setDreams((prev) => prev.filter((d) => d.id !== id));
    setFeedback({ type: 'success', text: 'Vision manifesto deleted.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDream) return;
    setSaving(true);

    if (isNew) {
      setDreams((prev) => [...prev, editingDream]);
    } else {
      setDreams((prev) => prev.map((d) => (d.id === editingDream.id ? editingDream : d)));
    }

    try {
      const supabase = createClient();
      await supabase.from('dream_items').upsert(editingDream);
    } catch {
      // Local
    }

    setEditingDream(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Dream "${editingDream.title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= dreams.length) return;

    const newDreams = [...dreams];
    const temp = newDreams[index];
    newDreams[index] = newDreams[targetIdx];
    newDreams[targetIdx] = temp;

    const updated = newDreams.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setDreams(updated);

    try {
      const supabase = createClient();
      updated.forEach(async (item) => {
        await supabase.from('dream_items').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  const filtered = horizonFilter === 'all'
    ? dreams
    : dreams.filter((d) => d.horizon.toLowerCase() === horizonFilter.toLowerCase());

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Dreamscape Manifestos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Dreamscape & Grand Ambitions Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Total dynamic freedom across all time horizons and impact areas. Articulate visionary bets for humanity.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vision Manifesto</span>
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

      {/* Dynamic Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
        <button
          type="button"
          onClick={() => setHorizonFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            horizonFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Horizons ({dreams.length})
        </button>

        {allDistinctHorizons.map((hor) => (
          <button
            key={hor}
            type="button"
            onClick={() => setHorizonFilter(hor)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 capitalize ${
              horizonFilter.toLowerCase() === hor.toLowerCase()
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {hor.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Dreams Stream */}
      <div className="space-y-4">
        {filtered.map((dream, idx) => (
          <div
            key={dream.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h3 className="text-base font-bold text-white">{dream.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-mono uppercase">
                    {dream.horizon}
                  </span>
                  <span>•</span>
                  <span>Impact Sphere: {dream.impact_area}</span>
                </div>
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
                  disabled={idx === dreams.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(dream)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Vision"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(dream.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Vision"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-indigo-200 leading-relaxed font-medium">
              &ldquo;{dream.vision_manifesto}&rdquo;
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingDream && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>{isNew ? 'Create Vision Manifesto' : `Edit: ${editingDream.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingDream(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Vision Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building Universal Spatial Web Operating Systems"
                  value={editingDream.title}
                  onChange={(e) => setEditingDream({ ...editingDream, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Dynamic Horizon / Category Picker */}
              <CategoryPicker
                value={editingDream.horizon}
                onChange={(h) => setEditingDream({ ...editingDream, horizon: h })}
                existingCategories={allDistinctHorizons.length > 0 ? allDistinctHorizons : ['10-Year Horizon', 'Lifetime Horizon', 'Civilizational Horizon']}
                label="Time Horizon / Category"
                helperText="Select an existing horizon or type any custom horizon (e.g. 5-Year Horizon, 2030-2050)."
              />

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Impact Area / Sphere</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Human-Computer Symbiosis, Planetary Clean Energy"
                  value={editingDream.impact_area}
                  onChange={(e) => setEditingDream({ ...editingDream, impact_area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Vision Manifesto Narrative</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Articulate the bold manifesto and why achieving this changes the trajectory of humanity..."
                  value={editingDream.vision_manifesto}
                  onChange={(e) => setEditingDream({ ...editingDream, vision_manifesto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDream(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Vision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
