'use client';

import React, { useState, useMemo } from 'react';
import {
  FileBadge, Download, Printer, Copy, Check,
  Share2, Eye, FileText
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

  // Generate complete ATS-optimized plaintext resume
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
      .map((c) => `* ${c.name} — ${c.issuer} (${c.date})`)
      .join('\n');

    const achText = cv.achievements
      .map((a) => `* ${a}`)
      .join('\n');

    const langText = cv.languages
      .map((l) => `* ${l.name} (${l.level})`)
      .join('\n');

    const skillsText = `* ${cv.skills.join(', ')}`;

    const refText = cv.references
      .map((r) => `* ${r.name} - ${r.title}, ${r.company}\n  Relationship: ${r.relationship}\n  Email: ${r.email} | Phone: ${r.phone}`)
      .join('\n\n');

    return `${cv.profile.fullName}
${cv.profile.title}
${cv.profile.email} | ${cv.profile.phone} | ${cv.profile.location}
${cv.profile.website}

Summary
------------------------------------------------------------
${cv.profile.summary}

Experience
------------------------------------------------------------
${expText}

Education
------------------------------------------------------------
${eduText}

Achievements
------------------------------------------------------------
${achText}

Certifications
------------------------------------------------------------
${certText}

Languages
------------------------------------------------------------
${langText}

Skills
------------------------------------------------------------
${skillsText}

References
------------------------------------------------------------
${refText}
`;
  }, [cv]);

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

    const photoHtml = cv.profile.photoUrl
      ? `<img src="${cv.profile.photoUrl}" alt="${cv.profile.fullName}" style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; flex-shrink: 0;" />`
      : '';

    const printContentHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000000; line-height: 1.45; font-size: 9.5pt; max-width: 800px; margin: 0 auto; background: #ffffff; padding: 24px;">
        {/* Header */}
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div>
            <h1 style="font-size: 20pt; font-weight: 800; margin: 0 0 2px 0; color: #000000; letter-spacing: -0.3px;">${cv.profile.fullName}</h1>
            <div style="font-size: 10pt; font-weight: 500; color: #4b5563; margin-bottom: 6px;">${cv.profile.title}</div>
            <div style="font-size: 8.5pt; color: #4b5563; margin-bottom: 2px;">
              <span>${cv.profile.email}</span> &nbsp;|&nbsp; 
              <span>${cv.profile.phone}</span> &nbsp;|&nbsp; 
              <span>${cv.profile.location}</span>
            </div>
            <div style="font-size: 8.5pt; color: #4b5563;">
              <a href="https://${cv.profile.website.replace(/^https?:\/\//, '')}" style="color: #4b5563; text-decoration: none;">${cv.profile.website}</a>
            </div>
          </div>
          ${photoHtml}
        </div>

        {/* Summary */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Summary</h2>
          <div style="font-size: 8.8pt; color: #1f2937; text-align: justify; line-height: 1.5;">${cv.profile.summary}</div>
        </div>

        {/* Experience */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Experience</h2>
          ${cv.experiences
            .map(
              (exp) => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="font-size: 9.5pt; color: #000000;">${exp.role}</strong>
                  <span style="font-size: 8.5pt; color: #6b7280;">${exp.start} – ${exp.end}</span>
                </div>
                <div style="font-size: 8.5pt; color: #4b5563; margin-top: 1px;">${exp.company} · ${exp.location}</div>
                <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 8.5pt; color: #374151; line-height: 1.45;">
                  ${exp.bullets.map((b) => `<li style="margin-bottom: 2px;">${b}</li>`).join('')}
                </ul>
              </div>
            `
            )
            .join('')}
        </div>

        {/* Education */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Education</h2>
          ${cv.education
            .map(
              (edu) => `
              <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="font-size: 9.5pt; color: #000000;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</strong>
                  <span style="font-size: 8.5pt; color: #6b7280;">${edu.start} – ${edu.end}</span>
                </div>
                <div style="font-size: 8.5pt; color: #4b5563;">${edu.school}</div>
                <div style="font-size: 8.5pt; color: #15803d; font-weight: 600;">Grade: ${edu.grade}</div>
              </div>
            `
            )
            .join('')}
        </div>

        {/* Achievements */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Achievements</h2>
          <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 8.5pt; color: #374151; line-height: 1.45;">
            ${cv.achievements.map((ach) => `<li style="margin-bottom: 2px;">${ach}</li>`).join('')}
          </ul>
        </div>

        {/* Certifications */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Certifications</h2>
          <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 8.5pt; color: #374151; line-height: 1.45;">
            ${cv.certifications.map((c) => `<li style="margin-bottom: 2px;">${c.name} — ${c.issuer} (${c.date})</li>`).join('')}
          </ul>
        </div>

        {/* Languages */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Languages</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-top: 2px;">
            ${cv.languages.map((l) => `<span style="background: #f3f4f6; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 3px; padding: 3px 10px; font-size: 8.5pt; font-weight: 500;">${l.name} (${l.level})</span>`).join('')}
          </div>
        </div>

        {/* Skills */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 6px 0;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding-top: 2px;">
            ${cv.skills.map((s) => `<span style="background: #0f172a; color: #ffffff; border-radius: 2px; padding: 2.5px 8px; font-size: 8.5pt; font-family: monospace; font-weight: 500;">${s}</span>`).join('')}
          </div>
        </div>

        {/* References */}
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 10pt; font-weight: 700; color: #000000; border-bottom: 1.5px solid #000000; padding-bottom: 2px; margin: 0 0 8px 0;">References</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${cv.references
              .map(
                (ref, idx) => `
                <div style="${idx === 1 ? 'border-left: 1px solid #d1d5db; padding-left: 14px;' : ''}">
                  <strong style="font-size: 9.5pt; color: #000000; display: block;">${ref.name}</strong>
                  <div style="font-size: 8.5pt; color: #374151;">${ref.title}, ${ref.company}</div>
                  <div style="font-size: 8.5pt; color: #7c3aed; font-style: italic; margin-bottom: 2px;">${ref.relationship}</div>
                  <div style="font-size: 8.5pt; color: #6b7280;">${ref.email}</div>
                  <div style="font-size: 8.5pt; color: #6b7280;">${ref.phone}</div>
                </div>
              `
              )
              .join('')}
          </div>
        </div>

        {/* Footer Page 1 */}
        <div style="text-align: right; font-size: 8pt; color: #9ca3af; padding-top: 10px;">
          1
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

      {/* Mode 1: Document View (Clean Formatted Paper Sheet matching Reference Image) */}
      {viewMode === 'document' ? (
        <div className="bg-[#52525b]/20 p-2 sm:p-5 retro-box-inset rounded-xs flex justify-center">
          <div className="w-full max-w-[760px] bg-white shadow-xl border border-gray-300 p-6 sm:p-10 space-y-5 text-[#000000] rounded-xs select-text font-sans">
            
            {/* Header: Name, Title, Contact Info + Right Circular Avatar */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-black leading-none">
                  {cv.profile.fullName}
                </h1>
                <p className="text-[13px] font-medium text-gray-600 pt-0.5">
                  {cv.profile.title}
                </p>
                <div className="text-[11px] text-gray-500 pt-1 flex flex-wrap items-center gap-1.5 leading-tight">
                  <span>{cv.profile.email}</span>
                  <span className="text-gray-400">|</span>
                  <span>{cv.profile.phone}</span>
                  <span className="text-gray-400">|</span>
                  <span>{cv.profile.location}</span>
                </div>
                <div>
                  <a
                    href={`https://${cv.profile.website.replace(/^https?:\/\//, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-gray-500 hover:text-black transition-colors block"
                  >
                    {cv.profile.website}
                  </a>
                </div>
              </div>

              {/* Avatar Circle */}
              {cv.profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cv.profile.photoUrl}
                  alt={cv.profile.fullName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  M
                </div>
              )}
            </div>

            {/* Section: Summary */}
            <div className="space-y-1.5 pt-1">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Summary
              </h2>
              <p className="text-[11px] sm:text-[11.5px] text-gray-800 leading-relaxed text-justify">
                {cv.profile.summary}
              </p>
            </div>

            {/* Section: Experience */}
            <div className="space-y-2">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Experience
              </h2>
              <div className="space-y-3">
                {cv.experiences.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <strong className="text-[12px] font-bold text-black">{exp.role}</strong>
                      <span className="text-[11px] text-gray-500 font-normal">{exp.start} – {exp.end}</span>
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {exp.company} · {exp.location}
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-0.5 pt-0.5">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-snug">
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Education */}
            <div className="space-y-2">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Education
              </h2>
              <div className="space-y-2.5">
                {cv.education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-baseline justify-between">
                      <strong className="text-[12px] font-bold text-black">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </strong>
                      <span className="text-[11px] text-gray-500 font-normal">{edu.start} – {edu.end}</span>
                    </div>
                    <div className="text-[11px] text-gray-600">{edu.school}</div>
                    <div className="text-[11px] text-[#1b7340] font-semibold">
                      Grade: {edu.grade}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Achievements */}
            <div className="space-y-1.5">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Achievements
              </h2>
              <ul className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-0.5">
                {cv.achievements.map((ach, idx) => (
                  <li key={idx} className="leading-snug">
                    {ach}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section: Certifications */}
            <div className="space-y-1.5">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Certifications
              </h2>
              <ul className="list-disc list-outside ml-4 text-[11px] text-gray-700 space-y-0.5">
                {cv.certifications.map((c, idx) => (
                  <li key={idx} className="leading-snug">
                    {c.name} — {c.issuer} ({c.date})
                  </li>
                ))}
              </ul>
            </div>

            {/* Section: Languages */}
            <div className="space-y-2">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Languages
              </h2>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {cv.languages.map((l, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#f3f4f6] text-gray-800 text-[11px] font-medium rounded-xs border border-gray-200"
                  >
                    {l.name} ({l.level})
                  </span>
                ))}
              </div>
            </div>

            {/* Section: Skills */}
            <div className="space-y-2">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {cv.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#0b0f19] text-white text-[11px] font-mono font-medium rounded-2xs shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Section: References */}
            <div className="space-y-2">
              <h2 className="text-[13px] font-bold text-black uppercase tracking-wide border-b-[1.5px] border-black pb-0.5">
                References
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {cv.references.map((ref, idx) => (
                  <div
                    key={idx}
                    className={`space-y-0.5 ${idx === 1 ? 'sm:border-l sm:border-gray-300 sm:pl-4' : ''}`}
                  >
                    <strong className="text-[12px] font-bold text-black block">{ref.name}</strong>
                    <div className="text-[11px] text-gray-700">{ref.title}, {ref.company}</div>
                    <div className="text-[11px] text-purple-600 italic font-medium">{ref.relationship}</div>
                    <div className="text-[11px] text-gray-500">{ref.email}</div>
                    <div className="text-[11px] text-gray-500">{ref.phone}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: Page 1 */}
            <div className="pt-4 text-right text-[11px] text-gray-400 font-mono">
              1
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
