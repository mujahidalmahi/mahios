'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { AimItem } from '@/types/database';

export default function AimAdminPage() {
  const [aims, setAims] = useState<AimItem[]>(fallbackBiographyData.aims);
  const [loading, setLoading] = useState(true);
  const [editingAim, setEditingAim] = useState<AimItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newDeliverable, setNewDeliverable] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('aim_items').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setAims(data as AimItem[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const allDistinctCategories = Array.from(new Set(aims.map((a) => a.category).filter(Boolean)));

  const openNew = () => {
    setIsNew(true);
    setEditingAim({
      id: `aim-${Date.now()}`,
      goal_title: '',
      timeline_target: '2026 – 2027',
      category: allDistinctCategories[0] || 'engineering',
      progress_percentage: 50,
      status: 'in_progress',
      deliverables: ['Define architecture benchmarks', 'Author technical specifications'],
      sort_order: aims.length + 1,
    });
  };

  const openEdit = (a: AimItem) => {
    setIsNew(false);
    setEditingAim({ ...a });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategic goal?')) return;
    try {
      await adminMutate<AimItem>({
        table: 'aim_items',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setAims((prev) => prev.filter((a) => a.id !== id));
    setFeedback({ type: 'success', text: 'Strategic goal deleted.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAim) return;
    setSaving(true);

    if (isNew) {
      setAims((prev) => [...prev, editingAim]);
    } else {
      setAims((prev) => prev.map((a) => (a.id === editingAim.id ? editingAim : a)));
    }

    try {
      await adminMutate<AimItem>({
        table: 'aim_items',
        action: 'upsert',
        data: editingAim,
      });
    } catch {
      // Local fallback
    }

    setEditingAim(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Aim "${editingAim.goal_title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddDeliverable = () => {
    if (!newDeliverable.trim() || !editingAim) return;
    setEditingAim({
      ...editingAim,
      deliverables: [...(editingAim.deliverables || []), newDeliverable.trim()],
    });
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    if (!editingAim) return;
    setEditingAim({
      ...editingAim,
      deliverables: editingAim.deliverables.filter((_, i) => i !== idx),
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= aims.length) return;

    const newAims = [...aims];
    const temp = newAims[index];
    newAims[index] = newAims[targetIdx];
    newAims[targetIdx] = temp;

    const updated = newAims.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setAims(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<AimItem>({
          table: 'aim_items',
          action: 'update',
          match: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      });
    } catch {
      // Local fallback
    }
  };

  const filtered = categoryFilter === 'all'
    ? aims
    : aims.filter((a) => a.category.toLowerCase() === categoryFilter.toLowerCase());

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span>Strategic Aims & Roadmap Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Publish engineering targets, milestone percentages, deadlines, and deliverables with total category freedom.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Strategic Aim</span>
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
          All Domains ({aims.length})
        </button>

        {allDistinctCategories.map((cat) => {
          const count = aims.filter((a) => a.category?.toLowerCase() === cat.toLowerCase()).length;
          return (
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
              {cat.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Aims Stream */}
      <div className="space-y-4">
        {filtered.map((aim, idx) => (
          <div
            key={aim.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{aim.goal_title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    aim.status === 'achieved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : aim.status === 'in_progress'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {aim.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 capitalize">
                    {aim.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Timeline Target: {aim.timeline_target}</p>
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
                  disabled={idx === aims.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(aim)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Aim"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(aim.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Aim"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Execution Progress</span>
                <span className="text-blue-400 font-bold">{aim.progress_percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${aim.progress_percentage}%` }}
                />
              </div>
            </div>

            {/* Deliverables List */}
            {aim.deliverables && aim.deliverables.length > 0 && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Deliverables:</h4>
                <ul className="space-y-1 text-slate-300">
                  {aim.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingAim && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Create Strategic Aim' : `Edit: ${editingAim.goal_title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingAim(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Strategic Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architect a Generational Open-Source Web Framework"
                  value={editingAim.goal_title}
                  onChange={(e) => setEditingAim({ ...editingAim, goal_title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Dynamic Category Picker */}
              <CategoryPicker
                value={editingAim.category}
                onChange={(cat) => setEditingAim({ ...editingAim, category: cat })}
                existingCategories={allDistinctCategories.length > 0 ? allDistinctCategories : ['engineering', 'career', 'intellectual', 'impact']}
                label="Goal Domain / Category"
                helperText="Select an existing domain or type any custom domain (e.g. Robotics, Space Systems)."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Target Timeline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026 – 2027"
                    value={editingAim.timeline_target}
                    onChange={(e) => setEditingAim({ ...editingAim, timeline_target: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Status</label>
                  <select
                    value={editingAim.status}
                    onChange={(e) => setEditingAim({ ...editingAim, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="planning">Planning Phase</option>
                    <option value="in_progress">In Active Progress</option>
                    <option value="achieved">Achieved / Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-300 uppercase">Progress Percentage</label>
                  <span className="font-mono text-blue-400 font-bold">{editingAim.progress_percentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingAim.progress_percentage}
                  onChange={(e) => setEditingAim({ ...editingAim, progress_percentage: parseInt(e.target.value) || 0 })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Dynamic Deliverables Builder */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="font-semibold text-slate-300 uppercase">Milestones / Deliverables</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add deliverable (e.g. Author benchmark suite)..."
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDeliverable(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {editingAim.deliverables?.map((del, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <span>{del}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAim(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Strategic Aim'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



