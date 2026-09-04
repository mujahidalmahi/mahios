'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Calendar, Award,
  ExternalLink, Sparkles, ArrowUp, ArrowDown, Image as ImageIcon
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { Education } from '@/types/database';

export default function EducationAdminPage() {
  const [educationList, setEducationList] = useState<Education[]>(fallbackBiographyData.education);
  const [loading, setLoading] = useState(true);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Activity Input
  const [newActivity, setNewActivity] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('education')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          setEducationList(data as Education[]);
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
    setEditingEdu({
      id: `edu-${Date.now()}`,
      institution: '',
      degree: 'Bachelor of Science',
      field_of_study: 'Computer Science & Engineering',
      start_year: '2022',
      end_year: '2026',
      grade: 'Distinction / Magna Cum Laude',
      description_html: '<p>Focused on distributed systems, algorithms, compiler design, and software architecture.</p>',
      activities: ['Competitive Programming Team Leader', 'President of Computing Society'],
      logo_url: '',
      certificate_url: '',
      sort_order: educationList.length + 1,
    });
  };

  const openEdit = (edu: Education) => {
    setIsNew(false);
    setEditingEdu({ ...edu });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    try {
      await adminMutate<Education>({
        table: 'education',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setEducationList((prev) => prev.filter((e) => e.id !== id));
    setFeedback({ type: 'success', text: 'Education entry removed.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu) return;
    setSaving(true);

    if (isNew) {
      setEducationList((prev) => [...prev, editingEdu]);
    } else {
      setEducationList((prev) => prev.map((e) => (e.id === editingEdu.id ? editingEdu : e)));
    }

    try {
      await adminMutate<Education>({
        table: 'education',
        action: 'upsert',
        data: editingEdu,
      });
    } catch {
      // Local fallback
    }

    setEditingEdu(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Education at "${editingEdu.institution}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddActivity = () => {
    if (!newActivity.trim() || !editingEdu) return;
    setEditingEdu({
      ...editingEdu,
      activities: [...(editingEdu.activities || []), newActivity.trim()],
    });
    setNewActivity('');
  };

  const handleRemoveActivity = (idx: number) => {
    if (!editingEdu) return;
    setEditingEdu({
      ...editingEdu,
      activities: editingEdu.activities.filter((_, i) => i !== idx),
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= educationList.length) return;

    const newEdu = [...educationList];
    const temp = newEdu[index];
    newEdu[index] = newEdu[targetIdx];
    newEdu[targetIdx] = temp;

    const updated = newEdu.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setEducationList(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<Education>({
          table: 'education',
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
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Academic Qualifications Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage university degrees, institution badges, academic honors, honors GPA, and student leadership milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Degree</span>
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

      {/* Education Cards */}
      <div className="space-y-4">
        {educationList.map((edu, idx) => (
          <div
            key={edu.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-start gap-3.5">
                {/* Institution Logo */}
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  {edu.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={edu.logo_url} alt={edu.institution} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-blue-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    {edu.degree} in {edu.field_of_study}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="font-semibold text-blue-400">{edu.institution}</span>
                    {edu.grade && (
                      <>
                        <span>â€¢</span>
                        <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 text-[10px]">
                          {edu.grade}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{edu.start_year} â€“ {edu.end_year}</span>
                </span>

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
                    disabled={idx === educationList.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(edu)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                    title="Edit Education"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(edu.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                    title="Delete Education"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {edu.description_html && (
              <div
                dangerouslySetInnerHTML={{ __html: edu.description_html }}
                className="text-xs text-slate-300 leading-relaxed prose-sm prose-invert max-w-none"
              />
            )}

            {/* Activities List */}
            {edu.activities && edu.activities.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  <span>Leadership, Societies & Activities:</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 pl-2">
                  {edu.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ==================== EDUCATION EDIT/CREATE MODAL ==================== */}
      {editingEdu && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Add Academic Qualification' : `Edit: ${editingEdu.degree}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingEdu(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Degree</label>
                  <CategoryPicker
                    value={editingEdu.degree}
                    onChange={(degree) => setEditingEdu({ ...editingEdu, degree })}
                    existingCategories={Array.from(new Set(educationList.map((e) => e.degree).filter(Boolean)))}
                    placeholder="Select or enter degree..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Field of Study / Major</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={editingEdu.field_of_study}
                    onChange={(e) => setEditingEdu({ ...editingEdu, field_of_study: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Institution / University</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Dhaka"
                    value={editingEdu.institution}
                    onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Grade / Honors GPA Distinction</label>
                  <input
                    type="text"
                    placeholder="e.g. CGPA 3.90 / Magna Cum Laude"
                    value={editingEdu.grade || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Institution Logo Media Uploader */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Institution Logo / Crest</span>
                </label>
                <MediaUploader
                  value={editingEdu.logo_url}
                  onChange={(url) => setEditingEdu({ ...editingEdu, logo_url: url })}
                  label="Upload University Logo"
                  folder="mahios/education"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Start Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2022"
                    value={editingEdu.start_year}
                    onChange={(e) => setEditingEdu({ ...editingEdu, start_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">End Year / Expected Graduation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026"
                    value={editingEdu.end_year}
                    onChange={(e) => setEditingEdu({ ...editingEdu, end_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rich TipTap Description */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Coursework & Academic Highlights (TipTap Rich Text)</span>
                </label>
                <RichTextEditor
                  content={editingEdu.description_html || ''}
                  onChange={(html) => setEditingEdu({ ...editingEdu, description_html: html })}
                  minHeight="140px"
                />
              </div>

              {/* Dynamic Activities Builder */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="font-semibold text-slate-300 uppercase">Leadership, Societies & Activities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add student leadership or activity (e.g. ACM ICPC Regional Finalist)..."
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddActivity(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {editingEdu.activities?.map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <span>â€¢ {act}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(idx)}
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
                  onClick={() => setEditingEdu(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Academic Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



