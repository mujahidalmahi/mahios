'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Calendar, MapPin,
  ExternalLink, Sparkles, ArrowUp, ArrowDown, Eye, Layers, Image as ImageIcon
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import { Experience } from '@/types/database';

export default function ExperienceAdminPage() {
  const [experiences, setExperiences] = useState<Experience[]>(fallbackBiographyData.experiences);
  const [loading, setLoading] = useState(true);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Deliverables & Tech Tag inputs
  const [newAchievement, setNewAchievement] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          setExperiences(data as Experience[]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const distinctTypes = Array.from(new Set(experiences.map((e) => e.employment_type).filter(Boolean)));
  const filteredExperiences = typeFilter === 'all'
    ? experiences
    : experiences.filter((e) => e.employment_type === typeFilter);

  const openNew = () => {
    setIsNew(true);
    setEditingExp({
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: 'Remote / Dhaka, Bangladesh',
      employment_type: 'Full-time',
      start_date: '2025',
      end_date: 'Present',
      is_current: true,
      description_html: '<p>Spearheaded system architecture and web performance optimizations.</p>',
      achievements: [
        'Architected high-throughput full-stack Next.js web application.',
        'Reduced 99th percentile API latency by 45% with Redis caching.',
      ],
      technologies: ['Next.js 16', 'TypeScript', 'Supabase', 'Tailwind CSS 4'],
      company_url: 'https://example.com',
      logo_url: '',
      sort_order: experiences.length + 1,
    });
  };

  const openEdit = (exp: Experience) => {
    setIsNew(false);
    setEditingExp({ ...exp });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career experience entry?')) return;
    try {
      await adminMutate<Experience>({
        table: 'experiences',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    setFeedback({ type: 'success', text: 'Experience deleted successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    setSaving(true);

    if (isNew) {
      setExperiences((prev) => [...prev, editingExp]);
    } else {
      setExperiences((prev) => prev.map((e) => (e.id === editingExp.id ? editingExp : e)));
    }

    try {
      await adminMutate<Experience>({
        table: 'experiences',
        action: 'upsert',
        data: editingExp,
      });
    } catch {
      // Local fallback
    }

    setEditingExp(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Experience at "${editingExp.company}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim() || !editingExp) return;
    setEditingExp({
      ...editingExp,
      achievements: [...(editingExp.achievements || []), newAchievement.trim()],
    });
    setNewAchievement('');
  };

  const handleRemoveAchievement = (idx: number) => {
    if (!editingExp) return;
    setEditingExp({
      ...editingExp,
      achievements: editingExp.achievements.filter((_, i) => i !== idx),
    });
  };

  const handleAddTech = () => {
    if (!newTech.trim() || !editingExp) return;
    const clean = newTech.trim();
    if (!editingExp.technologies.includes(clean)) {
      setEditingExp({
        ...editingExp,
        technologies: [...(editingExp.technologies || []), clean],
      });
    }
    setNewTech('');
  };

  const handleRemoveTech = (tag: string) => {
    if (!editingExp) return;
    setEditingExp({
      ...editingExp,
      technologies: editingExp.technologies.filter((t) => t !== tag),
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;

    const newExp = [...experiences];
    const temp = newExp[index];
    newExp[index] = newExp[targetIdx];
    newExp[targetIdx] = temp;

    const updated = newExp.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setExperiences(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<Experience>({
          table: 'experiences',
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
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>Career Experience Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Manage your engineering positions, company logos, key achievements, tech stacks, and live card previews.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Career Role</span>
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

      {/* Employment Type Filter Pills & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter Role Type:</span>
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
              typeFilter === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({experiences.length})
          </button>
          {distinctTypes.map((t) => {
            const count = experiences.filter((e) => e.employment_type === t).length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing {filteredExperiences.length} of {experiences.length} career positions
        </span>
      </div>

      {/* Experience Cards Stream with Live Card Previews */}
      <div className="space-y-4">
        {filteredExperiences.map((exp, idx) => (
          <div
            key={exp.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-start gap-3.5">
                {/* Company Logo or Fallback */}
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  {exp.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exp.logo_url} alt={exp.company} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Briefcase className="w-6 h-6 text-blue-400" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white">{exp.role}</h3>
                    {exp.is_current && (
                      <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Active Role</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="font-semibold text-blue-400">{exp.company}</span>
                    <span>•</span>
                    <span className="text-slate-400">{exp.employment_type || 'Full-time'}</span>
                    {exp.company_url && (
                      <a href={exp.company_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                        <ExternalLink className="w-3 h-3 inline ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Order and Actions */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{exp.start_date} – {exp.end_date}</span>
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
                    disabled={idx === experiences.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(exp)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                    title="Edit Experience"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                    title="Delete Experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description Preview */}
            <div
              dangerouslySetInnerHTML={{ __html: exp.description_html }}
              className="text-xs text-slate-300 leading-relaxed prose-sm prose-invert max-w-none"
            />

            {/* Key Deliverables Bullet Points */}
            {exp.achievements && exp.achievements.length > 0 && (
              <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Key Deliverables & Milestones:</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 pl-2">
                  {exp.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech Stack Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {exp.technologies?.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-full text-[10px] font-mono"
                >
                  #{tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EXPERIENCE EDIT/CREATE MODAL ==================== */}
      {editingExp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Create New Career Role' : `Edit Role: ${editingExp.role} at ${editingExp.company}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingExp(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Vercel, Supabase"
                    value={editingExp.company}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Job Title / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full-Stack Software Engineer"
                    value={editingExp.role}
                    onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Company Logo Media Uploader */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Company Logo / Brand Badge</span>
                </label>
                <MediaUploader
                  value={editingExp.logo_url}
                  onChange={(url) => setEditingExp({ ...editingExp, logo_url: url })}
                  label="Upload Company Logo"
                  folder="mahios/experience"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <CategoryPicker
                    value={editingExp.employment_type || 'Full-time'}
                    onChange={(t) => setEditingExp({ ...editingExp, employment_type: t })}
                    existingCategories={
                      distinctTypes.length > 0
                        ? distinctTypes
                        : ['Full-time', 'Contract', 'Part-time', 'Internship', 'Co-founder', 'Advisor', 'Freelance']
                    }
                    label="Employment Type / Category"
                    placeholder="Select or type role type..."
                    helperText="Type of work engagement"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote / Dhaka, Bangladesh"
                    value={editingExp.location}
                    onChange={(e) => setEditingExp({ ...editingExp, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Company URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={editingExp.company_url || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, company_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Start Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jan 2024"
                    value={editingExp.start_date}
                    onChange={(e) => setEditingExp({ ...editingExp, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">End Date</label>
                  <input
                    type="text"
                    required
                    disabled={editingExp.is_current}
                    placeholder="e.g. Dec 2025"
                    value={editingExp.is_current ? 'Present' : editingExp.end_date}
                    onChange={(e) => setEditingExp({ ...editingExp, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExp.is_current}
                      onChange={(e) => setEditingExp({
                        ...editingExp,
                        is_current: e.target.checked,
                        end_date: e.target.checked ? 'Present' : editingExp.end_date === 'Present' ? '2026' : editingExp.end_date,
                      })}
                      className="rounded border-slate-700 accent-blue-600"
                    />
                    <span>Currently Active Role</span>
                  </label>
                </div>
              </div>

              {/* Rich TipTap Description */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Role Narrative & Scope (TipTap Rich Text)</span>
                </label>
                <RichTextEditor
                  content={editingExp.description_html}
                  onChange={(html) => setEditingExp({ ...editingExp, description_html: html })}
                  minHeight="160px"
                />
              </div>

              {/* Dynamic Achievements Builder */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="font-semibold text-slate-300 uppercase">Key Deliverables / Achievements</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add specific achievement (e.g. Optimized database query latency by 60%)..."
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAchievement(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {editingExp.achievements?.map((ach, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800 text-slate-200">
                      <span>{ach}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Tech Stack Tags */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="font-semibold text-slate-300 uppercase">Technologies Stack (Chips)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add technology (e.g. Next.js 16, TypeScript, Redis)..."
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {editingExp.technologies?.map((tech, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-200 flex items-center gap-1 font-mono text-[11px]">
                      <span>#{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="text-slate-500 hover:text-red-400 ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Career Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



