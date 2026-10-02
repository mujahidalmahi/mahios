'use client';

import React, { useState, useMemo } from 'react';
import {
  FileBadge, Printer, Download, Mail, MapPin, Globe,
  Briefcase, GraduationCap, Cpu, Award, BookOpen,
  Copy, Check, FileText, Share2, Phone, CheckCircle2, UserCheck
} from 'lucide-react';
import { ResumeConfig, BiographyDatabaseData } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { resolveCVData, CVData } from '@/lib/data/cvData';
import { printDocument } from '@/lib/utils/printDocument';
import { downloadVCard } from '@/lib/utils/vcardGenerator';

interface MobileResumeViewProps {
  resume: ResumeConfig;
  data: BiographyDatabaseData;
}

export default function MobileResumeView({ resume, data }: MobileResumeViewProps) {
  const { playSound } = useSystemStore();
  const [viewMode, setViewMode] = useState<'document' | 'plaintext'>('document');
  const [copied, setCopied] = useState(false);

  // Strictly resolve parsed CVData
  const cv: CVData = useMemo(() => {
    const parsed = resolveCVData(resume?.summary_markdown);
    if (!parsed.profile.phone && (data?.settings?.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER)) {
      parsed.profile.phone = data?.settings?.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '';
    }
    return parsed;
  }, [resume?.summary_markdown, data?.settings?.phone]);

  // Generate plain text ATS resume
  const plainTextResume = useMemo(() => {
    const expText = cv.experiences
      .map((exp) => {
        const bulletsText = exp.bullets?.length
          ? exp.bullets.map((b) => `  - ${b}`).join('\n')
          : '';
        return `* ${exp.role} | ${exp.company} (${exp.start} - ${exp.end})\n  Location: ${exp.location}\n${bulletsText}`;
      })
      .join('\n\n');

    const eduText = cv.education
      .map((edu) => {
        const fieldStr = edu.field ? ` in ${edu.field}` : '';
        return `* ${edu.degree}${fieldStr}\n  ${edu.school} (${edu.start} - ${edu.end})\n  Grade: ${edu.grade}`;
      })
      .join('\n\n');

    const certText = cv.certifications.map((c) => `* ${c.name} — ${c.issuer} (${c.date})`).join('\n');
    const achText = cv.achievements.map((a) => `* ${a}`).join('\n');
    const langText = cv.languages.map((l) => `* ${l.name} (${l.level})`).join('\n');
    const skillsText = `* ${cv.skills.join(', ')}`;

    const refText = cv.references?.length
      ? cv.references
          .map((r) => `* ${r.name} - ${r.title}, ${r.company}\n  Relationship: ${r.relationship}\n  Email: ${r.email} | Phone: ${r.phone}`)
          .join('\n\n')
      : '';

    return `${cv.profile.fullName}
${cv.profile.title}
${[cv.profile.email, cv.profile.phone, cv.profile.location, cv.profile.website].filter(Boolean).join(' | ')}

SUMMARY
----------------------------------------
${cv.profile.summary}

EXPERIENCE
----------------------------------------
${expText}

EDUCATION
----------------------------------------
${eduText}

SKILLS
----------------------------------------
${skillsText}

ACHIEVEMENTS
----------------------------------------
${achText}

CERTIFICATIONS
----------------------------------------
${certText}

LANGUAGES
----------------------------------------
${langText}${refText ? `\n\nREFERENCES\n----------------------------------------\n${refText}` : ''}`;
  }, [cv]);

  const handleCopy = async () => {
    playSound('click');
    try {
      await navigator.clipboard.writeText(plainTextResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    playSound('click');
    const content = document.getElementById('mobile-resume-content');
    if (content) {
      printDocument({
        title: `${cv.profile.fullName.replace(/\s+/g, '_')}_Resume`,
        categoryBadge: 'Curriculum Vitae',
        subtitle: cv.profile.title,
        author: cv.profile.fullName,
        contentHtml: content.innerHTML,
      });
    } else {
      window.print();
    }
  };

  const handleDownloadVCard = () => {
    playSound('click');
    downloadVCard({
      fullName: cv.profile.fullName || data.settings?.owner_name || 'Mujahid Al Mahi',
      title: cv.profile.title,
      email: cv.profile.email || data.settings?.email,
      phone: cv.profile.phone || data.settings?.phone,
      location: cv.profile.location || data.settings?.location,
      website: cv.profile.website,
    });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setViewMode('document');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'document'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Formatted CV
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setViewMode('plaintext');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'plaintext'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plaintext (ATS)
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === 'plaintext' ? (
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1 active:scale-95"
                title="Print CV"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>vCard</span>
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'plaintext' ? (
        /* ATS Plaintext View */
        <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
          {plainTextResume}
        </div>
      ) : (
        /* Formatted Document View */
        <div id="mobile-resume-content" className="space-y-3">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  Curriculum Vitae
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {cv.profile.fullName || data.settings?.owner_name || 'Mujahid Al Mahi'}
                </h2>
                <p className="text-xs font-bold text-blue-700 mt-0.5">
                  {cv.profile.title}
                </p>
              </div>
            </div>

            {/* Contact links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-mono">
              {cv.profile.email && (
                <a
                  href={`mailto:${cv.profile.email}`}
                  className="flex items-center gap-1.5 hover:text-blue-600 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{cv.profile.email}</span>
                </a>
              )}
              {cv.profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{cv.profile.location}</span>
                </div>
              )}
              {cv.profile.website && (
                <a
                  href={`https://${cv.profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-600 truncate"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{cv.profile.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {cv.profile.summary && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {cv.profile.summary}
              </p>
            </div>
          )}

          {/* Experience Section */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Experience ({cv.experiences.length})</span>
            </h3>
            <div className="space-y-4">
              {cv.experiences.map((exp, idx) => (
                <div key={idx} className="space-y-2 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{exp.role}</h4>
                      <div className="text-[11px] font-semibold text-blue-700">{exp.company}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 text-right">
                      {exp.start} — {exp.end}
                    </span>
                  </div>

                  {exp.location && (
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{exp.location}</span>
                    </div>
                  )}

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-1.5 pt-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                          <span className="text-blue-500 font-bold leading-tight mt-0.5">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
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
            <div className="space-y-3">
              {cv.education.map((edu, idx) => (
                <div key={idx} className="space-y-1 pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </h4>
                      <div className="text-[11px] font-semibold text-emerald-700">{edu.school}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {edu.start} — {edu.end}
                    </span>
                  </div>
                  {edu.grade && (
                    <div className="text-[10px] font-mono font-bold text-slate-500">
                      Grade: <span className="text-slate-800">{edu.grade}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          {cv.skills && cv.skills.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>Skills & Competencies</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 text-[11px] font-semibold border border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cv.achievements && cv.achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Honors</span>
                </h3>
                <ul className="space-y-1.5">
                  {cv.achievements.map((ach, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-amber-500 font-bold leading-tight mt-0.5">•</span>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cv.certifications && cv.certifications.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Certifications</span>
                </h3>
                <div className="space-y-2">
                  {cv.certifications.map((cert, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-bold text-slate-900">{cert.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {cert.issuer} • {cert.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Languages & References */}
          {cv.languages && cv.languages.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Languages</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {cv.languages.map((l, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 text-xs font-semibold border border-purple-100 flex items-center gap-1"
                  >
                    <span>{l.name}</span>
                    <span className="text-[10px] text-purple-600 font-mono">({l.level})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {cv.references && cv.references.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                <span>References</span>
              </h3>
              <div className="space-y-3">
                {cv.references.map((ref, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="font-bold text-xs text-slate-900">{ref.name}</div>
                    <div className="text-[11px] text-slate-600">
                      {ref.title}, {ref.company}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{ref.relationship}</div>
                    <div className="text-[11px] text-slate-600 font-mono pt-1">
                      {ref.email} {ref.phone ? `• ${ref.phone}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
