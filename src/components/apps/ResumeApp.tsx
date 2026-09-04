'use client';

import React, { useState } from 'react';
import {
  FileBadge, Download, Printer, Copy, Check,
  Search, ExternalLink, Sparkles, CheckCircle2, User
} from 'lucide-react';
import { ResumeConfig } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { printDocument } from '@/lib/utils/printDocument';

interface ResumeAppProps {
  resume: ResumeConfig;
}

export default function ResumeApp({ resume }: ResumeAppProps) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { playSound } = useSystemStore();

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

  const handleDownload = () => {
    playSound('click');
    if (resume.pdf_url) {
      window.open(resume.pdf_url, '_blank');
    } else {
      alert('Resume PDF is currently being finalized. You can use the Print or Copy Text feature below.');
    }
  };

  const handlePrint = () => {
    playSound('click');
    printDocument({
      title: resume.download_filename ? resume.download_filename.replace('.pdf', '') : 'Mujahid_Al_Mahi_Resume',
      categoryBadge: 'Curriculum Vitae & Competency Summary',
      periodOrDate: `Verified: ${resume.last_updated_date || 'September 2026'}`,
      author: 'Mujahid Al Mahi',
      plainText: resume.summary_markdown,
      footerNote: 'ATS-Optimized Curriculum Vitae • Mujahid Al Mahi',
    });
  };

  const handleCopyText = () => {
    playSound('click');
    navigator.clipboard.writeText(resume.summary_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Header Banner & Action Bar */}
      <div className="p-4 bg-[#f3f4f6] retro-box-inset rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 retro-box-outset bg-white flex items-center justify-center text-[#000080] shrink-0">
            <FileBadge className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#000080] truncate">
              {resume.download_filename || 'Mujahid_Islam_Mahi_Resume.pdf'}
            </h2>
            <p className="text-[11px] text-gray-500 font-mono">
              Verified & Current: {resume.last_updated_date || 'September 2026'}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleShareLink}
            className="retro-btn px-2.5 py-1.5 font-bold text-xs text-[#000080] flex items-center gap-1.5 cursor-pointer"
            title="Copy Direct Share Link to Resume"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="retro-btn px-2.5 py-1.5 font-bold text-xs text-gray-800 flex items-center gap-1.5 cursor-pointer"
            title="Copy ATS-friendly Plain Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="retro-btn px-2.5 py-1.5 font-bold text-xs text-gray-800 flex items-center gap-1.5 cursor-pointer"
            title="Print or Save to PDF via Browser"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="retro-btn px-3 py-1.5 font-bold text-xs text-[#000080] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Resume Content Paper View */}
      <div className="p-5 bg-white retro-box-inset space-y-4">
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Official Curriculum Vitae & Competency Summary
          </h3>
          <span className="text-[10px] font-mono text-emerald-700 font-bold">ATS OPTIMIZED</span>
        </div>

        <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-800 bg-[#fafafa] p-4 border border-gray-200 rounded-2xs select-text">
          {resume.summary_markdown}
        </div>
      </div>
    </div>
  );
}
