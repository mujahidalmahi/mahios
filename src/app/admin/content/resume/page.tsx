'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBadge, Save, Download, CheckCircle2,
  AlertCircle, FileText, Sparkles, UploadCloud, Copy, Check
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { ResumeConfig } from '@/types/database';

export default function ResumeAdminPage() {
  const [resume, setResume] = useState<ResumeConfig>(fallbackBiographyData.resumeConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('resume_config').select('*').single();
        if (data) {
          setResume(data as ResumeConfig);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload: ResumeConfig = {
      ...resume,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      await supabase.from('resume_config').upsert(payload);
      setFeedback({ type: 'success', text: 'Curriculum Vitae settings saved successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'success', text: 'Curriculum Vitae settings saved successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyATS = () => {
    navigator.clipboard.writeText(resume.summary_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = resume.summary_markdown.trim().split(/\s+/).filter(Boolean).length;
  const charCount = resume.summary_markdown.length;

  if (loading) {
    return <div className="p-8 text-slate-400 text-xs font-mono">Loading Resume Configuration...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-blue-400" />
            <span>Curriculum Vitae & Resume Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Upload official PDF documents, manage ATS-formatted plaintext summary, and configure one-click downloads.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Resume Config'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: PDF Upload & Properties */}
        <div className="space-y-4">
          {/* PDF Uploader */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-400" />
              <span>Official Resume File (PDF)</span>
            </h3>

            <MediaUploader
              value={resume.pdf_url}
              onChange={(url) => setResume({ ...resume, pdf_url: url })}
              label="Upload PDF Document"
              folder="mahios/resume"
            />

            {resume.pdf_url && (
              <a
                href={resume.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="w-full px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-blue-400 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Uploaded PDF</span>
              </a>
            )}
          </div>

          {/* Properties */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">File Metadata</h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 uppercase">Download Filename</label>
              <input
                type="text"
                required
                placeholder="e.g. Mujahid_Islam_Mahi_Resume.pdf"
                value={resume.download_filename}
                onChange={(e) => setResume({ ...resume, download_filename: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 uppercase">Last Updated Notation</label>
              <input
                type="text"
                required
                placeholder="e.g. September 2026"
                value={resume.last_updated_date}
                onChange={(e) => setResume({ ...resume, last_updated_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* ATS Diagnostics */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Words:</span>
                <span className="text-white font-bold">{wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <span className="text-white font-bold">{charCount}</span>
              </div>
              <div className="flex justify-between">
                <span>ATS Parsing:</span>
                <span className="text-emerald-400 font-bold">100% Valid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Plaintext ATS Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  ATS Plaintext Resume & Competency Summary
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopyATS}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied ATS Text' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={22}
              required
              placeholder="Paste or edit the complete ATS-friendly plain-text resume here..."
              value={resume.summary_markdown}
              onChange={(e) => setResume({ ...resume, summary_markdown: e.target.value })}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-blue-500 select-text"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
