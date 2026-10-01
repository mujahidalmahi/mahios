'use client';

import React from 'react';
import { GraduationCap, Calendar, Award } from 'lucide-react';
import { Education } from '@/types/database';

interface MobileEducationViewProps {
  education: Education[];
}

export default function MobileEducationView({ education = [] }: MobileEducationViewProps) {
  const sortedEdu = [...education].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-6">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        Academic Credentials ({sortedEdu.length})
      </div>

      <div className="space-y-3">
        {sortedEdu.map((edu) => (
          <div
            key={edu.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {edu.degree || 'Degree'}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">{edu.field_of_study || edu.degree}</h3>
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{edu.institution}</span>
                </div>
              </div>

              {edu.grade && (
                <span className="text-[11px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {edu.grade}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {edu.start_year} — {edu.end_year}
              </span>
            </div>

            {edu.description_html && (
              <div
                className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-slate-100"
                dangerouslySetInnerHTML={{ __html: edu.description_html }}
              />
            )}

            {edu.activities?.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Activities & Honors</div>
                <ul className="text-xs text-slate-700 space-y-1">
                  {edu.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
