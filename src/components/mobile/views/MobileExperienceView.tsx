'use client';

import React, { useState, useMemo } from 'react';
import {
  Briefcase, Calendar, MapPin, CheckCircle2,
  Building2, Search, Filter, Layers, Code2
} from 'lucide-react';
import { Experience } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileExperienceViewProps {
  experiences: Experience[];
}

export default function MobileExperienceView({ experiences = [] }: MobileExperienceViewProps) {
  const { playSound } = useSystemStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');

  // Extract unique technologies across all experiences
  const allTechs = useMemo(() => {
    const set = new Set<string>();
    experiences.forEach((exp) => {
      exp.technologies?.forEach((t) => set.add(t));
    });
    return ['All', ...Array.from(set)];
  }, [experiences]);

  const filteredExperiences = useMemo(() => {
    let list = experiences;

    if (selectedTech !== 'All') {
      list = list.filter((exp) => exp.technologies?.includes(selectedTech));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (exp) =>
          exp.role.toLowerCase().includes(q) ||
          exp.company.toLowerCase().includes(q) ||
          (exp.location && exp.location.toLowerCase().includes(q)) ||
          exp.technologies?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [experiences, selectedTech, searchQuery]);

  return (
    <div className="space-y-3 pb-8 max-w-full font-sans">
      {/* Search Input & Tech Chips */}
      <div className="space-y-2">
        <div className="relative flex items-center bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies, or locations..."
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

        {/* Tech Stack Chips */}
        {allTechs.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {allTechs.map((t) => {
              const isSelected = selectedTech === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSelectedTech(t);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Experience Timeline */}
      <div className="space-y-3 pt-1">
        {filteredExperiences.length === 0 ? (
          <div className="py-14 text-center text-slate-400 font-mono text-xs">
            No work records found matching &ldquo;{searchQuery || selectedTech}&rdquo;
          </div>
        ) : (
          filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.is_current
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {exp.is_current ? 'Present Role' : 'Past Role'}
                    </span>
                    {exp.employment_type && (
                      <span className="text-[10px] font-mono text-slate-500">
                        {exp.employment_type}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                    {exp.role}
                  </h3>

                  <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{exp.company}</span>
                  </div>
                </div>
              </div>

              {/* Dates & Location */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</span>
                </span>
                {exp.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{exp.location}</span>
                    </span>
                  </>
                )}
              </div>

              {/* HTML Description */}
              {exp.description_html && (
                <div
                  className="text-xs text-slate-700 leading-relaxed space-y-1.5 pt-2 border-t border-slate-100"
                  dangerouslySetInnerHTML={{ __html: exp.description_html }}
                />
              )}

              {/* Achievements Bullet List */}
              {exp.achievements && exp.achievements.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                    Key Deliverables & Impact:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {exp.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies Tags */}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  {exp.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-[10px] font-semibold border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
