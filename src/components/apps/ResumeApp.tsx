'use client';

import React, { useState, useMemo } from 'react';
import {
  FileBadge, Download, Printer, Copy, Check,
  Share2, Eye, FileText, MapPin, Mail, Globe,
  Calendar, GraduationCap, Briefcase, Code2,
  Sparkles, Award
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/shared/Icons';
import { ResumeConfig, BiographyDatabaseData, Experience, Education } from '@/types/database';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { useSystemStore } from '@/stores/systemStore';
import { printDocument } from '@/lib/utils/printDocument';
import { renderMarkdownToHtml } from '@/lib/utils/markdownRenderer';

interface ResumeAppProps {
  resume: ResumeConfig;
  data?: BiographyDatabaseData;
}

export default function ResumeApp({ resume, data }: ResumeAppProps) {
  const [viewMode, setViewMode] = useState<'document' | 'plaintext'>('document');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { playSound } = useSystemStore();

  // Resolve experiences and education with fallback
  const experienceList: Experience[] = useMemo(() => {
    if (data?.experiences && data.experiences.length > 0) {
      return data.experiences;
    }
    return fallbackBiographyData.experiences;
  }, [data?.experiences]);

  const educationList: Education[] = useMemo(() => {
    if (data?.education && data.education.length > 0) {
      return data.education;
    }
    return fallbackBiographyData.education;
  }, [data?.education]);

  // Executive summary with fallback
  const executiveSummary = useMemo(() => {
    if (resume.summary_markdown && resume.summary_markdown.trim().length > 0) {
      return resume.summary_markdown.trim();
    }
    return 'Full-Stack Software Engineer with 5+ years of experience architecting distributed web applications and modern interactive systems. Specialized in Next.js 16, React 19, TypeScript, PostgreSQL, Supabase, and real-time interactive user interfaces with sub-second responsiveness.';
  }, [resume.summary_markdown]);

  // Generate complete ATS-optimized plaintext resume
  const fullPlainTextResume = useMemo(() => {
    const expText = experienceList
      .map((exp) => {
        const startYear = exp.start_date ? new Date(exp.start_date).getFullYear() : '2023';
        const endYear = exp.end_date || (exp.is_current ? 'Present' : '');
        const cleanDesc = exp.description_html ? exp.description_html.replace(/<[^>]*>/g, '').trim() : '';
        const achievementsText = exp.achievements?.length
          ? '\n  Key Contributions:\n' +
            exp.achievements
              .map((a: any) => `  - ${typeof a === 'string' ? a : a.description || a.title}`)
              .join('\n')
          : '';
        const techText = exp.technologies?.length ? `\n  Tech: ${exp.technologies.join(', ')}` : '';
        return `* ${exp.role} | ${exp.company} (${startYear} - ${endYear})\n  Location: ${exp.location || 'Dhaka, Bangladesh'}\n  ${cleanDesc}${achievementsText}${techText}`;
      })
      .join('\n\n');

    const eduText = educationList
      .map((edu) => {
        return `* ${edu.degree} in ${edu.field_of_study}\n  Institution: ${edu.institution} (${edu.start_year} - ${edu.end_year})\n  Grade: ${edu.grade || 'N/A'}`;
      })
      .join('\n\n');

    return `MUJAHID AL MAHI
Full-Stack Software Engineer & Systems Architect
Location: Dhaka, Bangladesh
Email: mujahidmahi.official@gmail.com
Portfolio: https://mujahidmahi.me
GitHub: https://github.com/mujahidalmahi
LinkedIn: https://linkedin.com/in/mujahidmahi

============================================================
EXECUTIVE SUMMARY
============================================================
${executiveSummary}

============================================================
CORE TECHNICAL COMPETENCIES
============================================================
* Frontend & Interactive Systems:
  Next.js 16 (App Router), React 19, TypeScript, JavaScript (ESNext), Tailwind CSS 4, Turbopack, HTML5, CSS3, Zustand, TipTap, Micro-interactions

* Backend & Cloud Architecture:
  Node.js, Express, RESTful & GraphQL APIs, Next.js Server Actions, Edge Middleware, Vercel Serverless, WebSockets, OAuth 2.0

* Databases & Storage:
  PostgreSQL, Supabase (RLS, Auth, Storage, Edge Functions), Redis Caching, IndexedDB, Database Schema Design & Migrations

* Systems, Architecture & DevOps:
  Distributed Systems, Clean Architecture, Git, Docker, CI/CD Actions, Web Performance Optimization (Lighthouse 100), Security Hardening

============================================================
PROFESSIONAL EXPERIENCE
============================================================
${expText}

============================================================
ACADEMIC BACKGROUND & EDUCATION
============================================================
${eduText}

============================================================
NOTABLE SOFTWARE PROJECTS
============================================================
* MahiOS (Web Desktop Operating System)
  Engineered a retro-tactile desktop operating system inside Next.js 16 App Router featuring dynamic window management, multi-tasking, deep-linking architecture, Supabase CRUD persistence, and virtual terminal.

* Enterprise High-Throughput Web Applications
  Mission-critical web applications with sub-100ms API endpoints, automated CI/CD pipelines, and 100/100 Lighthouse performance metrics.

============================================================
ATS Optimized • Verified September 2026 • Mujahid Al Mahi
`;
  }, [executiveSummary, experienceList, educationList]);

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

    // Build print-optimized HTML
    const printContentHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6;">
        <div style="border-bottom: 2.5px solid #000080; padding-bottom: 12px; margin-bottom: 18px;">
          <h1 style="font-size: 22pt; font-weight: 800; margin: 0 0 4px 0; color: #000080; letter-spacing: -0.5px;">MUJAHID AL MAHI</h1>
          <div style="font-size: 11pt; font-weight: 600; color: #334155; margin-bottom: 8px;">Full-Stack Software Engineer & Systems Architect</div>
          <div style="font-size: 9.5pt; color: #64748b; display: flex; flex-wrap: wrap; gap: 14px;">
            <span>📍 Dhaka, Bangladesh</span>
            <span>✉️ mujahidmahi.official@gmail.com</span>
            <span>🌐 https://mujahidmahi.me</span>
            <span>🐙 github.com/mujahidalmahi</span>
            <span>🔗 linkedin.com/in/mujahidmahi</span>
          </div>
        </div>

        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">Executive Summary</h2>
          <div style="font-size: 10pt; color: #1e293b; margin: 0; line-height: 1.65;">${renderMarkdownToHtml(executiveSummary, 'light')}</div>
        </div>

        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">Technical Competencies</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 9.5pt;">
            <div style="background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 3px;">
              <strong>Frontend & Web:</strong> Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Turbopack, HTML5/CSS3, Zustand
            </div>
            <div style="background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 3px;">
              <strong>Backend & Cloud:</strong> Node.js, Express, REST APIs, Next.js Server Actions, Edge Middleware, Supabase, Vercel
            </div>
            <div style="background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 3px;">
              <strong>Databases & Cache:</strong> PostgreSQL, Supabase (RLS, Auth, Storage), Redis, IndexedDB, Schema Migrations
            </div>
            <div style="background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 3px;">
              <strong>Systems & DevOps:</strong> Distributed Systems, Clean Architecture, Git, Docker, CI/CD Actions, Lighthouse 100
            </div>
          </div>
        </div>

        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">Professional Experience</h2>
          ${experienceList
            .map((exp) => {
              const startYear = exp.start_date ? new Date(exp.start_date).getFullYear() : '2023';
              const endYear = exp.end_date || (exp.is_current ? 'Present' : '');
              return `
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div><strong style="font-size: 10.5pt;">${exp.role}</strong> — <span style="color: #000080; font-weight: 600;">${exp.company}</span></div>
                    <div style="font-size: 9pt; color: #64748b; font-family: monospace;">${startYear} – ${endYear} | ${exp.location || 'Dhaka, Bangladesh'}</div>
                  </div>
                  <div style="font-size: 9.5pt; color: #334155; margin-top: 4px;">${exp.description_html || ''}</div>
                  ${exp.technologies?.length ? `<div style="font-size: 8.5pt; color: #475569; margin-top: 4px;"><em>Tech:</em> ${exp.technologies.join(', ')}</div>` : ''}
                </div>
              `;
            })
            .join('')}
        </div>

        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #000080; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">Education & Academic Background</h2>
          ${educationList
            .map((edu) => `
              <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <div><strong style="font-size: 10pt;">${edu.degree} in ${edu.field_of_study}</strong> — <span style="color: #000080; font-weight: 600;">${edu.institution}</span></div>
                  <div style="font-size: 9pt; color: #64748b; font-family: monospace;">${edu.start_year} – ${edu.end_year}${edu.grade ? ` | ${edu.grade}` : ''}</div>
                </div>
              </div>
            `)
            .join('')}
        </div>

        <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #94a3b8; text-align: center; font-family: monospace;">
          ATS Optimized Curriculum Vitae • Verified Document • Mujahid Al Mahi • Dhaka, Bangladesh
        </div>
      </div>
    `;

    printDocument({
      title: resume.download_filename ? resume.download_filename.replace('.pdf', '') : 'Mujahid_Al_Mahi_Resume',
      categoryBadge: 'Curriculum Vitae & Competency Summary',
      periodOrDate: `Verified: ${resume.last_updated_date || 'September 2026'}`,
      author: 'Mujahid Al Mahi',
      contentHtml: printContentHtml,
      footerNote: 'ATS-Optimized Curriculum Vitae • Mujahid Al Mahi',
    });
  };

  const handleDownload = () => {
    playSound('click');
    if (resume.pdf_url && (resume.pdf_url.startsWith('http://') || resume.pdf_url.startsWith('https://'))) {
      window.open(resume.pdf_url, '_blank');
      return;
    }
    // If no external URL or pointing to local path, trigger standard print-to-PDF
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
                {resume.download_filename || 'Mujahid_Al_Mahi_Resume.pdf'}
              </h2>
              <span className="text-[9px] px-1 py-px bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono rounded-2xs font-semibold shrink-0">
                ATS
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Verified: {resume.last_updated_date || 'September 2026'}
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

      {/* Mode 1: Document View (Clean Formatted A4 Paper Sheet) */}
      {viewMode === 'document' ? (
        <div className="bg-[#6b7280]/15 p-2 sm:p-5 retro-box-inset rounded-xs flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-300 p-6 sm:p-10 space-y-7 text-[#0f172a] rounded-xs select-text">
            {/* Header / Identity Banner */}
            <div className="border-b-2 border-[#000080] pb-4 space-y-2 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#000080]">
                  MUJAHID AL MAHI
                </h1>
                <span className="text-xs font-mono text-gray-500">
                  Verified: {resume.last_updated_date || 'September 2026'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-700">
                Full-Stack Software Engineer & Systems Architect
              </p>

              {/* Contact Information & Channels */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-gray-600 font-sans pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Dhaka, Bangladesh
                </span>
                <a
                  href="mailto:mujahidmahi.official@gmail.com"
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  mujahidmahi.official@gmail.com
                </a>
                <a
                  href="https://mujahidmahi.me"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  mujahidmahi.me
                </a>
                <a
                  href="https://github.com/mujahidalmahi"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-gray-800" />
                  github.com/mujahidalmahi
                </a>
                <a
                  href="https://linkedin.com/in/mujahidmahi"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[#000080] underline decoration-gray-300 transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 text-[#0077b5]" />
                  linkedin.com/in/mujahidmahi
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
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(executiveSummary, 'light') }}
              />
            </div>

            {/* Section: Technical Competencies */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Code2 className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Technical Competencies & Toolchain
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xs space-y-1">
                  <span className="font-bold text-[#000080] block">Frontend & Interactive Systems:</span>
                  <p className="text-gray-700 leading-relaxed">
                    Next.js 16 (App Router), React 19, TypeScript, JavaScript (ESNext), Tailwind CSS 4, Turbopack, HTML5, CSS3, Zustand, TipTap, Micro-interactions.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xs space-y-1">
                  <span className="font-bold text-[#000080] block">Backend & Cloud Architecture:</span>
                  <p className="text-gray-700 leading-relaxed">
                    Node.js, Express, RESTful & GraphQL APIs, Next.js Server Actions, Edge Middleware, Vercel Serverless, WebSockets, OAuth 2.0.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xs space-y-1">
                  <span className="font-bold text-[#000080] block">Databases & Storage:</span>
                  <p className="text-gray-700 leading-relaxed">
                    PostgreSQL, Supabase (RLS, Auth, Storage, Edge Functions), Redis Caching, IndexedDB, Database Schema Design & Migrations.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xs space-y-1">
                  <span className="font-bold text-[#000080] block">Systems, Architecture & DevOps:</span>
                  <p className="text-gray-700 leading-relaxed">
                    Distributed Systems, Clean Architecture, Git, Docker, CI/CD Actions, Web Performance Optimization (Lighthouse 100), Security Hardening.
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Professional Work Experience */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Professional Experience
                </h2>
              </div>
              <div className="space-y-4">
                {experienceList.map((exp) => (
                  <div key={exp.id} className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-sm font-bold text-gray-900">{exp.role}</span>
                        <span className="text-sm font-semibold text-[#000080]"> — {exp.company}</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">
                        {exp.start_date ? new Date(exp.start_date).getFullYear() : '2023'} – {exp.end_date || (exp.is_current ? 'Present' : '')} {exp.location ? `• ${exp.location}` : ''}
                      </span>
                    </div>
                    {exp.description_html && (
                      <div
                        className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: exp.description_html }}
                      />
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
                        {exp.achievements.map((ach: any, idx: number) => (
                          <li key={idx}>
                            {typeof ach === 'string' ? ach : ach.description || ach.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.technologies.map((tech: string, idx: number) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-2xs font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Academic Background & Education */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Academic Background & Education
                </h2>
              </div>
              <div className="space-y-3">
                {educationList.map((edu) => (
                  <div key={edu.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-sm font-bold text-gray-900">{edu.degree} in {edu.field_of_study}</span>
                      <span className="text-sm font-semibold text-[#000080]"> — {edu.institution}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500 shrink-0">
                      <span>{edu.start_year} – {edu.end_year}</span>
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

            {/* Section: Notable Software Projects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                <Award className="w-3.5 h-3.5 text-[#000080]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#000080]">
                  Notable Software Projects & Systems
                </h2>
              </div>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xs space-y-1">
                  <span className="font-bold text-[#000080] block text-[13px]">MahiOS — Web Desktop Operating System</span>
                  <p className="leading-relaxed">
                    Engineered a retro-tactile desktop operating system inside Next.js 16 App Router featuring dynamic window management, multi-tasking, deep-linking architecture, Supabase CRUD persistence, and virtual terminal.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xs space-y-1">
                  <span className="font-bold text-[#000080] block text-[13px]">Enterprise High-Throughput Web Applications</span>
                  <p className="leading-relaxed">
                    Developed mission-critical web applications with sub-100ms API endpoints, automated CI/CD pipelines, robust role-based access control, and 100/100 Lighthouse performance metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-1">
              <span>Official Curriculum Vitae • Mujahid Al Mahi</span>
              <span>ATS Optimized & Machine Readable • Dhaka, Bangladesh</span>
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

