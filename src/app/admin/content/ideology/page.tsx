'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Sparkles, Filter, BookOpen
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { IdeologyPillar } from '@/types/database';

export default function IdeologyAdminPage() {
  const [pillars, setPillars] = useState<IdeologyPillar[]>(fallbackBiographyData.ideologies);
  const [loading, setLoading] = useState(true);
  const [editingPillar, setEditingPillar] = useState<IdeologyPillar | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [domainFilter, setDomainFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id?: string }>({ open: false });

  const isUuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const generateUuid = () => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

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

  const allDistinctDomains = Array.from(
    new Set(pillars.map((p) => p.subtitle).filter(Boolean))
  );

  const openNew = () => {
    setIsNew(true);
    setEditingPillar({
      id: generateUuid(),
      title: '',
      subtitle: allDistinctDomains[0] || 'Technology Ethics & Sovereign Computing',
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
    setPillars((prev) => prev.filter((p) => p.id !== id));
    if (isUuid(id)) {
      const res = await adminMutate<IdeologyPillar>({
        table: 'ideologies',
        action: 'delete',
        match: { id },
      });
      if (!res.success) {
        setFeedback({ type: 'error', text: res.error || 'Failed to remove pillar from database.' });
      } else {
        setFeedback({ type: 'success', text: 'Pillar deleted.' });
      }
    } else {
      setFeedback({ type: 'success', text: 'Pillar removed from local list.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPillar) return;
    setSaving(true);

    const safeId = isUuid(editingPillar.id) ? editingPillar.id : generateUuid();
    const payload = { ...editingPillar, id: safeId };

    if (isNew) {
      setPillars((prev) => [...prev, payload]);
    } else {
      setPillars((prev) => prev.map((p) => (p.id === editingPillar.id ? payload : p)));
    }

    const res = await adminMutate<IdeologyPillar>({
      table: 'ideologies',
      action: 'upsert',
      data: payload,
    });

    setEditingPillar(null);
    setSaving(false);
    if (!res.success) {
      setFeedback({ type: 'error', text: res.error || 'Failed to save pillar to database.' });
    } else {
      setFeedback({ type: 'success', text: `Pillar "${payload.title}" saved successfully!` });
    }
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
      updated.forEach(async (item) => {
        await adminMutate<IdeologyPillar>({
          table: 'ideologies',
          action: 'update',
          match: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      });
    } catch {
      // Local fallback
    }
  };

  const filteredPillars = domainFilter === 'all'
    ? pillars
    : pillars.filter((p) => p.subtitle === domainFilter);

  if (loading) return <SkeletonListPage />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <span>Ideology & Worldview Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curate core philosophical pillars, perspectives on open protocols, technology ethics, and human agency.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Ethical Pillar</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Domain Filter Pills with Item Counters */}
      {allDistinctDomains.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setDomainFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
              domainFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Domains ({pillars.length})
          </button>
          {allDistinctDomains.map((domain) => {
            const count = pillars.filter((p) => p.subtitle === domain).length;
            return (
              <button
                key={domain}
                onClick={() => setDomainFilter(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  domainFilter === domain
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {domain} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* List */}
      {filteredPillars.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No Ideological Pillars Found"
          description="Create your first perspective on technology ethics, open systems, or digital sovereignty."
          actionLabel="Add Ethical Pillar"
          onAction={openNew}
        />
      ) : (
        <div className="space-y-4">
          {filteredPillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-xl p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-800 text-blue-400 font-mono text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                    <span className="inline-block mt-0.5 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                      {pillar.subtitle || 'General Worldview'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === pillars.length - 1}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(pillar)}
                    className="p-1 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors ml-1"
                    title="Edit Pillar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ open: true, id: pillar.id })}
                    className="p-1 text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                    title="Delete Pillar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                {pillar.summary}
              </div>

              {/* Read preview */}
              <div
                className="text-xs text-slate-400 line-clamp-3 prose prose-invert prose-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: pillar.content_html }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>{isNew ? 'New Ethical Pillar' : `Edit Pillar: ${editingPillar.title}`}</span>
              </h2>
              <button
                onClick={() => setEditingPillar(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pillar Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPillar.title}
                    onChange={(e) => setEditingPillar({ ...editingPillar, title: e.target.value })}
                    placeholder="e.g. The Open Source Imperative"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <CategoryPicker
                    label="Domain / Ethical Subtitle"
                    value={editingPillar.subtitle || 'General Worldview'}
                    onChange={(val) => setEditingPillar({ ...editingPillar, subtitle: val })}
                    existingCategories={allDistinctDomains.length > 0 ? allDistinctDomains : ['Technology Ethics & AI', 'Digital Sovereignty & Privacy', 'Open Source Commons', 'Human Agency']}
                    placeholder="Select or enter domain..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Executive Summary</label>
                <textarea
                  rows={2}
                  value={editingPillar.summary}
                  onChange={(e) => setEditingPillar({ ...editingPillar, summary: e.target.value })}
                  placeholder="Concise 1-2 sentence core axiom..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Philosophical Discourse</label>
                <RichTextEditor
                  content={editingPillar.content_html}
                  onChange={(html) => setEditingPillar({ ...editingPillar, content_html: html })}
                  placeholder="Articulate your perspective on tech ethics, open protocols, or human agency..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPillar(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Pillar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title="Delete Ethical Pillar"
        message="Are you sure you want to delete this ideological pillar? This will remove it from the Ideology.sys application."
        confirmLabel="Delete Pillar"
        variant="danger"
        onConfirm={() => {
          if (confirmModal.id) handleDelete(confirmModal.id);
          setConfirmModal({ open: false });
        }}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </div>
  );
}
