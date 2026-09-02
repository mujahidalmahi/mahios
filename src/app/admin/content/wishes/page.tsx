'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Sparkles, Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { WishItem } from '@/types/database';

export default function WishesAdminPage() {
  const [wishes, setWishes] = useState<WishItem[]>(fallbackBiographyData.wishes);
  const [loading, setLoading] = useState(true);
  const [editingWish, setEditingWish] = useState<WishItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('wish_items').select('*').order('wish_number', { ascending: true });
        if (data && data.length > 0) setWishes(data as WishItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openEdit = (w: WishItem) => {
    setEditingWish({ ...w });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWish) return;
    setSaving(true);

    const updated = wishes.map((w) => (w.id === editingWish.id ? editingWish : w));
    setWishes(updated);

    try {
      const supabase = createClient();
      await supabase.from('wish_items').upsert(editingWish);
    } catch {
      // Local
    }

    setEditingWish(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Wish #${editingWish.wish_number} updated successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const testWishConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>The 3 Wishes for Humanity Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Articulate your three timeless wishes for the eradication of suffering, energy abundance, and civilizational peace.
          </p>
        </div>

        <button
          type="button"
          onClick={testWishConfetti}
          className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Test Wish Particles</span>
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

      {/* 3 Wishes Cards */}
      <div className="space-y-4">
        {wishes.map((wish) => (
          <div
            key={wish.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                  #{wish.wish_number}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{wish.title}</h3>
                  <span className="text-[10px] font-mono uppercase bg-slate-950 text-amber-400 px-2 py-0.5 rounded border border-slate-800">
                    {wish.category}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openEdit(wish)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Wish #{wish.wish_number}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs text-slate-300">
              <strong className="text-amber-300">Core Intent & Rationale:</strong>
              <p className="leading-relaxed">{wish.deep_reason}</p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1 text-slate-400">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Impact Scope: {wish.impact_scope}</span>
              </span>
              <span className="text-amber-400 font-bold">â˜… Universal Tier</span>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT MODAL ==================== */}
      {editingWish && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Edit Wish #{editingWish.wish_number}</span>
              </h2>
              <button type="button" onClick={() => setEditingWish(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Wish Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eradication of All Neurological Diseases"
                  value={editingWish.title}
                  onChange={(e) => setEditingWish({ ...editingWish, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medicine & Biology"
                    value={editingWish.category}
                    onChange={(e) => setEditingWish({ ...editingWish, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Impact Scope</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global Health & Human Longevity"
                    value={editingWish.impact_scope}
                    onChange={(e) => setEditingWish({ ...editingWish, impact_scope: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Deep Reason & Core Intent</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the profound rationale behind this universal wish..."
                  value={editingWish.deep_reason}
                  onChange={(e) => setEditingWish({ ...editingWish, deep_reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingWish(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Wish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



