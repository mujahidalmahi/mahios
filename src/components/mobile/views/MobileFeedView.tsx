'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Heart, Share2, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { FeedPost } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileFeedViewProps {
  feedPosts: FeedPost[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileFeedView({ feedPosts = [] }: MobileFeedViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [likes, setLikes] = useState<Record<string, number>>(() =>
    feedPosts.reduce((acc, p) => ({ ...acc, [p.id]: p.likes_count || 0 }), {})
  );
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('mahios_feed_likes') || '{}');
        setUserLiked(saved);
      } catch {}
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(feedPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return feedPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [feedPosts, currentPage]);

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

    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'feed',
        entityId: id,
        action: isLiked ? 'unlike' : 'like',
      }),
    }).catch(() => {});
  };

  const handleShare = (post: FeedPost) => {
    playSound('click');
    if (typeof navigator !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: 'Live Pulse | Mujahid Al Mahi',
          text: post.content,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(`"${post.content}" — Mujahid Al Mahi (${window.location.href})`);
        alert('Post copied to clipboard!');
      }
    }
  };

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Live Pulse Stream ({feedPosts.length})</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {paginatedPosts.map((post) => {
          const isLiked = !!userLiked[post.id];
          const count = likes[post.id] ?? post.likes_count ?? 0;

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shrink-0 flex items-center justify-center">
                  <img
                    src="/images/mahios-logo.png"
                    alt="Mujahid Al Mahi"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Mujahid Al Mahi</h4>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                  <span>{count > 0 ? count : 'Applaud'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShare(post)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  title="Share pulse"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
