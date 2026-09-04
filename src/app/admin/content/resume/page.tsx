'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileBadge, Save, CheckCircle2, AlertCircle, Download,
  Upload, ExternalLink, Loader2, Copy, Check, Calendar, FileText, Sparkles,
  RefreshCw, Braces, Plus, Trash2, Image as ImageIcon,
  GraduationCap, Briefcase, Award, ShieldCheck, Languages, Users, Code2, User
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { SkeletonFormPage } from '@/components/admin/SkeletonLoader';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { ResumeConfig } from '@/types/database';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { officialCVData, resolveCVData, CVData } from '@/lib/data/cvData';

export default function ResumeAdminPage() {
  const [config, setConfig] = useState<ResumeConfig>(fallbackBiographyData.resumeConfig);
  const [original, setOriginal] = useState<ResumeConfig>(fallbackBiographyData.resumeConfig);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<'form' | 'json'>('form');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active CV state parsed from summary_markdown
  const [cvState, setCvState] = useState<CVData>(officialCVData);
  const [jsonString, setJsonString] = useState<string>(JSON.stringify(officialCVData, null, 2));

  // When cvState updates in form mode, sync jsonString and config.summary_markdown
  const updateCvState = (newCv: CVData) => {
    setCvState(newCv);
    const serialized = JSON.stringify(newCv, null, 2);
    setJsonString(serialized);
    setConfig((prev) => ({ ...prev, summary_markdown: serialized }));
  };

  // When JSON text is edited directly in json mode
  const handleJsonChange = (val: string) => {
    setJsonString(val);
    setConfig((prev) => ({ ...prev, summary_markdown: val }));
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object') {
        setCvState(resolveCVData(val));
      }
    } catch {
      // invalid JSON during typing, will validate on save
    }
  };

  // Reset to default official CV data
  const handleResetDefaults = () => {
    if (window.confirm('Reset all CV fields, sections, and photo to the official default data?')) {
      updateCvState(officialCVData);
    }
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
          const parsed = resolveCVData(data.summary_markdown);
          setCvState(parsed);
          setJsonString(JSON.stringify(parsed, null, 2));
        }
      } catch {
        // Table or row may not exist yet — use initial fallback
        const parsed = resolveCVData(fallbackBiographyData.resumeConfig.summary_markdown);
        setCvState(parsed);
        setJsonString(JSON.stringify(parsed, null, 2));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON if in json tab
    if (editorTab === 'json') {
      try {
        JSON.parse(jsonString);
      } catch (err: any) {
        setFeedback({ type: 'error', text: `JSON Syntax Error: ${err.message}. Please correct before saving.` });
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = {
        ...config,
        summary_markdown: JSON.stringify(cvState, null, 2),
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
      setFeedback({ type: 'success', text: 'CV Configuration and content saved successfully to Supabase!' });
    } catch (err) {
      setFeedback({ type: 'error', text: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(cvState, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <SkeletonFormPage />;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-cyan-400" />
            <span>Curriculum Vitae Studio & Content Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize every section of your CV (headshot photo, experience, education, skills, certs) with default fallback values.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
            title="Reset all sections to default official values"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
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

      {/* Top Controls: PDF Settings & Metadata */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Official Downloadable PDF Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Direct PDF URL / Path</label>
            <input
              type="text"
              value={config.pdf_url || ''}
              onChange={(e) => setConfig({ ...config, pdf_url: e.target.value })}
              placeholder="/resume.pdf or https://..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Download Filename</label>
            <input
              type="text"
              value={config.download_filename || ''}
              onChange={(e) => setConfig({ ...config, download_filename: e.target.value })}
              placeholder="Mujahid_Al_Mahi_Resume.pdf"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Last Verified Date</label>
            <input
              type="text"
              value={config.last_updated_date || ''}
              onChange={(e) => setConfig({ ...config, last_updated_date: e.target.value })}
              placeholder="September 2026"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

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
          label="Upload or Replace PDF File in Supabase Storage"
          folder="mahios/resume"
        />
      </div>

      {/* Tab Switcher: Visual Form Editor vs Raw JSON Mode */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditorTab('form')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              editorTab === 'form' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Interactive Form Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setEditorTab('json')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              editorTab === 'json' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Raw JSON Editor</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopyJson}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
          title="Copy CV Data as JSON"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
        </button>
      </div>

      {/* Editor Content */}
      {editorTab === 'form' ? (
        <div className="space-y-6">
          {/* Section 1: Profile & Photo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>1. Profile & Headshot Photo</span>
            </h3>

            {/* Photo Avatar Preview & Uploader */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                {cvState.profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cvState.profile.photoUrl}
                    alt="CV Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/50 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl border border-slate-700">
                    M
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Headshot Photo URL / Path</span>
                  </label>
                  <input
                    type="text"
                    value={cvState.profile.photoUrl || ''}
                    onChange={(e) =>
                      updateCvState({
                        ...cvState,
                        profile: { ...cvState.profile, photoUrl: e.target.value },
                      })
                    }
                    placeholder="/images/profile-cv.png or https://..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <MediaUploader
                  value={cvState.profile.photoUrl}
                  onChange={(url) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, photoUrl: url },
                    })
                  }
                  label="Upload Headshot Picture to Supabase"
                  folder="mahios/profile"
                />
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={cvState.profile.fullName}
                  onChange={(e) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, fullName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Professional Title</label>
                <input
                  type="text"
                  value={cvState.profile.title}
                  onChange={(e) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Location</label>
                <input
                  type="text"
                  value={cvState.profile.location}
                  onChange={(e) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, location: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={cvState.profile.email}
                  onChange={(e) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Phone Number</label>
                <input
                  type="text"
                  value={cvState.profile.phone}
                  onChange={(e) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Portfolio Website</label>
                <input
                  type="text"
                  value={cvState.profile.website}
                  onChange={(e) =>
                    updateCvState({
                      ...cvState,
                      profile: { ...cvState.profile, website: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>2. Executive Summary</span>
            </h3>
            <textarea
              rows={4}
              value={cvState.profile.summary}
              onChange={(e) =>
                updateCvState({
                  ...cvState,
                  profile: { ...cvState.profile, summary: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
            />
          </div>

          {/* Section 3: Professional Experience */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>3. Professional Experience ({cvState.experiences.length})</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  updateCvState({
                    ...cvState,
                    experiences: [
                      ...cvState.experiences,
                      {
                        company: 'New Company',
                        role: 'Software Engineer',
                        start: 'Jan 2026',
                        end: 'Present',
                        location: 'Dhaka, Bangladesh',
                        bullets: ['Key contribution or responsibility'],
                      },
                    ],
                  })
                }
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="space-y-4">
              {cvState.experiences.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white">Experience #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCvState({
                          ...cvState,
                          experiences: cvState.experiences.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 text-red-400 hover:bg-red-950/40 rounded cursor-pointer"
                      title="Delete experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400">Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...cvState.experiences];
                          updated[idx].role = e.target.value;
                          updateCvState({ ...cvState, experiences: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...cvState.experiences];
                          updated[idx].company = e.target.value;
                          updateCvState({ ...cvState, experiences: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Dates (e.g. Mar 2026 – Present)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={exp.start}
                          onChange={(e) => {
                            const updated = [...cvState.experiences];
                            updated[idx].start = e.target.value;
                            updateCvState({ ...cvState, experiences: updated });
                          }}
                          className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                        <span className="text-slate-500">–</span>
                        <input
                          type="text"
                          value={exp.end}
                          onChange={(e) => {
                            const updated = [...cvState.experiences];
                            updated[idx].end = e.target.value;
                            updateCvState({ ...cvState, experiences: updated });
                          }}
                          className="w-1/2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...cvState.experiences];
                          updated[idx].location = e.target.value;
                          updateCvState({ ...cvState, experiences: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Bullets */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400">Bullet Points</label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...cvState.experiences];
                          updated[idx].bullets.push('New achievement or milestone');
                          updateCvState({ ...cvState, experiences: updated });
                        }}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const updated = [...cvState.experiences];
                            updated[idx].bullets[bIdx] = e.target.value;
                            updateCvState({ ...cvState, experiences: updated });
                          }}
                          className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...cvState.experiences];
                            updated[idx].bullets = updated[idx].bullets.filter((_, i) => i !== bIdx);
                            updateCvState({ ...cvState, experiences: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Academic Background & Education */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>4. Education ({cvState.education.length})</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  updateCvState({
                    ...cvState,
                    education: [
                      ...cvState.education,
                      {
                        school: 'Institution Name',
                        degree: 'Degree / Certificate',
                        field: 'Field of Study',
                        start: '2025',
                        end: '2029',
                        grade: '3.75 / 4.00 CGPA',
                      },
                    ],
                  })
                }
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3">
              {cvState.education.map((edu, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-white">Education #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateCvState({
                          ...cvState,
                          education: cvState.education.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 text-red-400 hover:bg-red-950/40 rounded cursor-pointer"
                      title="Delete education entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...cvState.education];
                          updated[idx].degree = e.target.value;
                          updateCvState({ ...cvState, education: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Field of Study (Optional)</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => {
                          const updated = [...cvState.education];
                          updated[idx].field = e.target.value;
                          updateCvState({ ...cvState, education: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">School / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...cvState.education];
                          updated[idx].school = e.target.value;
                          updateCvState({ ...cvState, education: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Start Date</label>
                      <input
                        type="text"
                        value={edu.start}
                        onChange={(e) => {
                          const updated = [...cvState.education];
                          updated[idx].start = e.target.value;
                          updateCvState({ ...cvState, education: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">End Date</label>
                      <input
                        type="text"
                        value={edu.end}
                        onChange={(e) => {
                          const updated = [...cvState.education];
                          updated[idx].end = e.target.value;
                          updateCvState({ ...cvState, education: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Grade / GPA</label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => {
                          const updated = [...cvState.education];
                          updated[idx].grade = e.target.value;
                          updateCvState({ ...cvState, education: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-emerald-400 font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Technical Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>5. Technical Skills</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Manage skill badges displayed in the dark pills on your CV. Add new skills or remove existing ones.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {cvState.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-white flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCvState({
                        ...cvState,
                        skills: cvState.skills.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 max-w-sm">
              <input
                type="text"
                id="newSkillInput"
                placeholder="New skill (e.g. Python, GraphQL)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    if (input.value.trim() && !cvState.skills.includes(input.value.trim())) {
                      updateCvState({
                        ...cvState,
                        skills: [...cvState.skills, input.value.trim()],
                      });
                      input.value = '';
                    }
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('newSkillInput') as HTMLInputElement;
                  if (input && input.value.trim() && !cvState.skills.includes(input.value.trim())) {
                    updateCvState({
                      ...cvState,
                      skills: [...cvState.skills, input.value.trim()],
                    });
                    input.value = '';
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium cursor-pointer"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Section 6: Achievements & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Achievements */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>6. Achievements ({cvState.achievements.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    updateCvState({
                      ...cvState,
                      achievements: [...cvState.achievements, 'New achievement or award'],
                    })
                  }
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-2">
                {cvState.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={ach}
                      onChange={(e) => {
                        const updated = [...cvState.achievements];
                        updated[idx] = e.target.value;
                        updateCvState({ ...cvState, achievements: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateCvState({
                          ...cvState,
                          achievements: cvState.achievements.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>7. Certifications ({cvState.certifications.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    updateCvState({
                      ...cvState,
                      certifications: [
                        ...cvState.certifications,
                        { name: 'Certificate Name', issuer: 'Issuer Organization', date: '2026' },
                      ],
                    })
                  }
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  + Add Cert
                </button>
              </div>
              <div className="space-y-2">
                {cvState.certifications.map((c, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center gap-2">
                    <input
                      type="text"
                      value={c.name}
                      placeholder="Name"
                      onChange={(e) => {
                        const updated = [...cvState.certifications];
                        updated[idx].name = e.target.value;
                        updateCvState({ ...cvState, certifications: updated });
                      }}
                      className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      value={c.issuer}
                      placeholder="Issuer"
                      onChange={(e) => {
                        const updated = [...cvState.certifications];
                        updated[idx].issuer = e.target.value;
                        updateCvState({ ...cvState, certifications: updated });
                      }}
                      className="w-1/3 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      value={c.date}
                      placeholder="Year"
                      onChange={(e) => {
                        const updated = [...cvState.certifications];
                        updated[idx].date = e.target.value;
                        updateCvState({ ...cvState, certifications: updated });
                      }}
                      className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateCvState({
                          ...cvState,
                          certifications: cvState.certifications.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 7: Languages & References */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Languages className="w-4 h-4 text-indigo-400" />
                  <span>8. Languages ({cvState.languages.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    updateCvState({
                      ...cvState,
                      languages: [...cvState.languages, { name: 'Language', level: 'Conversational' }],
                    })
                  }
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  + Add Language
                </button>
              </div>
              <div className="space-y-2">
                {cvState.languages.map((l, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={l.name}
                      placeholder="Language"
                      onChange={(e) => {
                        const updated = [...cvState.languages];
                        updated[idx].name = e.target.value;
                        updateCvState({ ...cvState, languages: updated });
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                    <input
                      type="text"
                      value={l.level}
                      placeholder="Level (Native, etc.)"
                      onChange={(e) => {
                        const updated = [...cvState.languages];
                        updated[idx].level = e.target.value;
                        updateCvState({ ...cvState, languages: updated });
                      }}
                      className="w-1/3 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateCvState({
                          ...cvState,
                          languages: cvState.languages.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* References */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>9. References ({cvState.references.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    updateCvState({
                      ...cvState,
                      references: [
                        ...cvState.references,
                        {
                          name: 'Reference Name',
                          title: 'Job Title',
                          company: 'Company',
                          email: 'ref@example.com',
                          phone: '+1 (555) 000-0000',
                          relationship: 'Colleague',
                        },
                      ],
                    })
                  }
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  + Add Reference
                </button>
              </div>
              <div className="space-y-3">
                {cvState.references.map((r, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                      <span className="text-xs font-bold text-white">Reference #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCvState({
                            ...cvState,
                            references: cvState.references.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={r.name}
                        placeholder="Name"
                        onChange={(e) => {
                          const updated = [...cvState.references];
                          updated[idx].name = e.target.value;
                          updateCvState({ ...cvState, references: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        value={r.relationship}
                        placeholder="Relationship (e.g. Former Manager)"
                        onChange={(e) => {
                          const updated = [...cvState.references];
                          updated[idx].relationship = e.target.value;
                          updateCvState({ ...cvState, references: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-purple-400 italic"
                      />
                      <input
                        type="text"
                        value={r.title}
                        placeholder="Title"
                        onChange={(e) => {
                          const updated = [...cvState.references];
                          updated[idx].title = e.target.value;
                          updateCvState({ ...cvState, references: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        value={r.company}
                        placeholder="Company"
                        onChange={(e) => {
                          const updated = [...cvState.references];
                          updated[idx].company = e.target.value;
                          updateCvState({ ...cvState, references: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="email"
                        value={r.email}
                        placeholder="Email"
                        onChange={(e) => {
                          const updated = [...cvState.references];
                          updated[idx].email = e.target.value;
                          updateCvState({ ...cvState, references: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        value={r.phone}
                        placeholder="Phone"
                        onChange={(e) => {
                          const updated = [...cvState.references];
                          updated[idx].phone = e.target.value;
                          updateCvState({ ...cvState, references: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Raw JSON Editor Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Braces className="w-4 h-4 text-cyan-400" />
              <span>Direct JSON Code Editor</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Changes sync directly with visual form
            </span>
          </div>
          <textarea
            rows={22}
            value={jsonString}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
          />
        </div>
      )}
    </form>
  );
}
