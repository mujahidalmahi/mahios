'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText, Calendar, Clock, ChevronLeft, ChevronRight,
  Eye, Share2, BookOpen
} from 'lucide-react';
import { BlogPost } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileBlogViewProps {
  posts: BlogPost[];
  initialPostId?: string;
}

const ITEMS_PER_PAGE = 6;

export default function MobileBlogView({ posts = [], initialPostId }: MobileBlogViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [activePost, setActivePost] = useState<BlogPost | null>(() => {
    if (initialPostId) {
      return posts.find((p) => p.id === initialPostId || p.slug === initialPostId) || null;
    }
    return null;
  });

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));
  }, [posts]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    playSound('click');
    if (typeof navigator !== 'undefined') {
      if (navigator.share && activePost) {
        navigator.share({
          title: activePost.title,
          text: activePost.excerpt || activePost.title,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert('Article link copied to clipboard!');
      }
    }
  };

  if (activePost) {
    return (
      <div className="space-y-4 pb-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActivePost(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>All Articles</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <article className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {activePost.published_at || 'Recent'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {activePost.read_time_minutes || 5} min read
              </span>
            </div>

            <h1 className="text-base font-black text-slate-900 mt-1.5 leading-snug">
              {activePost.title}
            </h1>

            {activePost.excerpt && (
              <p className="text-xs text-slate-600 font-medium italic mt-1.5 pb-2 border-b border-slate-100">
                &ldquo;{activePost.excerpt}&rdquo;
              </p>
            )}
          </div>

          {activePost.cover_image_url && (
            <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={activePost.cover_image_url}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div
            className="text-xs text-slate-800 leading-relaxed space-y-3 pt-2 tiptap-editor-content"
            dangerouslySetInnerHTML={{ __html: activePost.content_html || '' }}
          />

          {activePost.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-3 border-t border-slate-100">
              {activePost.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Dev Notes & Articles ({sortedPosts.length})
      </div>

      <div className="space-y-2.5">
        {paginatedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => {
              playSound('open');
              setActivePost(post);
            }}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.published_at || 'Recent'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.read_time_minutes || 5} min read
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>

            {post.excerpt && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                <span>Read note</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>

              {post.tags?.length > 0 && (
                <div className="flex items-center gap-1">
                  {post.tags.slice(0, 2).map((t, i) => (
                    <span key={i} className="text-[10px] text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
