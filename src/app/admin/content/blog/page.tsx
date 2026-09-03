'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Clock, Eye, Calendar,
  Sparkles, Search, ArrowUp, ArrowDown, Image as ImageIcon
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { BlogPost } from '@/types/database';
import { adminMutate } from '@/lib/api/adminMutate';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackBiographyData.blogPosts);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Tag
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          setPosts(data as BlogPost[]);
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
    setEditingPost({
      id: `post-${Date.now()}`,
      title: '',
      slug: '',
      excerpt: '',
      content_html: '<h1>Technical Deep Dive</h1><p>Write your engineering insights, architectural decisions, and tutorials here...</p>',
      cover_image_url: '',
      tags: ['Engineering', 'Architecture', 'Next.js'],
      is_published: true,
      published_at: new Date().toISOString().split('T')[0],
      read_time_minutes: 4,
      views_count: 142,
      sort_order: posts.length + 1,
    });
  };

  const openEdit = (p: BlogPost) => {
    setIsNew(false);
    setEditingPost({ ...p });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dev note / article?')) return;
    try {
      await adminMutate<BlogPost>({
        table: 'blog_posts',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setFeedback({ type: 'success', text: 'Article deleted.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSaving(true);

    const autoSlug = editingPost.slug.trim() || editingPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const wordCount = editingPost.content_html.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const computedReadTime = Math.max(1, Math.ceil(wordCount / 180));

    const payload: BlogPost = {
      ...editingPost,
      slug: autoSlug,
      read_time_minutes: computedReadTime,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      setPosts((prev) => [...prev, payload]);
    } else {
      setPosts((prev) => prev.map((p) => (p.id === payload.id ? payload : p)));
    }

    try {
      await adminMutate<BlogPost>({
        table: 'blog_posts',
        action: 'upsert',
        data: payload,
      });
    } catch {
      // Local fallback
    }

    setEditingPost(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Article "${payload.title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddTag = () => {
    if (!newTag.trim() || !editingPost) return;
    const clean = newTag.trim();
    if (!editingPost.tags.includes(clean)) {
      setEditingPost({
        ...editingPost,
        tags: [...(editingPost.tags || []), clean],
      });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      tags: editingPost.tags.filter((t) => t !== tag),
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= posts.length) return;

    const newPosts = [...posts];
    const temp = newPosts[index];
    newPosts[index] = newPosts[targetIdx];
    newPosts[targetIdx] = temp;

    const updated = newPosts.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setPosts(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<BlogPost>({
          table: 'blog_posts',
          action: 'update',
          match: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      });
    } catch {
      // Local fallback
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Articles & Dev Notes Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Author engineering essays, system architecture breakdowns, and tech tutorials with full TipTap rich text.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
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

      {/* Toolbar Search */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 w-full sm:w-96 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search articles by title, excerpt, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">{filteredPosts.length} articles indexed</span>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.map((post, idx) => (
          <div
            key={post.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-lg group"
          >
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {/* Cover Photo (16:9 Ratio) */}
              <div className="w-28 sm:w-32 aspect-video rounded-xl bg-slate-950 border border-slate-800 shrink-0 overflow-hidden relative">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <FileText className="w-7 h-7" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {post.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    post.is_published
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                  }`}>
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.read_time_minutes} min read</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{post.views_count} views</span>
                  </span>
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{post.published_at}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
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
                disabled={idx === posts.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openEdit(post)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                title="Edit Article"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                title="Delete Article"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== ARTICLE EDIT/CREATE MODAL ==================== */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>{isNew ? 'Write New Dev Note / Article' : `Edit: ${editingPost.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Article Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Building Resilient Edge Workflows with Next.js 16"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">URL Slug (Identifier)</label>
                  <input
                    type="text"
                    placeholder="e.g. nextjs-16-edge-workflows"
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Cover Photo Media Uploader */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Cover Photo</span>
                </label>
                <MediaUploader
                  value={editingPost.cover_image_url}
                  onChange={(url) => setEditingPost({ ...editingPost, cover_image_url: url })}
                  label="Upload Article Cover Image"
                  folder="mahios/blog"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Excerpt / Summary Hook</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Engaging summary for preview cards and RSS feeds..."
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Publication Date</label>
                  <input
                    type="date"
                    value={editingPost.published_at || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, published_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Read Views Counter</label>
                  <input
                    type="number"
                    value={editingPost.views_count}
                    onChange={(e) => setEditingPost({ ...editingPost, views_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPost.is_published}
                      onChange={(e) => setEditingPost({ ...editingPost, is_published: e.target.checked })}
                      className="rounded border-slate-700 accent-emerald-500"
                    />
                    <span>Publish live on notes directory</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Tags */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="font-semibold text-slate-300 uppercase">Article Topics (Tags)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag (e.g. Architecture, React, System Design)..."
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
                  {editingPost.tags?.map((tag, idx) => (
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

              {/* TipTap Full Rich Text Editor */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-300 uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Full Article Content (TipTap Rich Text Suite)</span>
                </label>
                <RichTextEditor
                  content={editingPost.content_html}
                  onChange={(html) => setEditingPost({ ...editingPost, content_html: html })}
                  minHeight="320px"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Article'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



