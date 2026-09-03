'use client';

import React, { useState, useEffect } from 'react';
import { Radio, Heart, MessageSquare, Send, Sparkles, Clock, Share2, Check } from 'lucide-react';
import { FeedPost } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface FeedAppProps {
  feedPosts: FeedPost[];
}

export default function FeedApp({ feedPosts }: FeedAppProps) {
  const { playSound } = useSystemStore();
  const [likes, setLikes] = useState<Record<string, number>>(() =>
    feedPosts.reduce((acc, p) => ({ ...acc, [p.id]: p.likes_count }), {})
  );
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Restore liked status from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('mahios_feed_likes') || '{}');
        setUserLiked(saved);
      } catch {
        // safety
      }
    }
  }, []);

  const toggleLike = (id: string) => {
    playSound('success');
    const isLiked = !!userLiked[id];
    const newLiked = !isLiked;

    const updatedUserLiked = { ...userLiked, [id]: newLiked };
    setUserLiked(updatedUserLiked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahios_feed_likes', JSON.stringify(updatedUserLiked));
    }

    setLikes((prev) => ({
      ...prev,
      [id]: isLiked ? Math.max(0, (prev[id] || 1) - 1) : (prev[id] || 0) + 1,
    }));

    // Persist real count to Supabase database
    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'feed',
        entityId: id,
        action: isLiked ? 'unlike' : 'like',
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && typeof res.likes_count === 'number') {
          setLikes((prev) => ({ ...prev, [id]: res.likes_count }));
        }
      })
      .catch(() => {});
  };

  const handleShareFeed = (post: FeedPost) => {
    playSound('click');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mujahidmahi.me';
    const text = `"${post.content}" — Mujahid Al Mahi (${origin}/?app=feed)`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-full text-black font-sans">
      {/* Header */}
      <div className="p-3 bg-[#e4e4e4] retro-box-outset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 retro-box-inset bg-emerald-800 text-white flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <span>Live_Feed.dll — Micro-Logs & Status Stream</span>
              <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-mono rounded-2xs">
                ONLINE
              </span>
            </h2>
            <p className="text-[11px] text-gray-600">
              Live engineering thoughts, coffee updates, quick breakthroughs, and system pulses.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono bg-white px-2 py-1 retro-box-inset self-start sm:self-auto">
          {feedPosts.length} Broadcasts
        </span>
      </div>

      {/* Feed Stream */}
      <div className="space-y-3">
        {feedPosts.map((post) => (
          <div
            key={post.id}
            className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#000080] text-white text-[10px] font-bold flex items-center justify-center">
                  M
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{post.author_name}</h3>
                  <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{post.timestamp}</span>
                  </span>
                </div>
              </div>

              {post.tag && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-2xs text-[10px] font-mono font-semibold">
                  {post.tag}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Interaction Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={`px-2.5 py-1 rounded-2xs flex items-center gap-1.5 cursor-pointer transition-all active:retro-btn-pressed select-none ${
                    userLiked[post.id]
                      ? 'bg-rose-100 text-rose-700 retro-box-inset font-bold'
                      : 'bg-[#d4d0c8] text-gray-800 retro-box-outset hover:bg-[#e4e4e4]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${userLiked[post.id] ? 'fill-rose-600 text-rose-600' : 'text-gray-600'}`} />
                  <span className="text-[11px] font-mono">{likes[post.id] || 0}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareFeed(post)}
                  className="px-2 py-1 bg-[#d4d0c8] text-gray-700 retro-box-outset hover:bg-[#e4e4e4] active:retro-btn-pressed rounded-2xs flex items-center gap-1 text-[11px] cursor-pointer select-none"
                  title="Share Broadcast"
                >
                  {copiedId === post.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                  <span>{copiedId === post.id ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-gray-400">
                PULSE_ID: {post.id}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
