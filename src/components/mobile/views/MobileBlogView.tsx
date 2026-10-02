'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText, Calendar, Clock, ChevronLeft, ChevronRight,
  Eye, Share2, BookOpen, Heart, Printer, Search, Sparkles, Check
} from 'lucide-react';
import { BlogPost } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { parseBlogReactions } from '@/lib/data/blogReactions';
import { printDocument } from '@/lib/utils/printDocument';

interface MobileBlogViewProps {
  posts: BlogPost[];
  initialPostId?: string;
}

const ITEMS_PER_PAGE = 6;

export default function MobileBlogView({ posts = [], initialPostId }: MobileBlogViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<BlogPost | null>(() => {
    if (initialPostId) {
      return posts.find((p) => p.id === initialPostId || p.slug === initialPostId) || null;
    }
    return null;
  });

  // Reader state
  const [readingTheme, setReadingTheme] = useState<'normal' | 'sepia' | 'terminal' | 'cyber'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [applauseCount, setApplauseCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingApplauseRef = useRef(0);

  // Initialize reader when activePost changes
  useEffect(() => {
    if (!activePost) return;

    const parsed = parseBlogReactions(activePost.content_html);
    const baseApplause = parsed.applause > 0
      ? parsed.applause
      : Math.max(32, Math.floor((activePost.views_count || 100) * 0.05));

    let initialApplause = baseApplause;
    if (typeof window !== 'undefined') {
      const stored = parseInt(localStorage.getItem(`mahios_blog_applause_${activePost.id}`) || '0', 10);
      if (stored > 0) initialApplause = Math.max(initialApplause, stored);
    }
    setApplauseCount(initialApplause);
    setViewsCount(activePost.views_count || 1);

    // Track persistent view
    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType: 'blog_view', entityId: activePost.id }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.views_count) {
          setViewsCount(res.views_count);
        }
      })
      .catch(() => {});
  }, [activePost]);

  const handleApplause = () => {
    if (!activePost) return;
    playSound('success');

    setApplauseCount((prev) => {
      const next = prev + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(`mahios_blog_applause_${activePost.id}`, String(next));
      }
      return next;
    });
    pendingApplauseRef.current += 1;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const countToSend = pendingApplauseRef.current;
      pendingApplauseRef.current = 0;

      fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'blog', entityId: activePost.id, count: countToSend }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && typeof res.applause === 'number' && !res.isLocal) {
            setApplauseCount((current) => {
              const best = Math.max(current, res.applause);
              if (typeof window !== 'undefined') {
                localStorage.setItem(`mahios_blog_applause_${activePost.id}`, String(best));
              }
              return best;
            });
          }
        })
        .catch(() => {});
    }, 500);
  };

  const handleShare = () => {
    if (!activePost) return;
    playSound('click');
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?app=blog&post=${activePost.slug}`
      : `https://mujahidmahi.me/?app=blog&post=${activePost.slug}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: activePost.title,
        text: activePost.excerpt || activePost.title,
        url: shareUrl,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handlePrint = () => {
    if (!activePost) return;
    playSound('click');
    printDocument({
      title: activePost.title,
      categoryBadge: 'Dev Notes & Articles',
      subtitle: activePost.excerpt,
      periodOrDate: activePost.published_at || 'Recent Note',
      contentHtml: activePost.content_html,
      tags: activePost.tags,
      author: 'Mujahid Al Mahi',
      footerNote: 'Published on MahiOS by Mujahid Al Mahi',
    });
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sorted = [...posts].sort((a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0));
    if (!q) return sorted;
    return sorted.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reader View
  if (activePost) {
    const themeStyles = {
      normal: 'bg-white text-slate-900 border-slate-200',
      sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e6d3af]',
      terminal: 'bg-[#0f172a] text-[#34d399] border-[#1e293b]',
      cyber: 'bg-[#090d16] text-[#38bdf8] border-[#1e293b]',
    }[readingTheme];

    const fontSizeClass = {
      sm: 'text-xs',
      base: 'text-sm',
      lg: 'text-base',
    }[fontSize];

    return (
      <div className="space-y-3 pb-6 flex flex-col min-h-full">
        {/* Reader Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActivePost(null);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 xs:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 active:scale-95 transition-all cursor-pointer min-h-[36px]"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Articles</span>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Theme switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
              {(['normal', 'sepia', 'terminal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReadingTheme(t)}
                  className={`px-1.5 xs:px-2 py-1 rounded capitalize ${
                    readingTheme === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {t === 'terminal' ? 'Term' : t}
                </button>
              ))}
            </div>

            {/* Font size switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
              {(['sm', 'base', 'lg'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFontSize(s)}
                  className={`px-1.5 xs:px-2 py-1 rounded uppercase ${
                    fontSize === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  {s === 'sm' ? 'A' : s === 'base' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* Print & Share */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer active:scale-95"
              title="Print Article"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer active:scale-95"
              title="Share Article"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Article Body Container */}
        <article className={`rounded-2xl p-3.5 xs:p-5 border shadow-2xs space-y-4 transition-colors break-words overflow-hidden ${themeStyles}`}>
          {/* Metadata */}
          <div className="space-y-1.5 border-b pb-3 border-current/10">
            <div className="flex items-center gap-2 text-[11px] font-mono opacity-70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {activePost.published_at || 'Recent'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activePost.read_time_minutes || 5}m read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {viewsCount} views
              </span>
            </div>

            <h1 className="text-lg font-black leading-snug tracking-tight">
              {activePost.title}
            </h1>

            {activePost.excerpt && (
              <p className="text-xs italic opacity-85 pt-1">
                &ldquo;{activePost.excerpt}&rdquo;
              </p>
            )}
          </div>

          {activePost.cover_image_url && (
            <div className="w-full h-44 rounded-xl overflow-hidden bg-black/5 border border-current/10">
              <img
                src={activePost.cover_image_url}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rendered HTML */}
          <div
            className={`leading-relaxed space-y-3 tiptap-editor-content break-words overflow-x-auto max-w-full ${fontSizeClass}`}
            dangerouslySetInnerHTML={{ __html: parseBlogReactions(activePost.content_html).cleanContentHtml }}
          />

          {/* Tags */}
          {activePost.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-current/10">
              {activePost.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-black/5 text-[10px] font-mono font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Applause Button */}
          <div className="pt-4 border-t border-current/10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleApplause}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Applause ({applauseCount})</span>
            </button>

            <span className="text-[11px] font-mono opacity-60">
              MahiOS Articles
            </span>
          </div>
        </article>
      </div>
    );
  }

  // Articles List View
  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-xs font-bold text-slate-800 tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Dev Notes & Articles ({filteredPosts.length})</span>
          </div>
          <div className="text-[10px] text-slate-500">Insights, systems engineering & tech thoughts</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search articles, topics, or tags..."
          className="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Posts list */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No articles found matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
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

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                  <span>Read note</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>

                {post.tags?.length > 0 && (
                  <div className="flex items-center gap-1">
                    {post.tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[10px] text-slate-400 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed min-h-[38px]"
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
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed min-h-[38px]"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
