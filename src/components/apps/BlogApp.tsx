'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText, Clock, Eye, Calendar,
  Search, BookOpen, Share2, Check, Tag, ExternalLink,
  Sparkles, Layers
} from 'lucide-react';
import { BlogPost } from '@/types/database';
import { useWindowStore } from '@/stores/windowStore';
import { useSystemStore } from '@/stores/systemStore';

interface BlogAppProps {
  posts: BlogPost[];
}

export default function BlogApp({ posts }: BlogAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { openWindow } = useWindowStore();
  const { playSound } = useSystemStore();

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => set.add(t));
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  // Filter posts by search query and selected tag
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesTag =
        selectedTag === 'All' ||
        (p.tags && p.tags.includes(selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  // Open blog article in its own separate window
  const handleOpenPost = (post: BlogPost, index: number) => {
    playSound('open');
    openWindow({
      id: `blog-${post.id}`,
      app_id: `blog-${post.id}`,
      title: `${post.title}`,
      icon_name: 'FileText',
      component_key: 'BlogPostReaderApp',
      default_x: 80 + ((index * 25) % 150),
      default_y: 50 + ((index * 25) % 150),
      default_width: 820,
      default_height: 600,
      is_system_app: false,
      is_visible: true,
      sort_order: 99,
      category: 'Dev Notes',
    });
  };

  const handleCopyLink = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    playSound('click');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mujahidmahi.me';
    const url = `${origin}/#note-${post.slug}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col justify-between text-black font-sans text-xs select-none space-y-3 overflow-hidden">
      {/* Top Search & Filter Bar */}
      <div className="bg-[#c0c0c0] retro-box-outset p-2 space-y-2 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1 flex items-center bg-white border-2 border-[#808080] retro-box-inset px-2.5 py-1">
            <Search className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dev notes by title, topic, or keyword..."
              className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none font-sans"
            />
          </div>

          {/* Telemetry Counter */}
          <div className="flex items-center gap-1 font-mono text-[11px] text-gray-700 shrink-0 px-1">
            <Layers className="w-3.5 h-3.5 text-[#000080]" />
            <span>Showing <strong>{filteredPosts.length}</strong> of {posts.length} Notes</span>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-gray-600 uppercase mr-1 shrink-0">Filter:</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedTag(tag);
                }}
                className={`px-2 py-0.5 text-[10px] font-medium rounded-2xs cursor-pointer truncate transition-none ${
                  selectedTag === tag
                    ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]'
                    : 'retro-btn hover:bg-gray-100'
                }`}
              >
                {tag === 'All' ? 'All Topics' : `#${tag}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Blog Cards Grid */}
      <div className="flex-1 min-h-0 retro-box-inset bg-white p-3 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 font-mono space-y-2">
            <FileText className="w-8 h-8 opacity-40" />
            <p>No dev notes found matching &ldquo;{searchQuery}&rdquo;</p>
            {selectedTag !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedTag('All')}
                className="retro-btn px-2.5 py-1 text-xs text-[#000080] font-bold cursor-pointer"
              >
                Reset Tag Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredPosts.map((post, idx) => (
              <div
                key={post.id}
                onClick={() => handleOpenPost(post, idx)}
                className="retro-box-outset bg-[#d4d0c8] p-3 flex flex-col justify-between hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <div className="space-y-2.5">
                  {/* Thumbnail Cover */}
                  {post.cover_image_url ? (
                    <div className="w-full h-36 retro-box-inset bg-black/5 overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 retro-box-inset bg-[#000080]/10 flex items-center justify-center text-[#000080]">
                      <FileText className="w-8 h-8 opacity-60" />
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono border-b border-gray-300 pb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-800" />
                      <span>{post.read_time_minutes} min read</span>
                    </div>
                    {post.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Excerpt */}
                  <div>
                    <h3 className="font-bold text-sm text-black group-hover:text-[#000080] leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-gray-700 mt-1 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.tags.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-black/5 border border-gray-400 rounded-2xs text-[9px] font-mono text-gray-700"
                        >
                          #{t}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-[9px] text-gray-500 font-mono">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 mt-3 border-t border-gray-300 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPost(post, idx);
                    }}
                    className="retro-btn px-2.5 py-1 font-bold text-[#000080] flex items-center gap-1.5 text-xs cursor-pointer hover:bg-blue-50"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, post)}
                    className="retro-btn px-2 py-1 text-gray-700 flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Copy direct link"
                  >
                    {copiedId === post.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3 h-3" />
                        <span>Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-1 flex items-center justify-between text-[11px] text-gray-600 font-mono shrink-0">
        <span>Click any card to open in a separate reading window.</span>
        <span>MahiOS 05 Dev Notes Subsystem</span>
      </div>
    </div>
  );
}
