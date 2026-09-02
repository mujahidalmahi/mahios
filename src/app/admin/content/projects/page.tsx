'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderGit2, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ExternalLink, Star,
  Search, Eye, ArrowUp, ArrowDown, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { GithubIcon } from '@/components/shared/Icons';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { Project } from '@/types/database';

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>(fallbackBiographyData.projects);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Tag Input
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('projects')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          setProjects(data as Project[]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const distinctCategories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));

  const openNew = () => {
    setIsNew(true);
    setEditingProject({
      id: `proj-${Date.now()}`,
      title: '',
      slug: '',
      summary: '',
      description_html: '<p>Engineered a high-performance web architecture with modern full-stack capabilities.</p>',
      thumbnail_url: '',
      images: [],
      tags: ['Next.js 16', 'TypeScript', 'Supabase'],
      category: 'Full-Stack Web Systems',
      live_url: 'https://example.com',
      github_url: 'https://github.com/mujahidmahi',
      featured: true,
      sort_order: projects.length + 1,
    });
  };

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const openEdit = (p: Project) => {
    setIsNew(false);
    setEditingProject({ ...p });
  };

  const performDelete = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('projects').delete().eq('id', id);
    } catch {
      // Local
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setFeedback({ type: 'success', text: 'Project deleted successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSaving(true);

    const autoSlug = editingProject.slug.trim() || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload: Project = {
      ...editingProject,
      slug: autoSlug,
    };

    if (isNew) {
      setProjects((prev) => [...prev, payload]);
    } else {
      setProjects((prev) => prev.map((p) => (p.id === payload.id ? payload : p)));
    }

    try {
      const supabase = createClient();
      await supabase.from('projects').upsert(payload);
    } catch {
      // Local
    }

    setEditingProject(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Project "${payload.title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !editingProject) return;
    const clean = newTag.trim();
    if (!editingProject.tags.includes(clean)) {
      setEditingProject({
        ...editingProject,
        tags: [...(editingProject.tags || []), clean],
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      tags: editingProject.tags.filter((t) => t !== tag),
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const newProj = [...projects];
    const temp = newProj[index];
    newProj[index] = newProj[targetIdx];
    newProj[targetIdx] = temp;

    const updated = newProj.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setProjects(updated);

    try {
      const supabase = createClient();
      updated.forEach(async (item) => {
        await supabase.from('projects').update({ sort_order: item.sort_order }).eq('id', item.id);
      });
    } catch {
      // Local
    }
  };

  const allCategories = ['all', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            <span>Projects & Portfolio Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Showcase full-stack web applications, thumbnail screenshots, live demo links, and rich project architecture specs.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
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

      {/* Toolbar & Category Filters */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search projects by title, summary, or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 capitalize ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Projects' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects found"
          description="Create your first software engineering showcase or tweak your category/search filter."
          actionLabel="Add Project"
          onAction={openNew}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p, idx) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group"
          >
            <div>
              {/* Thumbnail Media */}
              <div className="h-44 bg-slate-950 border-b border-slate-800 relative overflow-hidden">
                {p.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <FolderGit2 className="w-10 h-10" />
                  </div>
                )}

                {p.featured && (
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-black" /> Featured
                  </span>
                )}
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md text-blue-300 text-[10px] font-mono rounded">
                  {p.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.summary}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.tags?.slice(0, 4).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                      #{t}
                    </span>
                  ))}
                  {(p.tags?.length || 0) > 4 && (
                    <span className="text-[10px] font-mono text-slate-500 self-center">
                      +{p.tags.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {p.live_url && (
                  <a
                    href={p.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-400 p-1"
                    title="Live Demo Link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {p.github_url && (
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white p-1"
                    title="GitHub Repository"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
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
                  disabled={idx === projects.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                  title="Edit Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(p)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* ==================== PROJECT EDIT/CREATE MODAL ==================== */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Create New Project' : `Edit Project: ${editingProject.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next-Gen Cloud Orchestrator"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">URL Slug (Identifier)</label>
                  <input
                    type="text"
                    placeholder="e.g. cloud-orchestrator"
                    value={editingProject.slug}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Universal Dynamic Category Picker */}
              <CategoryPicker
                value={editingProject.category}
                onChange={(cat) => setEditingProject({ ...editingProject, category: cat })}
                existingCategories={distinctCategories}
                label="Project Category Domain"
                helperText="Choose an existing domain or type any custom project category (e.g. AI Agents, Web3 Protocols, Mobile Systems)."
              />

              <div className="pb-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="rounded border-slate-700 accent-amber-500"
                  />
                  <span>Highlight as Featured Project (Starred badge)</span>
                </label>
              </div>

              {/* Thumbnail Media Uploader */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Project Thumbnail & Screenshot</span>
                </label>
                <MediaUploader
                  value={editingProject.thumbnail_url}
                  onChange={(url) => setEditingProject({ ...editingProject, thumbnail_url: url })}
                  label="Upload Project Image"
                  folder="mahios/projects"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Project Short Summary (Card Preview)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise overview of what this system accomplishes..."
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Live System URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={editingProject.live_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/mujahidmahi/repo"
                    value={editingProject.github_url || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Dynamic Tech Stack Tags */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="font-semibold text-slate-300 uppercase">Technologies Stack (Chips)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add technology (e.g. Next.js 16, TypeScript, Supabase, Tailwind CSS 4)..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {editingProject.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-200 flex items-center gap-1 font-mono text-[11px]">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-500 hover:text-red-400 ml-1"
                      >
                        âœ•
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Rich TipTap Specification Editor */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Deep Architectural Specification (TipTap Rich Text)</span>
                </label>
                <RichTextEditor
                  content={editingProject.description_html}
                  onChange={(html) => setEditingProject({ ...editingProject, description_html: html })}
                  minHeight="200px"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.title || 'Project'}"?`}
        message="This project and all its showcase assets will be permanently removed from MahiOS. This action cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={() => {
          if (deleteTarget) {
            performDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}



