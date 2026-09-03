'use client';

import React, { useState } from 'react';
import {
  Clock, Eye, Calendar, Heart, Share2, Check,
  ExternalLink, Printer, Bookmark, Tag, User, BookOpen
} from 'lucide-react';
import { BlogPost } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface BlogPostReaderAppProps {
  post: BlogPost;
}

export default function BlogPostReaderApp({ post }: BlogPostReaderAppProps) {
  const [readingTheme, setReadingTheme] = useState<'normal' | 'sepia' | 'terminal' | 'cyber'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [likes, setLikes] = useState(0);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const { playSound } = useSystemStore();

  const handleLike = () => {
    playSound('success');
    setLikes((prev) => prev + 1);
  };

  const handleToggleBookmark = () => {
    playSound('click');
    setBookmarked((prev) => !prev);
  };

  const handleShare = () => {
    playSound('click');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mujahidmahi.me';
    const url = `${origin}/#note-${post.slug}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    playSound('click');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Ensure all links inside blog content open safely in a new tab
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.href) {
      e.preventDefault();
      e.stopPropagation();
      playSound('open');
      window.open(anchor.href, '_blank', 'noopener,noreferrer');
    }
  };

  const getThemeClasses = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#5f4b32]';
      case 'terminal':
        return 'bg-black text-[#00ff66] font-mono selection:bg-[#00ff66] selection:text-black';
      case 'cyber':
        return 'bg-[#0a0f1d] text-[#38bdf8] font-mono selection:bg-[#38bdf8] selection:text-black';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm';
      case 'lg':
        return 'text-base sm:text-lg';
      default:
        return 'text-sm sm:text-base';
    }
  };

  return (
    <div className={`h-full flex flex-col justify-between overflow-hidden select-text ${getThemeClasses()}`}>
      {/* Top Reader Toolbar */}
      <div className="bg-[#c0c0c0] retro-box-outset p-2 flex flex-wrap items-center justify-between gap-2 text-black font-sans text-xs shrink-0 select-none border-b border-gray-400">
        {/* Left: Theme Switcher */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-600 uppercase mr-1">Theme:</span>
          {(['normal', 'sepia', 'terminal', 'cyber'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                playSound('click');
                setReadingTheme(t);
              }}
              className={`px-2 py-0.5 text-[10px] capitalize cursor-pointer ${
                readingTheme === t ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]' : 'retro-btn'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Center: Font Size Controls */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-gray-600 uppercase mr-1">Font:</span>
          {(['sm', 'base', 'lg'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                playSound('click');
                setFontSize(s);
              }}
              className={`px-2 py-0.5 text-[10px] uppercase cursor-pointer ${
                fontSize === s ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]' : 'retro-btn'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Right: Quick Tools (Share, Print) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShare}
            className="retro-btn px-2 py-0.5 flex items-center gap-1 text-[11px] font-bold text-[#000080] cursor-pointer"
            title="Copy Direct Article URL"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="retro-btn px-1.5 py-0.5 text-gray-700 cursor-pointer hidden sm:flex items-center gap-1"
            title="Print Article"
          >
            <Printer className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Article Cover Image (if available) */}
        {post.cover_image_url && (
          <div className="w-full max-h-72 retro-box-inset bg-black/10 overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Article Header & Metadata */}
        <div className="border-b border-gray-400/50 pb-4 space-y-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-2xs">
            {post.title}
          </h1>

          {/* Telemetry Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono opacity-85">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold">Mujahid Al Mahi</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.read_time_minutes} min read</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views_count + likes} views</span>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Tag Pills */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Tag className="w-3 h-3 opacity-60 mr-0.5" />
              {post.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 retro-box-outset bg-[#d4d0c8] text-black text-[10px] font-mono font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Formatted HTML Article Content with Safe Hyperlinks */}
        <div
          onClick={handleContentClick}
          dangerouslySetInnerHTML={{ __html: post.content_html }}
          className={`prose prose-sm sm:prose max-w-none leading-relaxed space-y-3 ${getFontSizeClasses()} [&_a]:text-blue-600 [&_a]:underline [&_a]:font-bold [&_a]:cursor-pointer [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_code]:bg-black/10 [&_code]:px-1 [&_code]:rounded-xs [&_code]:font-mono`}
        />

        {/* Interactive Bottom Bar */}
        <div className="pt-6 border-t border-gray-400/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className="retro-btn px-3 py-1 font-bold text-red-700 flex items-center gap-1.5 cursor-pointer hover:bg-red-50"
            >
              <Heart className="w-4 h-4 fill-red-600 text-red-600" />
              <span>Applaud ({likes})</span>
            </button>

            <button
              type="button"
              onClick={handleToggleBookmark}
              className="retro-btn px-3 py-1 font-bold text-amber-800 flex items-center gap-1.5 cursor-pointer hover:bg-amber-50"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="retro-btn px-3 py-1 font-bold text-[#000080] flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
