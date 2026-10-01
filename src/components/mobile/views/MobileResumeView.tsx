'use client';

import React from 'react';
import {
  FileBadge, Printer, Download, Mail, MapPin,
  Briefcase, GraduationCap, Cpu, FolderGit2, ArrowUpRight
} from 'lucide-react';
import { ResumeConfig, BiographyDatabaseData } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileResumeViewProps {
  resume: ResumeConfig;
  data: BiographyDatabaseData;
}

export default function MobileResumeView({ resume, data }: MobileResumeViewProps) {
  const { playSound } = useSystemStore();
  const email = data.settings?.email || 'almahi.cs@gmail.com';

  const handlePrint = () => {
    playSound('click');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header & Print Action */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              Curriculum Vitae
            </span>
            <h2 className="text-base font-black text-slate-900 mt-1">
              {data.settings?.owner_name || 'Mujahid Al Mahi'}
            </h2>
            <p className="text-xs font-semibold text-blue-700 mt-0.5">
              Full-Stack Software Engineer & Creative Technologist
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>

        {/* Contact Strip */}
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100 font-mono">
          <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-blue-600">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{email}</span>
          </a>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>Dhaka, Bangladesh</span>
          </span>
        </div>
      </div>

      {/* Summary */}
      {resume?.summary_markdown && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Executive Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {resume.summary_markdown}
          </p>
        </div>
      )}

      {/* Experience Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span>Professional Experience</span>
        </h3>
        <div className="space-y-3">
          {data.experiences?.map((exp) => (
            <div key={exp.id} className="space-y-1 pb-2 border-b border-slate-100 last:border-b-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{exp.role}</h4>
                  <div className="text-[11px] font-semibold text-slate-600">{exp.company}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                </span>
              </div>
              {exp.description_html ? (
                <div
                  className="text-[11px] text-slate-600 leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: exp.description_html }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Education</span>
        </h3>
        <div className="space-y-2">
          {data.education?.map((edu) => (
            <div key={edu.id} className="flex items-start justify-between pb-2 border-b border-slate-100 last:border-b-0 last:pb-0">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{edu.field_of_study || edu.degree}</h4>
                <div className="text-[11px] text-slate-600">{edu.institution}</div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {edu.start_year} - {edu.end_year}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Core Skills Chips */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>Core Competencies</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {data.skills?.slice(0, 16).map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
