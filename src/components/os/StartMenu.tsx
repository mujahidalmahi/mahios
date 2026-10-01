'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  RotateCcw, Power, Search, X, Newspaper, BookOpen, FileText, Monitor
} from 'lucide-react';
import { useWindowStore } from '@/stores/windowStore';
import { useBootStore } from '@/stores/bootStore';
import { useSystemStore } from '@/stores/systemStore';
import { DesktopApp, BiographyMilestone, BlogPost } from '@/types/database';
import { getAppIcon } from '@/lib/utils/appIcons';
import VintageOsIcon from './VintageOsIcon';


interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  apps: DesktopApp[];
  milestones?: BiographyMilestone[];
  blogPosts?: BlogPost[];
}

export default function StartMenu({
  isOpen,
  onClose,
  apps,
  milestones = [],
  blogPosts = [],
}: StartMenuProps) {
  const { openWindow } = useWindowStore();
  const { startBoot } = useBootStore();
  const { playSound } = useSystemStore();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [shutdownDialogOpen, setShutdownDialogOpen] = useState(false);
  const [shutdownMode, setShutdownMode] = useState<'shutdown' | 'restart'>('shutdown');
  const [isSafeToTurnOff, setIsSafeToTurnOff] = useState(false);

  const handleConfirmShutdown = () => {
    playSound('click');
    setShutdownDialogOpen(false);
    if (shutdownMode === 'shutdown') {
      playSound('close');
      setIsSafeToTurnOff(true);
    } else if (shutdownMode === 'restart') {
      playSound('boot');
      startBoot();
    }
  };

  const handlePowerBackOn = () => {
    setIsSafeToTurnOff(false);
    playSound('boot');
    startBoot();
  };

  // Auto-focus search input when start menu opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        // Only close if click was not on the start button itself
        const target = e.target as HTMLElement;
        if (!target.closest('button[data-start-btn="true"]')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filtered applications based on real-time search query and sort_order
  const filteredApps = useMemo(() => {
    const sorted = [...apps].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase().trim();
    return sorted.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.app_id.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q))
    );
  }, [apps, searchQuery]);

  // Filtered biography milestones
  const filteredMilestones = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return milestones.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q) ||
        m.period.toLowerCase().includes(q) ||
        (m.location && m.location.toLowerCase().includes(q)) ||
        (m.key_learning && m.key_learning.toLowerCase().includes(q))
    );
  }, [milestones, searchQuery]);

  // Filtered blog posts / articles
  const filteredBlogPosts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return blogPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [blogPosts, searchQuery]);

  if (!isOpen && !shutdownDialogOpen && !isSafeToTurnOff) return null;

  const handleLaunchApp = (app: DesktopApp) => {
    playSound('open');
    openWindow(app);
    onClose();
  };

  const handleLaunchMilestone = (milestone: BiographyMilestone, idx: number) => {
    playSound('open');
    openWindow({
      id: `milestone-${milestone.id}`,
      app_id: `milestone-${milestone.id}`,
      title: milestone.title,
      icon_name: 'BookOpen',
      component_key: 'BiographyChapterReaderApp',
      default_x: 75 + ((idx * 25) % 150),
      default_y: 50 + ((idx * 25) % 150),
      default_width: 740,
      default_height: 560,
      is_system_app: false,
      is_visible: true,
      sort_order: 99,
      category: 'Biography',
    });
    onClose();
  };

  const handleLaunchPost = (post: BlogPost, idx: number) => {
    playSound('open');
    openWindow({
      id: `blog-${post.id}`,
      app_id: `blog-${post.id}`,
      title: post.title,
      icon_name: 'FileText',
      component_key: 'BlogPostReaderApp',
      default_x: 75 + ((idx * 25) % 150),
      default_y: 50 + ((idx * 25) % 150),
      default_width: 760,
      default_height: 580,
      is_system_app: false,
      is_visible: true,
      sort_order: 99,
      category: 'Articles',
    });
    onClose();
  };

  const hasAnyResults =
    filteredApps.length > 0 ||
    filteredMilestones.length > 0 ||
    filteredBlogPosts.length > 0;

  return (
    <>
      {isOpen && (
        <div
          ref={menuRef}
          data-start-menu="true"
          style={{ bottom: '32px' }}
          className="absolute left-0 z-[950] retro-box-outset bg-[#c0c0c0] flex shadow-2xl overflow-hidden select-none w-80 h-[500px] max-h-[calc(100vh-42px)] text-black text-xs font-sans border-2 border-white"
        >
      {/* 90s Vertical Banner (MahiOS 05) */}
      <div className="w-8 bg-gradient-to-t from-[#000080] via-[#1084d0] to-[#000080] flex items-center justify-center text-white font-bold font-mono tracking-widest uppercase shrink-0 overflow-hidden select-none">
        <span className="transform -rotate-90 origin-center whitespace-nowrap text-xs font-bold drop-shadow tracking-widest">
          MahiOS 05
        </span>
      </div>

      {/* Main Start Menu Container */}
      <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden">
        {/* Real-time Program & Document Search Bar */}
        <div className="mb-2">
          <div className="relative flex items-center bg-white border-2 border-[#808080] retro-box-inset px-2 py-1">
            <Search className="w-3.5 h-3.5 text-gray-500 shrink-0 mr-1.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps, chapters, articles..."
              className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-black p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1 border border-gray-400 retro-box-inset bg-white/90 p-1">
          {!hasAnyResults ? (
            <div className="p-6 text-center text-gray-400 font-mono text-[11px]">
              No results found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <>
              {/* Apps / Programs */}
              {filteredApps.length > 0 && (
                <div className="space-y-0.5">
                  {searchQuery.trim() && (
                    <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100">
                      Applications ({filteredApps.length})
                    </div>
                  )}
                  {filteredApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleLaunchApp(app)}
                      className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-black"
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <VintageOsIcon appId={app.app_id} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate block font-medium text-xs">{app.title}</span>
                      </div>
                      {searchQuery.trim() && (
                        <span className="text-[9px] font-mono px-1 rounded bg-gray-200 text-gray-700 group-hover:bg-blue-800 group-hover:text-white shrink-0">
                          App
                        </span>
                      )}
                    </button>
                  ))}

                </div>
              )}

              {/* Biography Chapters */}
              {filteredMilestones.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-gray-200">
                  <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 flex items-center justify-between">
                    <span>Biography Chapters ({filteredMilestones.length})</span>
                    <BookOpen className="w-3 h-3 text-blue-700" />
                  </div>
                  {filteredMilestones.map((milestone, idx) => (
                    <button
                      key={milestone.id}
                      type="button"
                      onClick={() => handleLaunchMilestone(milestone, idx)}
                      className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-black"
                    >
                      <div className="w-5 h-5 flex items-center justify-center text-blue-800 group-hover:text-white shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate block font-semibold text-xs">{milestone.title}</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-blue-200 block truncate">
                          {milestone.chapter} • {milestone.period}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-1 rounded bg-blue-100 text-blue-900 group-hover:bg-blue-800 group-hover:text-white shrink-0">
                        Chapter
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Articles / Blog Posts */}
              {filteredBlogPosts.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-gray-200">
                  <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-50 flex items-center justify-between">
                    <span>Articles & Notes ({filteredBlogPosts.length})</span>
                    <Newspaper className="w-3 h-3 text-amber-700" />
                  </div>
                  {filteredBlogPosts.map((post, idx) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => handleLaunchPost(post, idx)}
                      className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-black"
                    >
                      <div className="w-5 h-5 flex items-center justify-center text-amber-800 group-hover:text-white shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate block font-semibold text-xs">{post.title}</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-blue-200 block truncate">
                          {post.excerpt || 'Technical article and notes'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-1 rounded bg-amber-100 text-amber-900 group-hover:bg-blue-800 group-hover:text-white shrink-0">
                        Article
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* System Power Options */}
        <div className="pt-2 mt-2 border-t border-gray-400 space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
              setShutdownDialogOpen(true);
            }}
            className="w-full px-2 py-1.5 flex items-center gap-2.5 hover:bg-[#000080] hover:text-white rounded-xs transition-none text-left cursor-pointer group text-black font-semibold"
          >
            <Power className="w-4 h-4 text-red-700 group-hover:text-white" />
            <span>Shut Down...</span>
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Authentic Windows 95 Shut Down Dialog */}
  {shutdownDialogOpen && (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/35 backdrop-blur-2xs select-none">
      <div className="w-[360px] bg-[#c0c0c0] retro-box-outset p-1 shadow-2xl text-black font-sans">
        {/* Title Bar */}
        <div className="retro-titlebar h-6 px-2 flex items-center justify-between text-xs font-bold mb-3">
          <span className="truncate">Shut Down MahiOS</span>
          <button
            type="button"
            onClick={() => setShutdownDialogOpen(false)}
            className="retro-window-btn cursor-pointer"
            title="Close"
          >
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="px-4 py-2 flex items-start gap-4">
          <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#000080] bg-[#e0e0e0] retro-box-inset">
            <Power className="w-6 h-6 text-red-700 stroke-[2.5]" />
          </div>

          <div className="flex-1 text-xs space-y-2.5">
            <p className="font-semibold text-gray-900">What do you want the computer to do?</p>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="shutdownOption"
                  value="shutdown"
                  checked={shutdownMode === 'shutdown'}
                  onChange={() => setShutdownMode('shutdown')}
                  className="accent-[#000080] cursor-pointer"
                />
                <span>Shut down</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="shutdownOption"
                  value="restart"
                  checked={shutdownMode === 'restart'}
                  onChange={() => setShutdownMode('restart')}
                  className="accent-[#000080] cursor-pointer"
                />
                <span>Restart</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dialog Action Buttons */}
        <div className="p-3 flex items-center justify-end gap-2 border-t border-gray-400 mt-2">
          <button
            type="button"
            onClick={handleConfirmShutdown}
            className="w-18 py-1 retro-btn font-bold text-xs cursor-pointer hover:bg-gray-200"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => setShutdownDialogOpen(false)}
            className="w-18 py-1 retro-btn text-xs cursor-pointer hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Legendary Authentic 'It is now safe to turn off your computer.' Screen */}
  {isSafeToTurnOff && (
    <div
      onClick={handlePowerBackOn}
      onKeyDown={handlePowerBackOn}
      tabIndex={0}
      className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer focus:outline-none"
    >
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-wide text-[#ff9900] [text-shadow:0_0_12px_#ff9900]">
          It&apos;s now safe to turn off your computer.
        </h1>
        <p className="text-xs sm:text-sm font-mono text-[#ffaa33] animate-pulse">
          [ Click anywhere or press any key to restart MahiOS ]
        </p>
      </div>
    </div>
  )}
</>
);
}

