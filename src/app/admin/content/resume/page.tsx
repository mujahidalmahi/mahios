'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileBadge, Save, CheckCircle2, AlertCircle, Download,
  Upload, ExternalLink, Loader2, Copy, Check, Calendar, FileText, Sparkles,
  Bold, Italic, List, ListOrdered, Link2, Code, Quote, Eye, FileSymlink,
  Code2, Braces, RefreshCw
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { ResumeConfig } from '@/types/database';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { renderMarkdownToHtml } from '@/lib/utils/markdownRenderer';
import { officialCVData, resolveCVData } from '@/lib/data/cvData';

export default function ResumeAdminPage() {
  const [config, setConfig] = useState<ResumeConfig>(fallbackBiographyData.resumeConfig);
  const [original, setOriginal] = useState<ResumeConfig>(fallbackBiographyData.resumeConfig);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorMode, setEditorMode] = useState<'summary' | 'json'>('summary');
  const [previewTab, setPreviewTab] = useState<'rendered' | 'raw'>('rendered');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const summaryTemplate = officialCVData.profile.summary;
  const fullJsonTemplate = JSON.stringify(officialCVData, null, 2);

  const isCurrentJson = useMemo(() => {
    const trimmed = (config.summary_markdown || '').trim();
    return trimmed.startsWith('{') && trimmed.endsWith('}');
  }, [config.summary_markdown]);

  const handleLoadSummaryTemplate = () => {
    if (config.summary_markdown && config.summary_markdown.trim().length > 0) {
      if (!window.confirm('This will replace your current summary. Continue?')) return;
    }
    setConfig({ ...config, summary_markdown: summaryTemplate });
    setEditorMode('summary');
  };

  const handleLoadJsonTemplate = () => {
    if (config.summary_markdown && config.summary_markdown.trim().length > 0) {
      if (!window.confirm('This will replace your current content with the full official CV JSON. Continue?')) return;
    }
    setConfig({ ...config, summary_markdown: fullJsonTemplate });
    setEditorMode('json');
  };

  // Normalize fields to prevent timestamp discrepancies from falsely triggering "unsaved changes"
  const isDirty = useMemo(() => {
    const normalize = (c: ResumeConfig) => ({
      pdf_url: (c.pdf_url || '').trim(),
      download_filename: (c.download_filename || '').trim(),
      last_updated_date: (c.last_updated_date || '').trim(),
      summary_markdown: (c.summary_markdown || '').trim(),
      is_active: Boolean(c.is_active),
      preview_image_url: (c.preview_image_url || '').trim(),
    });
    return JSON.stringify(normalize(config)) !== JSON.stringify(normalize(original));
  }, [config, original]);

  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('resume_config').select('*').single();
        if (data) {
          setConfig(data as ResumeConfig);
          setOriginal(data as ResumeConfig);
          const trimmed = (data.summary_markdown || '').trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            setEditorMode('json');
          }
        }
      } catch {
        // Table or row may not exist yet — use initial fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // If editor mode is JSON, validate syntax before saving
    if (editorMode === 'json' || isCurrentJson) {
      try {
        JSON.parse(config.summary_markdown);
      } catch (err: any) {
        setFeedback({ type: 'error', text: `JSON Syntax Error: ${err.message}. Please fix before saving.` });
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = {
        ...config,
        updated_at: new Date().toISOString(),
      };
      const res = await adminMutate<ResumeConfig>({
        table: 'resume_config',
        action: 'upsert',
        data: updated,
      });
      if (!res.success) throw new Error(res.error);

      const savedRecord = (res.data as ResumeConfig) || updated;
      setConfig(savedRecord);
      setOriginal(savedRecord);
      setFeedback({ type: 'success', text: 'Resume configuration synchronized successfully with Supabase!' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCopySummary = () => {
    if (!config.summary_markdown) return;
    navigator.clipboard.writeText(config.summary_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentText = config.summary_markdown || '';
    const selectedText = currentText.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const nextValue = currentText.substring(0, start) + replacement + currentText.substring(end);
    setConfig({ ...config, summary_markdown: nextValue });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  if (loading) return <SkeletonFormPage />;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-cyan-400" />
            <span>Curriculum Vitae & Resume Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure PDF document, ATS plain text, verified timestamp, and complete CV content for the desktop Resume app.
          </p>
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
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
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
        {/* Left Column: PDF & Metadata */}
        <div className="space-y-6">
          {/* PDF Source */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Official PDF Document</span>
            </h3>

            {config.pdf_url && (
              <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-700 rounded-lg">
                <FileBadge className="w-8 h-8 text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {config.download_filename || 'Mujahid_Al_Mahi_Resume.pdf'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{config.pdf_url}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={config.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 rounded cursor-pointer border border-blue-800/40"
                    title="Open PDF Preview"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={config.pdf_url}
                    download={config.download_filename || 'Mujahid_Al_Mahi_Resume.pdf'}
                    className="p-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded cursor-pointer border border-emerald-800/40"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            <MediaUploader
              value={config.pdf_url}
              onChange={(url) => {
                const filename = url.split('/').pop() || 'Mujahid_Al_Mahi_Resume.pdf';
                setConfig({
                  ...config,
                  pdf_url: url,
                  download_filename: config.download_filename || filename,
                });
              }}
              label="Upload PDF File to Supabase"
              folder="mahios/resume"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Direct URL or Storage Path
              </label>
              <input
                type="text"
                value={config.pdf_url}
                onChange={(e) => setConfig({ ...config, pdf_url: e.target.value })}
                placeholder="/resume.pdf or https://..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[10px] text-slate-500">
                Can be a local path (e.g. <code>/resume.pdf</code>) or an external HTTPS URL.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Download Filename
                </label>
                <input
                  type="text"
                  value={config.download_filename}
                  onChange={(e) => setConfig({ ...config, download_filename: e.target.value })}
                  placeholder="Mujahid_Al_Mahi_Resume.pdf"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Last Updated Stamp</span>
                </label>
                <input
                  type="text"
                  value={config.last_updated_date}
                  onChange={(e) => setConfig({ ...config, last_updated_date: e.target.value })}
                  placeholder="September 2026"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white">Enable Download & ATS Features</span>
                <p className="text-[10px] text-slate-500">When disabled, visitors will see a notice that the PDF is being updated.</p>
              </div>
              <input
                type="checkbox"
                checked={config.is_active}
                onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: CV Content Editor (Summary Markdown or Full CV JSON) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{editorMode === 'json' ? 'Full CV Data (JSON Mode)' : 'Executive Summary (Markdown)'}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditorMode(editorMode === 'json' ? 'summary' : 'json')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors border border-cyan-800/40"
                  title="Toggle JSON / Summary Mode"
                >
                  {editorMode === 'json' ? <FileText className="w-3 h-3" /> : <Braces className="w-3 h-3" />}
                  <span>{editorMode === 'json' ? 'Summary Mode' : 'JSON Mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={editorMode === 'json' ? handleLoadJsonTemplate : handleLoadSummaryTemplate}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Load starter template"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copy content"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {editorMode === 'json' ? (
                <span>
                  <strong>Full CV Scope:</strong> Modify your profile, experiences, education, skills, certifications, achievements, languages, and references directly via structured JSON.
                </span>
              ) : (
                <span>
                  Controls the <strong>Executive Summary</strong> in the CV viewer. Use <strong>JSON Mode</strong> above if you want to customize all CV sections.
                </span>
              )}
            </p>

            {/* Markdown Toolbar (shown only in summary mode) */}
            {editorMode === 'summary' && (
              <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-950 border border-slate-800 rounded-t-lg border-b-0 text-slate-400">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**', '**')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer font-bold"
                  title="Bold (**text**)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*', '*')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer italic"
                  title="Italic (*text*)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <span className="h-3.5 w-px bg-slate-800 mx-0.5" />
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer"
                  title="Bullet List (- Item)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('1. ')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer"
                  title="Numbered List (1. Item)"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[', '](https://...)')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer"
                  title="Hyperlink ([title](url))"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`', '`')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer"
                  title="Inline Code (`code`)"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded text-xs cursor-pointer"
                  title="Blockquote (> Quote)"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={editorMode === 'json' ? 14 : 9}
              value={config.summary_markdown}
              onChange={(e) => setConfig({ ...config, summary_markdown: e.target.value })}
              placeholder={editorMode === 'json' ? 'Paste full CV JSON object...' : 'Enter executive summary markdown...'}
              className={`w-full px-3 py-2.5 bg-slate-950 border border-slate-800 ${editorMode === 'summary' ? 'rounded-b-lg rounded-t-none' : 'rounded-lg'} text-xs font-mono text-white focus:outline-none focus:border-blue-500 resize-y leading-relaxed`}
            />

            {/* Live ATS Preview Box */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Live Preview
                </span>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('rendered')}
                    className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                      previewTab === 'rendered'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Formatted
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('raw')}
                    className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                      previewTab === 'raw'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Raw Content
                  </button>
                </div>
              </div>

              {previewTab === 'rendered' ? (
                <div
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans leading-relaxed max-h-60 overflow-y-auto space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: isCurrentJson
                      ? `<div class="text-emerald-400 font-mono text-[11px] mb-2">✓ Valid CV JSON Mode active: full CV structure loaded</div><div class="text-slate-300">${renderMarkdownToHtml(resolveCVData(config.summary_markdown).profile.summary, 'dark')}</div>`
                      : config.summary_markdown
                        ? renderMarkdownToHtml(config.summary_markdown, 'dark')
                        : '<span class="text-slate-600 italic">Summary is currently empty. Enter markdown details above.</span>',
                  }}
                />
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {config.summary_markdown || (
                    <span className="text-slate-600 italic">Summary is currently empty. Enter details above.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
