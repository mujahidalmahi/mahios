'use client';

import React, { useState, useMemo } from 'react';
import {
  FileBadge, Download, Printer, Copy, Check,
  Share2, Eye, FileText, MapPin, Mail, Globe, Phone,
  GraduationCap, Briefcase, Code2, Sparkles, Award,
  Languages, Users, ShieldCheck
} from 'lucide-react';
import { ResumeConfig, BiographyDatabaseData } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { printDocument } from '@/lib/utils/printDocument';
import { renderMarkdownToHtml } from '@/lib/utils/markdownRenderer';
import { resolveCVData, CVData } from '@/lib/data/cvData';

interface ResumeAppProps {
  resume: ResumeConfig;
  data?: BiographyDatabaseData;
}

export default function ResumeApp({ resume }: ResumeAppProps) {
  const [viewMode, setViewMode] = useState<'document' | 'plaintext'>('document');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { playSound } = useSystemStore();

  // Resolve CV data strictly using user's JSON with support for dynamic overrides
  const cv: CVData = useMemo(() => {
    return resolveCVData(resume?.summary_markdown);
  }, [resume?.summary_markdown]);

  // Generate complete ATS-optimized plaintext resume containing strictly these contents
  const fullPlainTextResume = useMemo(() => {
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
        return `* ${edu.degree}${fieldStr}\n  Institution: ${edu.school} (${edu.start} - ${edu.end})\n  Grade: ${edu.grade}`;
      })
      .join('\n\n');

    const certText = cv.certifications
      .map((c) => `* ${c.name} - ${c.issuer} (${c.date})`)
      .join('\n');

    const achText = cv.achievements
      .map((a) => `* ${a}`)
      .join('\n');

    const langText = cv.languages
      .map((l) => `* ${l.name} (${l.level})`)
      .join('\n');

    const skillsText = `* ${cv.skills.join(', ')}`;

    const refText = cv.references
      .map((r) => `* ${r.name} - ${r.title}, ${r.company}\n  Email: ${r.email} | Phone: ${r.phone} | Relationship: ${r.relationship}`)
      .join('\n\n');

    return `${cv.profile.fullName.toUpperCase()}
${cv.profile.title}
Location: ${cv.profile.location}
Email: ${cv.profile.email}
Phone: ${cv.profile.phone}
Portfolio: https://${cv.profile.website.replace(/^https?:\/\//, '')}

============================================================
EXECUTIVE SUMMARY
============================================================
${cv.profile.summary}

============================================================
TECHNICAL SKILLS
============================================================
${skillsText}

============================================================
PROFESSIONAL EXPERIENCE
============================================================
${expText}

============================================================
ACADEMIC BACKGROUND & EDUCATION
============================================================
${eduText}

============================================================
CERTIFICATIONS
============================================================
${certText}

============================================================
HONORS & ACHIEVEMENTS
============================================================
${achText}

============================================================
LANGUAGES
============================================================
${langText}

============================================================
PROFESSIONAL REFERENCES
============================================================
${refText}

============================================================
ATS Optimized • Verified ${resume?.last_updated_date || 'September 2026'} • ${cv.profile.fullName}
`;
  }, [cv, resume?.last_updated_date]);

  const handleShareLink = () => {
    playSound('click');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mujahidmahi.me';
    const url = `${origin}/?app=resume`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullPlainTextResume);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    playSound('click');

    const printContentHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5; font-size: 9.5pt;">
        {/* Header */}
        <div style="border-bottom: 2.5px solid #000080; padding-bottom: 10px; margin-bottom: 14px;">
          <h1 style="font-size: 20pt; font-weight: 800; margin: 0 0 3px 0; color: #000080; letter-spacing: -0.5px;">${cv.profile.fullName.toUpperCase()}</h1>
          <div style="font-size: 11pt; font-weight: 600; color: #334155; margin-bottom: 6px;">${cv.profile.title}</div>
          <div style="font-size: 9pt; color: #64748b; display: flex; flex-wrap: wrap; gap: 12px;">
            <span>📍 ${cv.profile.location}</span>
            <span>✉️ ${cv.profile.email}</span>
            <span>📞 ${cv.profile.phone}</span>
            <span>🌐 https://${cv.profile.website.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Executive Summary</h2>
          <div style="font-size: 9.5pt; color: #1e293b; margin: 0; line-height: 1.6;">${renderMarkdownToHtml(cv.profile.summary, 'light')}</div>
        </div>

        {/* Technical Skills */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Technical Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 9pt;">
            ${cv.skills.map((s) => `<span style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 3px; font-family: monospace; font-weight: 600; color: #0f172a;">${s}</span>`).join('')}
          </div>
        </div>

        {/* Professional Experience */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Professional Experience</h2>
          ${cv.experiences
            .map(
              (exp) => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <div><strong style="font-size: 10pt;">${exp.role}</strong> — <span style="color: #000080; font-weight: 600;">${exp.company}</span></div>
                  <div style="font-size: 8.5pt; color: #64748b; font-family: monospace;">${exp.start} – ${exp.end} | ${exp.location}</div>
                </div>
                <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 9pt; color: #334155;">
                  ${exp.bullets.map((b) => `<li style="margin-bottom: 2px;">${b}</li>`).join('')}
                </ul>
              </div>
            `
            )
            .join('')}
        </div>

        {/* Education */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Academic Background & Education</h2>
          ${cv.education
            .map(
              (edu) => `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <div><strong style="font-size: 9.5pt;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</strong> — <span style="color: #000080; font-weight: 600;">${edu.school}</span></div>
                  <div style="font-size: 8.5pt; color: #64748b; font-family: monospace;">${edu.start} – ${edu.end} | ${edu.grade}</div>
                </div>
              </div>
            `
            )
            .join('')}
        </div>

        {/* Certifications & Achievements in 2 columns */}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Certifications</h2>
            <ul style="margin: 0 0 0 16px; padding: 0; font-size: 9pt; color: #334155;">
              ${cv.certifications.map((c) => `<li style="margin-bottom: 3px;"><strong>${c.name}</strong> — ${c.issuer} (${c.date})</li>`).join('')}
            </ul>
          </div>
          <div>
            <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Honors & Achievements</h2>
            <ul style="margin: 0 0 0 16px; padding: 0; font-size: 9pt; color: #334155;">
              ${cv.achievements.map((a) => `<li style="margin-bottom: 3px;">${a}</li>`).join('')}
            </ul>
          </div>
        </div>

        {/* Languages & References in 2 columns */}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">Languages</h2>
            <div style="font-size: 9pt; color: #334155;">
              ${cv.languages.map((l) => `<span style="margin-right: 10px;"><strong>${l.name}</strong> (${l.level})</span>`).join('')}
            </div>
          </div>
          <div>
            <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 6px;">References</h2>
            <div style="font-size: 8.5pt; color: #334155;">
              ${cv.references.map((r) => `<div style="margin-bottom: 4px;"><strong>${r.name}</strong> (${r.relationship}) — ${r.title}, ${r.company}<br/><span style="color: #64748b;">${r.email} • ${r.phone}</span></div>`).join('')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style="margin-top: 18px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #94a3b8; text-align: center; font-family: monospace;">
          Official Curriculum Vitae • Verified ${resume?.last_updated_date || 'September 2026'} • ${cv.profile.fullName} • ${cv.profile.location}
        </div>
      </div>
    `;

    printDocument({
      title: resume?.download_filename ? resume.download_filename.replace('.pdf', '') : 'Mujahid_Al_Mahi_Resume',
      categoryBadge: 'Curriculum Vitae',
      periodOrDate: `Verified: ${resume?.last_updated_date || 'September 2026'}`,
      author: cv.profile.fullName,
      contentHtml: printContentHtml,
      footerNote: `Official Curriculum Vitae • ${cv.profile.fullName}`,
    });
  };

  const handleDownload = () => {
    playSound('click');
    if (resume?.pdf_url && (resume.pdf_url.startsWith('http://') || resume.pdf_url.startsWith('https://'))) {
      window.open(resume.pdf_url, '_blank');
      return;
    }
    handlePrint();
  };

  return (
    <div className="space-y-3 text-[#111827]">
      {/* Top Application Header & Action Bar */}
      <div className="p-2.5 bg-[#f3f4f6] retro-box-inset rounded-xs space-y-2 select-none">
        {/* Row 1: Document Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 retro-box-outset bg-white flex items-center justify-center text-[#000080] shrink-0">
            <FileBadge className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-[#000080] truncate">
                {resume?.download_filename || 'Mujahid_Al_Mahi_Resume.pdf'}
              </h2>
              <span className="text-[9px] px-1 py-px bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono rounded-2xs font-semibold shrink-0">
                ATS
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Verified: {resume?.last_updated_date || 'September 2026'}
            </p>
          </div>
        </div>

        {/* Row 2: View Switcher & Action Buttons */}
        <div className="flex items-center justify-between gap-1.5 border-t border-gray-300 pt-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setViewMode('document');
              }}
              className={`px-1.5 py-1 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'document' ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]' : 'retro-btn text-gray-700'
              }`}
              title="Formatted Document Sheet View"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Document</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setViewMode('plaintext');
              }}
              className={`px-1.5 py-1 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'plaintext' ? 'retro-btn-pressed bg-[#dfdfdf] font-bold text-[#000080]' : 'retro-btn text-gray-700'
              }`}
              title="Plain Text ATS Format"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ATS Text</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShareLink}
              className="retro-btn px-1.5 py-1 text-[11px] font-bold text-[#000080] flex items-center gap-1 cursor-pointer"
              title="Copy Share Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="retro-btn px-1.5 py-1 text-[11px] font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Copy ATS Plain Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="retro-btn px-1.5 py-1 text-[11px] font-bold text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Print or Save to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="retro-btn px-1.5 py-1 text-[11px] font-bold text-[#000080] flex items-center gap-1 cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Document View (Formatted A4 Sheet) */}
      {viewMode === 'document' ? (
        <div className="bg-[#6b7280]/15 p-2 sm:p-5 retro-box-inset rounded-xs flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-300 p-5 sm:p-8 space-y-6 text-[#0f172a] rounded-xs select-text">
            {/* Header / Identity Banner */}
            <div className="border-b-2 border-[#000080] pb-4 space-y-2 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000080]">
                  {cv.profile.fullName.toUpperCase()}
                </h1>
                <span className="text-xs font-mono text-gray-500">
                  Verified: {resume?.last_updated_date || 'September 2026'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-700">
                {cv.profile.title}
              </p>

              {/* Contact Information & Channels */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-gray-600 font-sans pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {cv.profile.location}
                </span>
                <a
                  href={`mailto:${cv.profile.email}`}
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  {cv.profile.email}
                </a>
                <a
                  href={`tel:${cv.profile.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {cv.profile.phone}
                </a>
                <a
                  href={`https://${cv.profile.website.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  {cv.profile.website}
                </a>
              </div>
            </div>

            {/* Section: Executive Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Executive Summary
                </h2>
              </div>
              <div
                className="text-xs sm:text-[13px] leading-relaxed text-gray-800 space-y-1.5"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(cv.profile.summary, 'light') }}
              />
            </div>

            {/* Section: Technical Skills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Code2 className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Technical Skills
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cv.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded font-mono font-medium shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Section: Professional Experience */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Professional Experience
                </h2>
              </div>
              <div className="space-y-3">
                {cv.experiences.map((exp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-sm font-bold text-gray-900">{exp.role}</span>
                        <span className="text-sm font-semibold text-[#000080]"> — {exp.company}</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">
                        {exp.start} – {exp.end} • {exp.location}
                      </span>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="leading-relaxed">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Academic Background & Education */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Academic Background & Education
                </h2>
              </div>
              <div className="space-y-2.5">
                {cv.education.map((edu, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-sm font-bold text-gray-900">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </span>
                      <span className="text-sm font-semibold text-[#000080]"> — {edu.school}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 shrink-0">
                      <span>{edu.start} – {edu.end}</span>
                      {edu.grade && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 font-semibold rounded-2xs">
                          {edu.grade}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid 2-Column: Certifications & Honors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              {/* Section: Certifications */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#000080]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                    Certifications
                  </h2>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {cv.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-baseline justify-between gap-2">
                      <div>
                        <strong className="text-gray-900">{cert.name}</strong>
                        <span className="text-gray-500"> — {cert.issuer}</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400 shrink-0">{cert.date}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section: Honors & Achievements */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                  <Award className="w-3.5 h-3.5 text-[#000080]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                    Honors & Achievements
                  </h2>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                  {cv.achievements.map((ach, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {ach}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Grid 2-Column: Languages & Professional References */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              {/* Section: Languages */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                  <Languages className="w-3.5 h-3.5 text-[#000080]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                    Languages
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {cv.languages.map((lang, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-gray-700">
                      <strong>{lang.name}</strong> <span className="text-gray-500 font-mono text-[11px]">({lang.level})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Section: References */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                  <Users className="w-3.5 h-3.5 text-[#000080]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                    Professional References
                  </h2>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  {cv.references.map((ref, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 border border-gray-200 rounded-2xs space-y-0.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <strong className="text-gray-900">{ref.name}</strong>
                        <span className="text-[10px] px-1 bg-gray-200 text-gray-700 rounded font-mono">
                          {ref.relationship}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium">{ref.title}, {ref.company}</p>
                      <div className="text-[10px] text-gray-500 font-mono flex flex-wrap gap-x-2">
                        <span>{ref.email}</span>
                        <span>•</span>
                        <span>{ref.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-1">
              <span>Official Curriculum Vitae • {cv.profile.fullName}</span>
              <span>ATS Optimized & Machine Readable • {cv.profile.location}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Plain Text ATS Format */
        <div className="p-4 bg-[#f8fafc] retro-box-inset rounded-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                ATS Plain Text Format (Machine-Readable)
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Optimized for automatic parsing by Applicant Tracking Systems
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyText}
              className="retro-btn px-2.5 py-1 text-xs font-bold text-[#000080] flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All Text'}</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-800 p-4 bg-white border border-gray-200 rounded-2xs select-text overflow-x-auto">
            {fullPlainTextResume}
          </pre>
        </div>
      )}
    </div>
  );
}
