'use client';

import React, { useState } from 'react';
import {
  Briefcase, Calendar, MapPin, CheckCircle2,
  ExternalLink, Search, Filter, Layers, Sparkles
} from 'lucide-react';
import { Experience } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface ExperienceAppProps {
  experiences: Experience[];
}

export default function ExperienceApp({ experiences }: ExperienceAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const { playSound } = useSystemStore();

  // Extract unique tech tags
  const allTechs = ['All', ...Array.from(
    new Set(experiences.flatMap((e) => e.technologies || []))
  )];

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.location && exp.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTech =
      selectedTech === 'All' ||
      (exp.technologies && exp.technologies.includes(selectedTech));

    return matchesSearch && matchesTech;
  });

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Work History & Career Timeline
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              Total Documented Roles: {experiences.length} | Filtered: {filteredExperiences.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-3 bg-[#f3f4f6] retro-box-inset space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search roles, companies, or locations..."
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

        {/* Tech Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 text-[11px]">
          <span className="font-bold text-gray-600 mr-1 shrink-0">Filter by Stack:</span>
          {allTechs.slice(0, 10).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedTech(t);
              }}
              className={`px-2 py-0.5 rounded-2xs font-medium cursor-pointer shrink-0 ${
                selectedTech === t
                  ? 'bg-[#000080] text-white font-bold'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4">
        {filteredExperiences.map((exp, idx) => {
          return (
            <div key={exp.id || idx} className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3">
              {/* Role Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {exp.logo_url && (
                    <div className="w-10 h-10 retro-box-outset bg-white p-0.5 rounded-2xs shrink-0 overflow-hidden hidden sm:flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={exp.logo_url} alt={exp.company} className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-[#000080] break-words">{exp.role}</h3>
                      {exp.is_current && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300 rounded-2xs flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Active Role</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-gray-700 flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="break-words">{exp.company}</span>
                      {exp.company_url && (
                        <a href={exp.company_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline" title="Visit Company Website">
                          <ExternalLink className="w-3 h-3 inline ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                  <div className="text-[10px] sm:text-[11px] font-mono text-gray-600 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{exp.start_date} – {exp.end_date}</span>
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Details */}
              <div className="space-y-3 pt-1">
                {/* Description */}
                {exp.description_html && (
                  <div
                    dangerouslySetInnerHTML={{ __html: exp.description_html }}
                    className="rich-text-content prose prose-sm max-w-none text-xs leading-relaxed"
                  />
                )}

                {/* Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                      <span>Key Deliverables & Architectural Outcomes:</span>
                    </div>
                    <ul className="space-y-1 pl-1">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech stack tags */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200">
                    {exp.technologies.map((tech, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSelectedTech(tech);
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-blue-50 border border-gray-300 rounded-2xs text-[10px] font-mono text-gray-800 cursor-pointer"
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredExperiences.length === 0 && (
          <div className="p-8 text-center bg-white retro-box-inset text-gray-500 text-xs">
            No work experience matched your search query. Try clearing the filter.
          </div>
        )}
      </div>
    </div>
  );
}
