'use client';

import React, { useState, useMemo } from 'react';
import {
  FolderGit2, Search, ExternalLink, Sparkles,
  ChevronLeft, ChevronRight, Filter, Star, Eye
} from 'lucide-react';
import { GithubIcon } from '@/components/shared/Icons';
import { Project } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

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
  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    if (initialProjectId) {
      return projects.find((p) => p.id === initialProjectId || p.slug === initialProjectId) || null;
    }
    return null;
  });

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
    return list;
  }, [projects, selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (activeProject) {
    return (
      <div className="space-y-4 pb-6 animate-fadeIn">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setActiveProject(null);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Projects</span>
        </button>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          {activeProject.thumbnail_url && (
            <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
              <img
                src={activeProject.thumbnail_url}
                alt={activeProject.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {activeProject.category || 'Engineering'}
              </span>
              {activeProject.featured && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500" />
                  Featured
                </span>
              )}
            </div>
            <h2 className="text-base font-black text-slate-900 mt-1.5">{activeProject.title}</h2>
          </div>

          <div
            className="text-xs text-slate-700 leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: activeProject.description_html || activeProject.summary || '' }}
          />

          {activeProject.tags?.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Technologies</div>
              <div className="flex flex-wrap gap-1">
                {activeProject.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {activeProject.live_url && (
              <a
                href={activeProject.live_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('open')}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-transform"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Demo</span>
              </a>
            )}
            {activeProject.github_url && (
              <a
                href={activeProject.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playSound('open')}
                className="py-2 px-3 bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-transform"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      {/* Search & Filter Header */}
      <div className="space-y-2">
        <div className="relative flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-300">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search projects by name, tags..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
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
                className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-2.5">
        {paginatedProjects.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            No projects found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          paginatedProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                playSound('open');
                setActiveProject(project);
              }}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5 cursor-pointer hover:border-blue-400 active:scale-[0.99] transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {project.category || 'Software'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{project.title}</h3>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {project.summary}
              </p>

              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 4 && (
                    <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-medium">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
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
