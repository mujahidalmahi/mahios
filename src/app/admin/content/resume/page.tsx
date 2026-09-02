'use client';

import React, { useState, useEffect } from 'react';
import {
  FileBadge, Save, CheckCircle2, AlertCircle, Download, Eye,
  EyeOff, Upload, ExternalLink, Loader2
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createClient } from '@/lib/supabase/client';

interface ResumeConfig {
  id?: string;
  resume_pdf_url: string;
  resume_pdf_filename: string;
  show_skills_section: boolean;
  show_experience_section: boolean;
  show_projects_section: boolean;
  show_education_section: boolean;
  show_achievements_section: boolean;
  show_philosophy_section: boolean;
  show_contact_section: boolean;
  custom_summary: string;
  updated_at?: string;
}

const defaultConfig: ResumeConfig = {
  resume_pdf_url: '',
  resume_pdf_filename: '',
  show_skills_section: true,
  show_experience_section: true,
  show_projects_section: true,
  show_education_section: true,
  show_achievements_section: true,
  show_philosophy_section: false,
  show_contact_section: true,
  custom_summary: '',
};

const sections = [
  { key: 'show_skills_section', label: 'Skills & Tech Stack', description: 'Language and framework proficiency radar' },
  { key: 'show_experience_section', label: 'Work Experience', description: 'Career positions and company history' },
  { key: 'show_projects_section', label: 'Projects Portfolio', description: 'Notable engineering projects and builds' },
  { key: 'show_education_section', label: 'Education', description: 'Degrees and academic qualifications' },
  { key: 'show_achievements_section', label: 'Achievements & Certifications', description: 'Awards, certifications, and honors' },
  { key: 'show_philosophy_section', label: 'Engineering Philosophy', description: 'Principles and design philosophy' },
  { key: 'show_contact_section', label: 'Contact Information', description: 'Email, phone, and social links' },
] as const;

export default function ResumeAdminPage() {
  const [config, setConfig] = useState<ResumeConfig>(defaultConfig);
  const [original, setOriginal] = useState<ResumeConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isDirty = JSON.stringify(config) !== JSON.stringify(original);
  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('resume_config').select('*').single();
        if (data) { setConfig(data); setOriginal(data); }
      } catch {
        // table may not exist yet — use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const supabase = createClient();
      const updated = { ...config, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('resume_config').upsert(updated);
      if (error) throw error;
      setOriginal(updated);
      setFeedback({ type: 'success', text: 'Resume configuration saved successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (loading) return <SkeletonFormPage />;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-cyan-400" />
            <span>Curriculum Vitae Configuration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Upload your PDF resume and configure which sections are visible in the resume app</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
              Unsaved changes
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Config'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PDF Upload */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>PDF Resume File</span>
            </h3>

            {config.resume_pdf_url && (
              <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-700 rounded-lg">
                <FileBadge className="w-8 h-8 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {config.resume_pdf_filename || 'resume.pdf'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{config.resume_pdf_url}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={config.resume_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 rounded cursor-pointer border border-blue-800/40"
                    title="Preview PDF"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={config.resume_pdf_url}
                    download={config.resume_pdf_filename || 'resume.pdf'}
                    className="p-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded cursor-pointer border border-emerald-800/40"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            <MediaUploader
              value={config.resume_pdf_url}
              onChange={(url) => setConfig({ ...config, resume_pdf_url: url, resume_pdf_filename: url.split('/').pop() || 'resume.pdf' })}
              label="Upload PDF Resume"
              folder="mahios/resume"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Or External PDF URL</label>
              <input
                type="url"
                value={config.resume_pdf_url}
                onChange={(e) => setConfig({ ...config, resume_pdf_url: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-500">Supports: Supabase Storage, Google Drive, Dropbox, or any direct PDF link</p>
            </div>
          </div>

          {/* Custom Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Professional Summary Override</h3>
            <p className="text-[11px] text-slate-500">Optional: overrides the bio summary shown in the resume app. Leave blank to use the default site bio.</p>
            <textarea
              rows={4}
              value={config.custom_summary}
              onChange={(e) => setConfig({ ...config, custom_summary: e.target.value })}
              placeholder="A brief professional summary tailored for your resume..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Section Visibility */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Section Visibility</span>
          </h3>
          <p className="text-[11px] text-slate-500">Control which sections appear in the Resume app window.</p>

          <div className="space-y-2">
            {sections.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors group"
              >
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">{label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{description}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {config[key] ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <div
                    className={`w-9 h-5 rounded-full relative transition-colors ${
                      config[key] ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        config[key] ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                    <input
                      type="checkbox"
                      checked={config[key]}
                      onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
