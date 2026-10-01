'use client';

import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2, Building2 } from 'lucide-react';
import { Experience } from '@/types/database';

interface MobileExperienceViewProps {
  experiences: Experience[];
}

export default function MobileExperienceView({ experiences = [] }: MobileExperienceViewProps) {
  const sortedExperiences = [...experiences].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Career Roles & Experience ({sortedExperiences.length})
      </div>

      <div className="space-y-3">
        {sortedExperiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {exp.is_current ? 'Present Role' : 'Past Role'}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">{exp.role}</h3>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{exp.company}</span>
                </div>
              </div>

              {exp.employment_type && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {exp.employment_type}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
              </span>
              {exp.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {exp.location}
                </span>
              )}
            </div>

            {exp.description_html ? (
              <div
                className="text-xs text-slate-700 leading-relaxed space-y-1.5 pt-1 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: exp.description_html }}
              />
            ) : exp.achievements?.length > 0 ? (
              <ul className="text-xs text-slate-700 space-y-1.5 pt-1 border-t border-slate-100">
                {exp.achievements.map((ach, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {exp.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {exp.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
