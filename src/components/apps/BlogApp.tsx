'use client';

import React, { useState } from 'react';
import {
  FileText, Clock, Eye, Calendar,
  Search, Heart, Share2, Check, Bookmark,
  BookOpen, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { BlogPost } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface BlogAppProps {
  posts: BlogPost[];
}

export default function BlogApp({ posts }: BlogAppProps) {
  const [activePost, setActivePost] = useState<BlogPost | null>(posts[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readingTheme, setReadingTheme] = useState<'normal' | 'sepia' | 'terminal'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const { playSound } = useSystemStore();

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleLike = (postId: string) => {
    playSound('success');
    setLikes((prev) => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  const handleToggleBookmark = (postId: string) => {
    playSound('click');
    setBookmarks((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post: BlogPost) => {
    playSound('click');
    const url = `${window.location.origin}/#note-${post.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThemeClass = () => {
    if (readingTheme === 'sepia') return 'bg-[#fbf0d9] text-[#5f4b32]';
    if (readingTheme === 'terminal') return 'bg-black text-[#00ff66] font-mono';
    return 'bg-white text-gray-800';
  };

  const getFontSizeClass = () => {
    if (fontSize === 'base') return 'text-sm';
    if (fontSize === 'lg') return 'text-base';
    return 'text-xs';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full min-h-[400px] text-[#111827] max-w-full overflow-hidden">
      {/* Sidebar: File List & Search */}
      <div className="w-full lg:w-68 bg-[#f3f4f6] retro-box-inset p-2 flex flex-col shrink-0 overflow-y-auto max-h-[180px] lg:max-h-[460px] space-y-2">
        <div className="px-1 py-0.5 text-[11px] font-bold text-gray-700 uppercase border-b border-gray-300 flex items-center justify-between">
          <span>C:\MAHIOS\NOTES\*.TXT</span>
          <span className="text-[10px] font-mono text-gray-500">{filteredPosts.length}</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-1 bg-white retro-box-inset px-1.5 py-0.5 text-xs">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[11px] focus:outline-none"
          />
        </div>

        {/* Posts List */}
        <div className="space-y-1">
          {filteredPosts.map((p) => {
            const isSelected = activePost?.id === p.id;
            const isBookmarked = bookmarks[p.id];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  playSound('click');
                  setActivePost(p);
                }}
                className={`w-full p-2 text-left rounded-xs transition-none cursor-pointer flex items-start gap-2 ${
                  isSelected ? 'bg-[#000080] text-white font-bold' : 'hover:bg-gray-200 text-gray-800'
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-blue-700'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate flex items-center gap-1">
                    <span className="truncate">{p.title}</span>
                    {isBookmarked && <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                    {p.read_time_minutes} min read • {p.views_count + (likes[p.id] || 0)} reads
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Article Viewer Pane */}
      <div className={`flex-1 retro-box-inset p-4 overflow-y-auto space-y-4 flex flex-col justify-between ${getThemeClass()}`}>
        {activePost ? (
          <div className="space-y-4">
            {/* Reading Customizer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300/60 pb-2 text-xs">
              {/* Theme Modes */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Theme:</span>
                {(['normal', 'sepia', 'terminal'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { playSound('click'); setReadingTheme(t); }}
                    className={`retro-btn px-2 py-0.5 text-[10px] capitalize cursor-pointer ${
                      readingTheme === t ? 'retro-btn-pressed font-bold' : ''
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Font:</span>
                {(['sm', 'base', 'lg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { playSound('click'); setFontSize(s); }}
                    className={`retro-btn px-2 py-0.5 text-[10px] uppercase cursor-pointer ${
                      fontSize === s ? 'retro-btn-pressed font-bold' : ''
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            {activePost.cover_image_url && (
              <div className="h-44 bg-gray-100 rounded-xs overflow-hidden border border-gray-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activePost.cover_image_url} alt={activePost.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Header Details */}
            <div className="border-b border-gray-300/60 pb-3 space-y-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#000080] leading-tight">
                {activePost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono opacity-80">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activePost.read_time_minutes} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{activePost.views_count + (likes[activePost.id] || 0)} views</span>
                </div>
                {activePost.published_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(activePost.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {activePost.tags?.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-black/5 border border-gray-300 rounded-2xs text-[10px] font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Article Content */}
            <div
              dangerouslySetInnerHTML={{ __html: activePost.content_html }}
              className={`prose prose-sm max-w-none leading-relaxed ${getFontSizeClass()}`}
            />

            {/* Interactive Feedback & Share Footer */}
            <div className="pt-4 border-t border-gray-300/60 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLike(activePost.id)}
                  className="retro-btn px-2.5 py-1 font-bold text-red-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-red-600" />
                  <span>Applaud ({likes[activePost.id] || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleBookmark(activePost.id)}
                  className="retro-btn px-2.5 py-1 font-bold text-amber-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarks[activePost.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{bookmarks[activePost.id] ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleShare(activePost)}
                className="retro-btn px-2.5 py-1 font-bold text-[#000080] flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-xs">
            Select an article from the left directory to read.
          </div>
        )}
      </div>
    </div>
  );
}
