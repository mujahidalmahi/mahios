'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderGit2, Search, ExternalLink, Sparkles,
  ChevronLeft, ChevronRight, Star, Eye, Share2,
  Check, Copy, Code2, Tag, Layers, LayoutGrid, List
} from 'lucide-react';
import { GithubIcon } from '@/components/shared/Icons';
import { Project } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import MobilePagination from '../MobilePagination';

interface MobileProjectsViewProps {
  projects: Project[];
  initialProjectId?: string;
}

const ITEMS_PER_PAGE = 6;

export default function MobileProjectsView({ projects = [], initialProjectId }: MobileProjectsViewProps) {
  const { playSound } = useSystemStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');
  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    if (initialProjectId) {
      return projects.find((p) => p.id === initialProjectId || p.slug === initialProjectId) || null;
    }
    return null;
  });

  const [projectStars, setProjectStars] = useState<Record<string, number>>(() =>
    projects.reduce((acc, p) => ({ ...acc, [p.id]: p.stats?.stars || 0 }), {})
  );
  const [userStarred, setUserStarred] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Restore starred status from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('mahios_project_stars') || '{}');
        setUserStarred(saved);
      } catch {}
    }
  }, []);

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playSound('success');
    const isStarred = !userStarred[id];
    const newStarred = isStarred;

    const updated = { ...userStarred, [id]: newStarred };
    setUserStarred(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahios_project_stars', JSON.stringify(updated));
    }

    setProjectStars((prev) => ({
      ...prev,
      [id]: !newStarred ? Math.max(0, (prev[id] || 1) - 1) : (prev[id] || 0) + 1,
    }));

    fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'project',
        entityId: id,
        action: newStarred ? 'star' : 'unstar',
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && typeof res.stars === 'number') {
          setProjectStars((prev) => ({ ...prev, [id]: res.stars }));
        }
      })
      .catch(() => {});
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.sort_order ?? 99) - (b.sort_order ?? 99);
    });
  }, [projects, selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
  };

  const handleShare = (project: Project) => {
    playSound('click');
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/?app=projects&id=${project.slug || project.id}`
      : `https://mujahidmahi.me/?app=projects&id=${project.slug || project.id}`;

    if (typeof navigator !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: `${project.title} | Mujahid Al Mahi`,
          text: project.summary || project.title,
          url,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  // Full Screen Project Details View
  if (activeProject) {
    const isStarred = !!userStarred[activeProject.id];
    const starCount = projectStars[activeProject.id] ?? activeProject.stats?.stars ?? 0;

    return (
      <div className="space-y-4 pb-8 max-w-full animate-fadeIn font-sans">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setActiveProject(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold border border-slate-200 active:scale-95 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span>Back to Projects</span>
          </button>

          <button
            type="button"
            onClick={() => handleShare(activeProject)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>

        {/* Project Detail Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-4">
          {activeProject.thumbnail_url && (
            <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
              <img
                src={activeProject.thumbnail_url}
                alt={activeProject.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  {activeProject.category || 'Engineering'}
                </span>
                {activeProject.featured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Featured</span>
                  </span>
                )}
              </div>

              {/* Star Button */}
              <button
                type="button"
                onClick={(e) => handleToggleStar(activeProject.id, e)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                  isStarred
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>{starCount}</span>
              </button>
            </div>

            <h1 className="text-lg font-black text-slate-900 mt-2 leading-tight">
              {activeProject.title}
            </h1>
            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
              {activeProject.summary}
            </p>
          </div>

          {/* Action Links (Live Demo & Source Code) */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 pt-1">
            {activeProject.live_url ? (
              <a
                href={activeProject.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('open')}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold text-center border border-slate-200">
                Demo Offline
              </div>
            )}

            {activeProject.github_url ? (
              <a
                href={activeProject.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('open')}
                className="py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
              >
                <GithubIcon className="w-3.5 h-3.5 text-white" />
                <span>Source Code</span>
              </a>
            ) : (
              <div className="py-2.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold text-center border border-slate-200">
                Private Repo
              </div>
            )}
          </div>

          {/* System Screenshots Gallery (100% Parity with Project Images) */}
          {activeProject.images && activeProject.images.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Visual Screenshots & Interface ({activeProject.images.length})</span>
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {activeProject.images.map((imgUrl, idx) => (
                  <div key={idx} className="w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                    <img src={imgUrl} alt={`${activeProject.title} screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Narrative & Technical Details */}
          {activeProject.description_html && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Technical Specifications</span>
              </h3>
              <div
                className="text-xs text-slate-700 leading-relaxed space-y-2.5 prose prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: activeProject.description_html }}
              />
            </div>
          )}

          {/* Tags */}
          {activeProject.tags && activeProject.tags.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Technology Stack:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Projects Master List View
  return (
    <div className="space-y-3 pb-8 flex flex-col min-h-full flex-1 font-sans">
      {/* Search Input & Category Pills */}
      <div className="space-y-2">
        <div className="relative flex items-center bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search projects by title, stack, or summary..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Telemetry */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setViewMode('card');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setViewMode('compact');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3 h-3" />
              <span>Compact</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-500 font-semibold">
            {filteredProjects.length} Projects Total
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-2.5">
        {paginatedProjects.length === 0 ? (
          <div className="py-14 text-center text-slate-400 font-mono text-xs">
            No projects found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          paginatedProjects.map((project) => {
            const isStarred = !!userStarred[project.id];
            const starCount = projectStars[project.id] ?? project.stats?.stars ?? 0;

            if (viewMode === 'compact') {
              return (
                <div
                  key={project.id}
                  onClick={() => {
                    playSound('open');
                    setActiveProject(project);
                  }}
                  className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">{project.title}</span>
                      {project.featured && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 shrink-0">
                          ★ Core
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono text-blue-700 font-semibold">{project.category}</span>
                      <span>•</span>
                      <span className="truncate">{project.tags?.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(project.id, e)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                        isStarred
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                      <span>{starCount}</span>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={project.id}
                onClick={() => {
                  playSound('open');
                  setActiveProject(project);
                }}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2.5 cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all"
              >
                <div className="flex items-start gap-3">
                  {project.thumbnail_url && (
                    <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60 shrink-0">
                          {project.category || 'Engineering'}
                        </span>
                        {project.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60 shrink-0">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      {/* Star Action */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(project.id, e)}
                        className={`px-2 py-0.5 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 border transition-all ${
                          isStarred
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        <span>{starCount}</span>
                      </button>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                      {project.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {project.summary}
                </p>

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                    {project.tags.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-400 self-center">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Pagination */}
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredProjects.length}
        itemsPerPage={ITEMS_PER_PAGE}
        itemName="Projects"
      />
    </div>
  );
}
