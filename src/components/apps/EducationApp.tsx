'use client';

import React from 'react';
import { GraduationCap, Calendar, Award, CheckCircle2, BookOpen, MapPin } from 'lucide-react';
import { Education } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface EducationAppProps {
  education: Education[];
}

export default function EducationApp({ education }: EducationAppProps) {
  const { playSound } = useSystemStore();

  return (
    <div className="space-y-4 text-[#111827]">
      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Education.doc — Academic Background & Qualifications
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              {education.length} Academic Records Verified
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <div className="flex items-start gap-3">
                {edu.logo_url && (
                  <div className="w-10 h-10 retro-box-outset bg-white p-0.5 rounded-2xs shrink-0 overflow-hidden hidden sm:flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={edu.logo_url} alt={edu.institution} className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-[#000080]">
                    {edu.degree} in {edu.field_of_study}
                  </h3>
                  <p className="text-xs font-semibold text-gray-700">{edu.institution}</p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-gray-600 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{edu.start_year} – {edu.end_year}</span>
                {edu.grade && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-2xs font-semibold">
                    {edu.grade}
                  </span>
                )}
              </div>
            </div>

            {edu.description_html && (
              <div
                dangerouslySetInnerHTML={{ __html: edu.description_html }}
                className="prose prose-sm max-w-none text-gray-800 text-xs leading-relaxed"
              />
            )}

            {edu.activities && edu.activities.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-700" />
                  <span>Leadership, Societies & Activities:</span>
                </span>
                <ul className="space-y-1 pl-1">
                  {edu.activities.map((act, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
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
