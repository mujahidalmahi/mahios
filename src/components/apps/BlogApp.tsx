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
import RetroPagination from '@/components/shared/RetroPagination';
import RetroShareModal from '@/components/shared/RetroShareModal';

interface BlogAppProps {
  posts: BlogPost[];
}

const ITEMS_PER_PAGE = 6;

export default function BlogApp({ posts }: BlogAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSharePost, setActiveSharePost] = useState<BlogPost | null>(null);

  const { openWindow } = useWindowStore();
  const { playSound } = useSystemStore();

  // Filter posts strictly by search query (tags filter removed per user request)
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [posts, searchQuery]);

  // Reset to page 1 whenever search query changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Open blog article in its own separate window in front
  const handleOpenPost = (e: React.MouseEvent, post: BlogPost, index: number) => {
    e.stopPropagation();
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

  return (
    <div className="h-full flex flex-col justify-between text-black font-sans text-xs select-none space-y-2 overflow-hidden">
      {/* Top Search Bar */}
      <div className="bg-[#c0c0c0] retro-box-outset p-2 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1 flex items-center bg-white border-2 border-[#808080] retro-box-inset px-2.5 py-1">
            <Search className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search dev notes by title, topic, or keyword..."
              className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none font-sans"
            />
          </div>

          {/* Telemetry Counter */}
          <div className="flex items-center gap-1 font-mono text-[11px] text-gray-700 shrink-0 px-1">
            <Layers className="w-3.5 h-3.5 text-[#000080]" />
            <span>Showing <strong>{filteredPosts.length}</strong> Notes</span>
          </div>
        </div>
      </div>

      {/* Main Blog Cards Grid */}
      <div className="flex-1 min-h-0 retro-box-inset bg-white p-3 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 font-mono space-y-2">
            <FileText className="w-8 h-8 opacity-40" />
            <p>No dev notes found matching &ldquo;{searchQuery}&rdquo;</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="retro-btn px-2.5 py-1 text-xs text-[#000080] font-bold cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedPosts.map((post, idx) => (
              <div
                key={post.id}
                onClick={(e) => handleOpenPost(e, post, idx)}
                className="retro-box-outset bg-[#d4d0c8] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-white transition-all cursor-pointer group shadow-xs min-w-0"
              >
                <div className="flex gap-2.5 sm:gap-3 items-start min-w-0">
                  {/* Left Side: 1:1 Square Photo */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square shrink-0 bg-black/5 retro-box-inset overflow-hidden relative rounded-2xs">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#000080]">
                        <FileText className="w-6 h-6 opacity-60" />
                      </div>
                    )}
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Metadata Row */}
                    <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono">
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

                    {/* Title */}
                    <h3 className="font-bold text-xs text-black group-hover:text-[#000080] line-clamp-1 leading-snug">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[11px] text-gray-700 line-clamp-2 leading-tight">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar: Tags & Actions */}
                <div className="pt-1.5 mt-2 border-t border-gray-300 flex items-center justify-between gap-1 text-[10px] font-mono">
                  {post.tags && post.tags.length > 0 ? (
                    <div className="flex items-center gap-1 overflow-hidden">
                      {post.tags.slice(0, 2).map((t, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 bg-black/5 border border-gray-400 rounded-2xs text-[9px] text-gray-700 truncate"
                        >
                          #{t}
                        </span>
                      ))}
                      {post.tags.length > 2 && (
                        <span className="text-[9px] text-gray-500 shrink-0">
                          +{post.tags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenPost(e, post, idx)}
                      className="retro-btn px-2 py-0.5 font-bold text-[#000080] flex items-center gap-1 text-[10px] cursor-pointer hover:bg-blue-50"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Read</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playSound('click');
                        setActiveSharePost(post);
                      }}
                      className="retro-btn px-1.5 py-0.5 text-gray-700 flex items-center gap-1 text-[10px] cursor-pointer hover:bg-blue-50 active:retro-btn-pressed"
                      title="Share Note"
                    >
                      <Share2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retro Win95 Pagination Bar (6 Articles Per Page) */}
      <RetroPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredPosts.length}
        itemsPerPage={ITEMS_PER_PAGE}
        itemName="Articles"
      />

      {/* Footer Info */}
      <div className="px-1 flex items-center justify-between text-[11px] text-gray-600 font-mono shrink-0">
        <span>Click any card to open in a separate reading window.</span>
        <span>MahiOS 05 Dev Notes Subsystem</span>
      </div>

      {/* Retro 90s Share Dialog */}
      {activeSharePost && (
        <RetroShareModal
          isOpen={!!activeSharePost}
          onClose={() => setActiveSharePost(null)}
          title={activeSharePost.title}
          summary={activeSharePost.excerpt}
          url={
            typeof window !== 'undefined'
              ? `${window.location.origin}/?app=blog&post=${activeSharePost.slug}`
              : `https://mujahidmahi.me/?app=blog&post=${activeSharePost.slug}`
          }
        />
      )}
    </div>
  );
}
