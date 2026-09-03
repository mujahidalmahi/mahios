'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, ArrowUp, ArrowDown, Heart, Sparkles, Tag
} from 'lucide-react';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { FeedPost } from '@/types/database';

export default function FeedAdminPage() {
  const [posts, setPosts] = useState<FeedPost[]>(fallbackBiographyData.feedPosts);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('feed_posts').select('*').order('sort_order', { ascending: true });
        if (data && data.length > 0) setPosts(data as FeedPost[]);
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
      id: `feed-${Date.now()}`,
      author_name: 'Mujahid Islam Mahi',
      content: '',
      timestamp: 'Just now',
      tag: '#Engineering',
      likes_count: 0,
      sort_order: posts.length + 1,
    });
  };

  const openEdit = (p: FeedPost) => {
    setIsNew(false);
    setEditingPost({ ...p });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this status update?')) return;
    try {
      await adminMutate<FeedPost>({
        table: 'feed_posts',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setFeedback({ type: 'success', text: 'Status update removed.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSaving(true);

    if (isNew) {
      setPosts((prev) => [editingPost, ...prev]);
    } else {
      setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? editingPost : p)));
    }

    try {
      await adminMutate<FeedPost>({
        table: 'feed_posts',
        action: 'upsert',
        data: editingPost,
      });
    } catch {
      // Local fallback
    }

    setEditingPost(null);
    setSaving(false);
    setFeedback({ type: 'success', text: 'Feed post published successfully!' });
    setTimeout(() => setFeedback(null), 3000);
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
        await adminMutate<FeedPost>({
          table: 'feed_posts',
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
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Live Feed & Status Updates Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Publish short-form engineering dispatches, coffee brewing logs, tech breakthroughs, and status updates.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Status Update</span>
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

      {/* Feed Stream */}
      <div className="space-y-3.5">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white">{post.author_name}</span>
                <span className="text-[11px] font-mono text-slate-400">â€¢ {post.timestamp}</span>
                {post.tag && (
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-950 text-cyan-300 border border-slate-800">
                    {post.tag}
                  </span>
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
                  title="Edit Post"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                  title="Delete Post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span className="flex items-center gap-1 text-rose-400">
                <Heart className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400" />
                <span>{post.likes_count} Reactions</span>
              </span>
              <span>Sequence #{post.sort_order || idx + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== EDIT/CREATE MODAL ==================== */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <span>{isNew ? 'New Status Update' : 'Edit Status Update'}</span>
              </h2>
              <button type="button" onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Author Name</label>
                <input
                  type="text"
                  required
                  value={editingPost.author_name}
                  onChange={(e) => setEditingPost({ ...editingPost, author_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Content / Thoughts</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What are you building, thinking, or tinkering with right now?..."
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Hashtag / Topic Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. #Engineering, #Life, #Nextjs16"
                    value={editingPost.tag || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, tag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 uppercase">Timestamp Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Just now, 2 hours ago"
                    value={editingPost.timestamp}
                    onChange={(e) => setEditingPost({ ...editingPost, timestamp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Initial Likes Count</label>
                <input
                  type="number"
                  min="0"
                  value={editingPost.likes_count}
                  onChange={(e) => setEditingPost({ ...editingPost, likes_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
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
                  <span>{saving ? 'Publishing...' : 'Publish Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



