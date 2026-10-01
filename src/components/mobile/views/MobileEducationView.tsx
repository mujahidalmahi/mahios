'use client';

import React from 'react';
import { GraduationCap, Calendar, Award, CheckCircle2, Building2, ExternalLink } from 'lucide-react';
import { Education } from '@/types/database';

interface MobileEducationViewProps {
  education: Education[];
}

export default function MobileEducationView({ education = [] }: MobileEducationViewProps) {
  const sortedEdu = [...education].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-3 pb-8 max-w-full font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Academic Qualifications ({sortedEdu.length})
        </div>
      </div>

      {sortedEdu.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No education entries found</p>
          <p className="text-[11px] text-slate-400">Add academic records in the Admin Dashboard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEdu.map((edu, index) => (
            <div
              key={edu.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-400 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  {edu.logo_url ? (
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      <img src={edu.logo_url} alt={edu.institution} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 leading-snug truncate">
                      {edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ''}
                    </h3>
                    <div className="text-xs font-bold text-slate-600 mt-0.5 truncate">
                      {edu.institution}
                    </div>
                  </div>
                </div>

                {edu.grade && (
                  <span className="text-[11px] font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 shrink-0">
                    {edu.grade}
                  </span>
                )}
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{edu.start_year} — {edu.end_year}</span>
              </div>

              {/* Coursework & Description */}
              {edu.description_html && (
                <div
                  className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-slate-100 space-y-1.5 prose prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: edu.description_html }}
                />
              )}

              {/* Leadership & Activities */}
              {edu.activities && edu.activities.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>Leadership, Societies & Activities:</span>
                  </span>
                  <ul className="space-y-1 pl-1">
                    {edu.activities.map((act, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certificate Link if present */}
              {edu.certificate_url && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <a
                    href={edu.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 active:scale-95 transition-transform"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Certificate / Diploma</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
