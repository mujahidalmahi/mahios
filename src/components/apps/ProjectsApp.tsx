'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderGit2, ExternalLink, Star, FileCode, X,
  Layers, Search, LayoutGrid, List, SlidersHorizontal,
  Sparkles, Check, Copy
} from 'lucide-react';
import { GithubIcon } from '@/components/shared/Icons';
import { Project } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface ProjectsAppProps {
  projects: Project[];
  initialProjectId?: string;
}

export default function ProjectsApp({ projects, initialProjectId }: ProjectsAppProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'name'>('featured');
  const [copiedLink, setCopiedLink] = useState(false);
  const [projectStars, setProjectStars] = useState<Record<string, number>>(() =>
    projects.reduce((acc, p) => ({ ...acc, [p.id]: p.stats?.stars || 0 }), {})
  );
  const [userStarred, setUserStarred] = useState<Record<string, boolean>>({});
  const { playSound } = useSystemStore();

  useEffect(() => {
    // 1. If explicitly passed via prop
    if (initialProjectId) {
      const match = projects.find(
        (p) =>
          p.slug === initialProjectId ||
          p.id === initialProjectId ||
          p.slug.toLowerCase() === initialProjectId.toLowerCase()
      );
      if (match) {
        setSelectedProject(match);
        return;
      }
    }

    // 2. Otherwise inspect window.location for query params or hash
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const reqId = searchParams.get('id') || searchParams.get('project') || searchParams.get('slug');
      let hashTarget: string | null = null;
      if (window.location.hash?.startsWith('#project-')) {
        hashTarget = window.location.hash.replace('#project-', '');
      }
      const targetSlug = (reqId || hashTarget || '').toLowerCase().trim();
      if (targetSlug) {
        const match = projects.find(
          (p) =>
            p.slug.toLowerCase() === targetSlug ||
            p.id.toLowerCase() === targetSlug ||
            p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === targetSlug
        );
        if (match) {
          setSelectedProject(match);
        }
      }
    }
  }, [projects, initialProjectId]);

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

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filteredProjects = projects
    .filter((p) => {
      const matchCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.sort_order - b.sort_order;
      }
      return a.title.localeCompare(b.title);
    });

  const handleCopyLink = (project: Project) => {
    playSound('click');
    const url = `${window.location.origin}/?app=projects&id=${project.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Explorer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              C:\MahiOS\Projects_Dir
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              {filteredProjects.length} Objects Found ({projects.length} Total)
            </span>
          </div>
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center retro-box-inset p-0.5 bg-white">
            <button
              type="button"
              onClick={() => { playSound('click'); setViewMode('grid'); }}
              className={`p-1 cursor-pointer ${viewMode === 'grid' ? 'bg-[#000080] text-white' : 'text-gray-600 hover:text-black'}`}
              title="Grid Icons View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { playSound('click'); setViewMode('list'); }}
              className={`p-1 cursor-pointer ${viewMode === 'list' ? 'bg-[#000080] text-white' : 'text-gray-600 hover:text-black'}`}
              title="Detailed List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setSortBy(sortBy === 'featured' ? 'name' : 'featured');
            }}
            className="retro-btn px-2 py-1 text-[11px] font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Sort: {sortBy === 'featured' ? 'Featured' : 'Name'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-[#f3f4f6] retro-box-inset space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search projects by name, keywords, or architecture stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 bg-white retro-box-inset text-xs focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="retro-btn px-2 py-0.5 text-[10px]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playSound('click');
                setFilterCategory(cat);
              }}
              className={`px-2.5 py-0.5 rounded-2xs font-medium cursor-pointer shrink-0 ${
                filterCategory === cat
                  ? 'bg-[#000080] text-white font-bold'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                playSound('open');
                setSelectedProject(p);
              }}
              className="p-2.5 sm:p-3 bg-[#f9fafb] retro-box-outset hover:bg-[#edf2f7] cursor-pointer group flex flex-col justify-between transition-all min-w-0"
            >
              <div className="space-y-2 min-w-0">
                {/* Thumbnail (1:1 Ratio) */}
                <div className="w-full aspect-square bg-gray-200 retro-box-inset overflow-hidden relative">
                  {p.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnail_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FileCode className="w-8 h-8" />
                    </div>
                  )}

                  {p.featured && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-bold rounded-2xs flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-black" /> Featured
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase">{p.category}</span>
                  <h3 className="font-bold text-xs text-[#000080] line-clamp-1 group-hover:underline">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-1">
                    {p.summary}
                  </p>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-gray-300 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <button
                  type="button"
                  onClick={(e) => handleToggleStar(p.id, e)}
                  className={`px-2 py-0.5 rounded-2xs flex items-center gap-1 cursor-pointer transition-all active:retro-btn-pressed select-none ${
                    userStarred[p.id]
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                      : 'hover:bg-black/5 text-gray-700'
                  }`}
                  title="Star this Project"
                >
                  <Star className={`w-3 h-3 ${userStarred[p.id] ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                  <span>{projectStars[p.id] || 0}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {p.live_url && <ExternalLink className="w-3 h-3 text-blue-700" />}
                  {p.github_url && <GithubIcon className="w-3 h-3 text-gray-700" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white retro-box-inset overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e5e7eb] border-b border-gray-300 text-gray-700 font-mono text-[11px]">
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Architecture Stack</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => {
                    playSound('open');
                    setSelectedProject(p);
                  }}
                  className="border-b border-gray-200 hover:bg-blue-50/60 cursor-pointer"
                >
                  <td className="p-2 font-bold text-[#000080] flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>{p.title}</span>
                    {p.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  </td>
                  <td className="p-2 font-mono text-gray-600 text-[11px]">{p.category}</td>
                  <td className="p-2 text-gray-600 text-[11px]">
                    {p.tags?.slice(0, 3).join(', ')}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      className="retro-btn px-2 py-0.5 text-[10px] font-bold text-[#000080]"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="p-8 text-center bg-white retro-box-inset text-gray-500 text-xs">
          No projects found matching the specified filters.
        </div>
      )}

      {/* Project Inspector Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4">
          <div className="retro-box-outset bg-[#c0c0c0] max-w-2xl w-full p-1 shadow-2xl flex flex-col max-h-[88vh]">
            {/* Modal Titlebar */}
            <div className="retro-titlebar px-2 py-1 flex items-center justify-between font-bold text-xs shrink-0">
              <span className="truncate mr-2">File Inspector: {selectedProject.title}</span>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="retro-window-btn cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            </div>

            {/* Modal Sunken Content */}
            <div className="retro-box-inset bg-white p-3 sm:p-5 m-1 overflow-y-auto space-y-3 sm:space-y-4 flex-1 text-xs break-words">
              {selectedProject.thumbnail_url && (
                <div className="flex justify-center">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 aspect-square bg-gray-100 rounded-2xs overflow-hidden border border-gray-300 retro-box-inset">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProject.thumbnail_url} alt={selectedProject.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-blue-700 font-bold">{selectedProject.category}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedProject)}
                    className="retro-btn px-2 py-0.5 text-[10px] flex items-center gap-1 text-gray-700 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
                  </button>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#000080] break-words">{selectedProject.title}</h2>
                <p className="text-gray-700 text-xs break-words">{selectedProject.summary}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleStar(selectedProject.id)}
                  className={`retro-btn px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none active:retro-btn-pressed ${
                    userStarred[selectedProject.id]
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                      : 'text-gray-800'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${userStarred[selectedProject.id] ? 'fill-amber-500 text-amber-500' : 'text-gray-500'}`} />
                  <span>{userStarred[selectedProject.id] ? 'Starred' : 'Star Project'} ({projectStars[selectedProject.id] || 0})</span>
                </button>

                {selectedProject.live_url && (
                  <a
                    href={selectedProject.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="retro-btn px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-[#000080] cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Live System</span>
                  </a>
                )}
                {selectedProject.github_url && (
                  <a
                    href={selectedProject.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="retro-btn px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-gray-800 cursor-pointer"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>Source Repository</span>
                  </a>
                )}
              </div>

              {/* Tech stack */}
              <div className="space-y-1 pt-2 border-t border-gray-200">
                <span className="text-[11px] font-bold text-gray-700 uppercase">Architecture Stack:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedProject.tags?.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[#f3f4f6] border border-gray-300 rounded-2xs text-[11px] font-mono text-gray-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1 pt-2 border-t border-gray-200">
                <span className="text-[11px] font-bold text-gray-700 uppercase">Technical Specifications:</span>
                <div
                  dangerouslySetInnerHTML={{ __html: selectedProject.description_html }}
                  className="prose prose-sm max-w-none text-gray-800 text-xs leading-relaxed pt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
