'use client';

import React, { useState, useEffect } from 'react';
import {
  Award, Trophy, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Calendar, Sparkles,
  ExternalLink, ArrowUp, ArrowDown, ShieldCheck, Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { Achievement } from '@/types/database';

export default function AchievementsAdminPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(fallbackBiographyData.achievements);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('achievements')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          setAchievements(data as Achievement[]);
        }
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
    setEditingItem({
      id: `ach-${Date.now()}`,
      title: '',
      issuer: '',
      issue_date: '2025',
      description: 'Recognized for engineering excellence, system architecture, and algorithmic design.',
      credential_id: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      certificate_url: '',
      badge_icon: 'Trophy',
      sort_order: achievements.length + 1,
    });
  };

  const openEdit = (ach: Achievement) => {
    setIsNew(false);
    setEditingItem({ ...ach });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await adminMutate<Achievement>({
        table: 'achievements',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    setFeedback({ type: 'success', text: 'Achievement removed.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    if (isNew) {
      setAchievements((prev) => [...prev, editingItem]);
    } else {
      setAchievements((prev) => prev.map((a) => (a.id === editingItem.id ? editingItem : a)));
    }

    try {
      await adminMutate<Achievement>({
        table: 'achievements',
        action: 'upsert',
        data: editingItem,
      });
    } catch {
      // Local fallback
    }

    setEditingItem(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Achievement "${editingItem.title}" saved!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const testConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= achievements.length) return;

    const newAch = [...achievements];
    const temp = newAch[index];
    newAch[index] = newAch[targetIdx];
    newAch[targetIdx] = temp;

    const updated = newAch.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setAchievements(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<Achievement>({
          table: 'achievements',
          action: 'update',
          match: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      });
    } catch {
      // Local fallback
    }
  };

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Achievements & Honors Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Showcase hackathon championships, verified credentials, international honors, and custom celebration particle triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={testConfetti}
            className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Confetti</span>
          </button>

          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement</span>
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

      {/* Achievements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach, idx) => (
          <div
            key={ach.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{ach.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="font-semibold text-amber-400">{ach.issuer}</span>
                    <span>â€¢</span>
                    <span className="text-slate-400 font-mono text-[11px]">{ach.issue_date}</span>
                  </div>
                </div>
              </div>

              {ach.description && (
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {ach.description}
                </p>
              )}

              {ach.credential_id && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/60 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Credential ID: {ach.credential_id}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-500">Order: #{ach.sort_order || idx + 1}</span>

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
                  disabled={idx === achievements.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(ach)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Achievement"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ach.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Achievement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== ACHIEVEMENT EDIT/CREATE MODAL ==================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>{isNew ? 'Create New Achievement' : `Edit: ${editingItem.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Honor / Achievement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon Champion"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Issuing Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IEEE, Google, Microsoft"
                    value={editingItem.issuer}
                    onChange={(e) => setEditingItem({ ...editingItem, issuer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Issue Date / Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. November 2025"
                    value={editingItem.issue_date}
                    onChange={(e) => setEditingItem({ ...editingItem, issue_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Credential ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CERT-982341"
                    value={editingItem.credential_id || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, credential_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Verification URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://verify.org/id"
                    value={editingItem.certificate_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, certificate_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Description & Context</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of the honor, competition standings, and key achievements..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
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
                  <span>{saving ? 'Saving...' : 'Save Achievement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



