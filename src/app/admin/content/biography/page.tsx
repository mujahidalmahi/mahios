'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Calendar, MapPin, Sparkles, Loader2
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { BiographyMilestone } from '@/types/database';

export default function BiographyAdminPage() {
  const [chapters, setChapters] = useState<BiographyMilestone[]>(fallbackBiographyData.biographyTimeline);
  const [loading, setLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState<BiographyMilestone | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('biography_milestones').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setChapters(data as BiographyMilestone[]);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const distinctPeriods = Array.from(new Set(chapters.map((c) => c.period).filter(Boolean)));

  const isUuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const generateUuid = () => {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const openNew = () => {
    setIsNew(true);
    setEditingChapter({
      id: generateUuid(),
      chapter: `Chapter ${chapters.length + 1}: The Next Frontier`,
      title: '',
      period: '2026 – Future',
      location: 'Dhaka / Global',
      story_html: '<p>Document this pivotal era of your life, breakthroughs, and memories...</p>',
      key_learning: '',
      sort_order: chapters.length + 1,
    });
  };

  const openEdit = (ch: BiographyMilestone) => {
    setIsNew(false);
    setEditingChapter({ ...ch });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this biography chapter?')) return;
    const res = await adminMutate<BiographyMilestone>({
      table: 'biography_milestones',
      action: 'delete',
      match: { id },
    });
    setChapters((prev) => prev.filter((c) => c.id !== id));
    if (!res.success) {
      setFeedback({ type: 'error', text: res.error || 'Failed to remove chapter from database.' });
    } else {
      setFeedback({ type: 'success', text: 'Chapter removed.' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;
    setSaving(true);

    const safeId = isUuid(editingChapter.id) ? editingChapter.id : generateUuid();
    const payload = { ...editingChapter, id: safeId };

    if (isNew) {
      setChapters((prev) => [...prev, payload]);
    } else {
      setChapters((prev) => prev.map((c) => (c.id === editingChapter.id ? payload : c)));
    }

    const res = await adminMutate<BiographyMilestone>({
      table: 'biography_milestones',
      action: 'upsert',
      data: payload,
    });

    setEditingChapter(null);
    setSaving(false);
    if (!res.success) {
      setFeedback({ type: 'error', text: res.error || 'Failed to save chapter to database.' });
    } else {
      setFeedback({ type: 'success', text: `Chapter "${payload.title}" saved successfully!` });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;

    const newCh = [...chapters];
    const temp = newCh[index];
    newCh[index] = newCh[targetIdx];
    newCh[targetIdx] = temp;

    const updated = newCh.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setChapters(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<BiographyMilestone>({
          table: 'biography_milestones',
          action: 'update',
          match: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      });
    } catch {
      // Local fallback
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const sanitizedChapters = chapters.map((ch, idx) => ({
        ...ch,
        id: isUuid(ch.id) ? ch.id : generateUuid(),
        sort_order: idx + 1,
      }));
      setChapters(sanitizedChapters);

      const promises = sanitizedChapters.map((ch) =>
        adminMutate<BiographyMilestone>({
          table: 'biography_milestones',
          action: 'upsert',
          data: ch,
        })
      );
      const results = await Promise.all(promises);
      const failed = results.find((r) => !r.success);
      if (failed) {
        setFeedback({ type: 'error', text: failed.error || 'Failed to save timeline to database.' });
      } else {
        setFeedback({ type: 'success', text: 'All biography chapters and timeline structure saved successfully!' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Failed to save timeline changes to database.' });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Biography & Life Timeline Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Author and structure your comprehensive multi-decade life timeline, milestones, and personal memoirs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAll}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            title="Save all timeline chapters and chronological structure"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Timeline'}</span>
          </button>

          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Chapter</span>
          </button>
        </div>
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

      {/* Era / Period Filter Pills */}
      {distinctPeriods.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          <button
            type="button"
            onClick={() => setSelectedPeriodFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
              selectedPeriodFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Eras ({chapters.length})
          </button>
          {distinctPeriods.map((period) => {
            const count = chapters.filter((c) => c.period === period).length;
            return (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedPeriodFilter(period)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedPeriodFilter === period
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {period} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Chapters Stream */}
      <div className="space-y-4">
        {chapters
          .filter((c) => selectedPeriodFilter === 'all' || c.period === selectedPeriodFilter)
          .map((ch, idx) => (
          <div
            key={ch.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  {ch.chapter}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{ch.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ch.period}</span>
                  </span>
                  {ch.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ch.location}</span>
                    </span>
                  )}
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
                  disabled={idx === chapters.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(ch)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Chapter"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ch.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: ch.story_html }}
              className="text-xs text-slate-300 leading-relaxed prose-sm prose-invert max-w-none"
            />

            {ch.key_learning && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-emerald-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Key Realization: </strong>
                  <span>{ch.key_learning}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Save Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <div className="text-xs text-slate-400">
          <span className="font-semibold text-white">{chapters.length} Chapters</span> configured in chronological biography timeline.
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving Timeline...' : 'Save Timeline Changes'}</span>
        </button>
      </div>

      {/* ==================== CHAPTER EDIT/CREATE MODAL ==================== */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Create New Biography Chapter' : `Edit: ${editingChapter.chapter}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingChapter(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Chapter Number & Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter I: Origins & Curiosity"
                    value={editingChapter.chapter}
                    onChange={(e) => setEditingChapter({ ...editingChapter, chapter: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Chapter Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Spark: Discovering the Terminal"
                    value={editingChapter.title}
                    onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Timeline Period</label>
                  <CategoryPicker
                    value={editingChapter.period}
                    onChange={(period) => setEditingChapter({ ...editingChapter, period })}
                    existingCategories={distinctPeriods.length > 0 ? distinctPeriods : ['2014 – 2018', '2019 – 2022', '2023 – 2026', '2026 – Future']}
                    placeholder="e.g. 2026 – Future"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka, Bangladesh"
                    value={editingChapter.location}
                    onChange={(e) => setEditingChapter({ ...editingChapter, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Key Learning / Realization</label>
                <input
                  type="text"
                  placeholder="e.g. Curiosity is the ultimate multiplier..."
                  value={editingChapter.key_learning}
                  onChange={(e) => setEditingChapter({ ...editingChapter, key_learning: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* TipTap Rich Story Editor */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Chapter Narrative (TipTap Rich Text)</span>
                </label>
                <RichTextEditor
                  content={editingChapter.story_html}
                  onChange={(html) => setEditingChapter({ ...editingChapter, story_html: html })}
                  minHeight="180px"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Chapter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



