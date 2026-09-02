'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { IdeologyPillar } from '@/types/database';

export default function IdeologyAdminPage() {
  const [pillars, setPillars] = useState<IdeologyPillar[]>(fallbackBiographyData.ideologies);
  const [loading, setLoading] = useState(true);
  const [editingPillar, setEditingPillar] = useState<IdeologyPillar | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('ideologies').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setPillars(data as IdeologyPillar[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openNew = () => {
    setIsNew(true);
    setEditingPillar({
      id: `ide-${Date.now()}`,
      title: '',
      subtitle: '',
      summary: '',
      content_html: '<p>Articulate your perspective on tech ethics, open protocols, or human agency...</p>',
      sort_order: pillars.length + 1,
    });
  };

  const openEdit = (p: IdeologyPillar) => {
    setIsNew(false);
    setEditingPillar({ ...p });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ideological pillar?')) return;
    try {
      const supabase = createClient();
      await supabase.from('ideologies').delete().eq('id', id);
    } catch {
      // Local
    }
    setPillars((prev) => prev.filter((p) => p.id !== id));
    setFeedback({ type: 'success', text: 'Pillar deleted.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPillar) return;
    setSaving(true);

    if (isNew) {
      setPillars((prev) => [...prev, editingPillar]);
    } else {
      setPillars((prev) => prev.map((p) => (p.id === editingPillar.id ? editingPillar : p)));
    }

    try {
      const supabase = createClient();
      await supabase.from('ideologies').upsert(editingPillar);
    } catch {
      // Local
    }

    setEditingPillar(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Pillar "${editingPillar.title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pillars.length) return;

    const newPillars = [...pillars];
    const temp = newPillars[index];
    newPillars[index] = newPillars[targetIdx];
    newPillars[targetIdx] = temp;

    const updated = newPillars.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setPillars(updated);

    try {
      const supabase = createClient();
      updated.forEach(async (item) => {
        await supabase.from('ideologies').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Ideologies & Ethics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <span>Ideology & Technological Ethics Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Define your worldview on open-source commons, human agency in AGI, and decentralized web standards.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pillar</span>
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

      {/* Pillars Stream */}
      <div className="space-y-4">
        {pillars.map((pillar, idx) => (
          <div
            key={pillar.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-blue-400 font-medium mt-0.5">{pillar.subtitle}</p>
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
                  disabled={idx === pillars.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(pillar)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Pillar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pillar.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Pillar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              {pillar.summary}
            </p>

            <div
              dangerouslySetInnerHTML={{ __html: pillar.content_html }}
              className="text-xs text-slate-400 leading-relaxed prose-sm prose-invert max-w-none pt-1"
            />
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingPillar && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Create New Ideological Pillar' : `Edit: ${editingPillar.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingPillar(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Pillar Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Open Source Imperative"
                    value={editingPillar.title}
                    onChange={(e) => setEditingPillar({ ...editingPillar, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Subtitle / Axiom</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Knowledge Compounding in Public"
                    value={editingPillar.subtitle}
                    onChange={(e) => setEditingPillar({ ...editingPillar, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Concise Core Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of why this pillar matters for the future of technology..."
                  value={editingPillar.summary}
                  onChange={(e) => setEditingPillar({ ...editingPillar, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* TipTap Rich Text Essay */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Full Essay & Analysis (TipTap Rich Text)</span>
                </label>
                <RichTextEditor
                  content={editingPillar.content_html}
                  onChange={(html) => setEditingPillar({ ...editingPillar, content_html: html })}
                  minHeight="180px"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPillar(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Pillar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
