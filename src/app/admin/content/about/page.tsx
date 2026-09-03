'use client';

import React, { useState, useEffect } from 'react';
import {
  Save, CheckCircle2, User, Sparkles, Loader2, Plus, X, Tag,
  Compass, Lightbulb, HelpCircle, Trash2, Edit2, ChevronDown,
  Layers, Check, AlertCircle, Quote
} from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { AboutContent, PhilosophyItem } from '@/types/database';
import { adminMutate } from '@/lib/api/adminMutate';
import {
  parseAboutExtras,
  packAboutExtras,
  TechRadarItem,
  TriviaItem,
  defaultTechRadarItems,
  defaultTriviaItems
} from '@/lib/data/aboutExtras';

export default function AboutEditorPage() {
  const [data, setData] = useState<AboutContent>(fallbackBiographyData.about);
  const [cleanBio, setCleanBio] = useState('');
  const [techRadar, setTechRadar] = useState<TechRadarItem[]>(defaultTechRadarItems);
  const [trivia, setTrivia] = useState<TriviaItem[]>(defaultTriviaItems);
  const [principles, setPrinciples] = useState<PhilosophyItem[]>(fallbackBiographyData.philosophies);

  const [activeSubSection, setActiveSubSection] = useState<'core' | 'principles' | 'radar' | 'trivia'>('core');

  // Input states
  const [newTagline, setNewTagline] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Radar Item Modal / Form
  const [newRadarStatus, setNewRadarStatus] = useState('[ADOPT / PRODUCTION]');
  const [newRadarTitle, setNewRadarTitle] = useState('');
  const [newRadarDesc, setNewRadarDesc] = useState('');

  // Trivia Item Modal / Form
  const [newTriviaQ, setNewTriviaQ] = useState('');
  const [newTriviaA, setNewTriviaA] = useState('');

  // Principle Modal / Form
  const [newPrincipleTitle, setNewPrincipleTitle] = useState('');
  const [newPrincipleAxiom, setNewPrincipleAxiom] = useState('');
  const [newPrincipleDesc, setNewPrincipleDesc] = useState('');
  const [newPrincipleCategory, setNewPrincipleCategory] = useState('engineering');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: aboutRes } = await supabase.from('about_content').select('*').single();
        if (aboutRes) {
          setData(aboutRes);
          const parsed = parseAboutExtras(aboutRes.bio_html);
          setCleanBio(parsed.cleanBioHtml);
          setTechRadar(parsed.techRadar);
          setTrivia(parsed.trivia);
        } else {
          const parsed = parseAboutExtras(fallbackBiographyData.about.bio_html);
          setCleanBio(parsed.cleanBioHtml);
        }

        const { data: philRes } = await supabase.from('philosophies').select('*').order('sort_order', { ascending: true });
        if (philRes && philRes.length > 0) {
          setPrinciples(philRes as PhilosophyItem[]);
        }
      } catch {
        // Fallback already active
      }
    }
    loadData();
  }, []);

  const handleAddTagline = () => {
    if (!newTagline.trim()) return;
    const clean = newTagline.trim();
    if (!data.taglines.includes(clean)) {
      setData({ ...data, taglines: [...data.taglines, clean] });
    }
    setNewTagline('');
  };

  const handleRemoveTagline = (t: string) => {
    setData({ ...data, taglines: data.taglines.filter((item) => item !== t) });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const clean = newInterest.trim();
    if (!data.interests.includes(clean)) {
      setData({ ...data, interests: [...data.interests, clean] });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (i: string) => {
    setData({ ...data, interests: data.interests.filter((item) => item !== i) });
  };

  // Tech Radar helpers
  const handleAddRadar = () => {
    if (!newRadarTitle.trim()) return;
    const newItem: TechRadarItem = {
      id: `radar-${Date.now()}`,
      status: newRadarStatus.trim() || '[ADOPT / PRODUCTION]',
      title: newRadarTitle.trim(),
      description: newRadarDesc.trim(),
    };
    setTechRadar([...techRadar, newItem]);
    setNewRadarTitle('');
    setNewRadarDesc('');
  };

  const handleRemoveRadar = (id: string) => {
    setTechRadar(techRadar.filter((r) => r.id !== id));
  };

  // Trivia helpers
  const handleAddTrivia = () => {
    if (!newTriviaQ.trim()) return;
    const newItem: TriviaItem = {
      id: `trivia-${Date.now()}`,
      q: newTriviaQ.trim(),
      a: newTriviaA.trim(),
    };
    setTrivia([...trivia, newItem]);
    setNewTriviaQ('');
    setNewTriviaA('');
  };

  const handleRemoveTrivia = (id: string) => {
    setTrivia(trivia.filter((t) => t.id !== id));
  };

  // Principles helpers
  const handleAddPrinciple = async () => {
    if (!newPrincipleTitle.trim()) return;
    const newP: Partial<PhilosophyItem> = {
      title: newPrincipleTitle.trim(),
      axiom: newPrincipleAxiom.trim() || 'Core engineering axiom',
      description: newPrincipleDesc.trim(),
      category: newPrincipleCategory,
      icon_name: 'Lightbulb',
      sort_order: principles.length + 1,
    };

    const res = await adminMutate<PhilosophyItem[]>({
      table: 'philosophies',
      action: 'insert',
      data: newP,
    });

    if (res.success && res.data) {
      setPrinciples([...principles, ...res.data]);
      setNewPrincipleTitle('');
      setNewPrincipleAxiom('');
      setNewPrincipleDesc('');
    } else {
      alert(`Failed to add principle: ${res.error}`);
    }
  };

  const handleRemovePrinciple = async (id: string) => {
    if (!confirm('Are you sure you want to remove this engineering principle?')) return;
    const res = await adminMutate({
      table: 'philosophies',
      action: 'delete',
      match: { id },
    });
    if (res.success) {
      setPrinciples(principles.filter((p) => p.id !== id));
    } else {
      alert(`Failed to delete principle: ${res.error}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    // Pack extras (tech radar & trivia) into bio_html
    const packedBioHtml = packAboutExtras(cleanBio, techRadar, trivia);

    const updated: Partial<AboutContent> = {
      ...data,
      bio_html: packedBioHtml,
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await adminMutate<AboutContent>({
        table: 'about_content',
        action: 'upsert',
        data: updated,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        console.error('Save failed:', res.error);
        alert(`Save failed: ${res.error}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert(`Save error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <span>Edit About Me Master Suite</span>
          </h1>
          <p className="text-xs text-slate-400">
            Full dynamic access across all 4 sub-sections: Identity & Bio, Principles, Tech Radar, and Trivia Q&A.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>All About Me information fields and sub-tabs saved successfully!</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubSection('core')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubSection === 'core'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Identity, Narrative & Metrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('principles')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubSection === 'principles'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>2. Principles ({principles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('radar')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubSection === 'radar'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. Tech Radar ({techRadar.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('trivia')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeSubSection === 'trivia'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>4. Trivia & Q&A ({trivia.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. CORE IDENTITY, NARRATIVE & METRICS                     */}
      {/* ========================================================= */}
      {activeSubSection === 'core' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left Column: Avatar & Counters */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Photo</h3>
              <MediaUploader
                value={data.avatar_url}
                onChange={(url) => setData({ ...data, avatar_url: url })}
                label="Avatar Image"
                folder="mahios/profile"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Numerical Metric Counters</h3>
              <div className="space-y-1">
                <label className="text-slate-400">Years of Experience</label>
                <input
                  type="number"
                  step="0.5"
                  value={data.experience_years}
                  onChange={(e) => setData({ ...data, experience_years: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Projects Completed</label>
                <input
                  type="number"
                  value={data.projects_completed}
                  onChange={(e) => setData({ ...data, projects_completed: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Coffee Cups Brewed</label>
                <input
                  type="number"
                  value={data.coffee_cups}
                  onChange={(e) => setData({ ...data, coffee_cups: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Metadata */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={data.full_name}
                    onChange={(e) => setData({ ...data, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Location</label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase">Current Status / Availability</label>
                <input
                  type="text"
                  value={data.status_text}
                  onChange={(e) => setData({ ...data, status_text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Taglines */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Professional Taglines</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tagline..."
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTagline(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTagline}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.taglines?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-blue-300 font-medium flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTagline(tag)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interests & Specializations</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.interests?.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-300 font-medium flex items-center gap-1.5"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Quote & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Inspirational Quote</label>
                  <input
                    type="text"
                    value={data.quote}
                    onChange={(e) => setData({ ...data, quote: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Quote Author</label>
                  <input
                    type="text"
                    value={data.quote_author}
                    onChange={(e) => setData({ ...data, quote_author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rich Text Editor for Narrative Story */}
              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sub-Tab 1: Narrative Bio Story</span>
                </label>
                <RichTextEditor
                  content={cleanBio}
                  onChange={(html) => setCleanBio(html)}
                  minHeight="260px"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SUB-TAB 2: ENGINEERING PRINCIPLES (PHILOSOPHIES)       */}
      {/* ========================================================= */}
      {activeSubSection === 'principles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <span>Sub-Tab 2: Engineering Principles & Philosophies</span>
            </h2>
            <p className="text-xs text-slate-400">
              Directly powers the Principles cards in the desktop About Me application.
            </p>
          </div>

          {/* Add Principle Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add New Engineering Principle</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Principle Title (e.g. Simplicity Over Complexity)"
                value={newPrincipleTitle}
                onChange={(e) => setNewPrincipleTitle(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Axiom / Summary quote"
                value={newPrincipleAxiom}
                onChange={(e) => setNewPrincipleAxiom(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <select
                value={newPrincipleCategory}
                onChange={(e) => setNewPrincipleCategory(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="architecture">Architecture</option>
                <option value="craft">Craft & Ethics</option>
              </select>
            </div>

            <textarea
              rows={2}
              placeholder="Detailed description / rationale..."
              value={newPrincipleDesc}
              onChange={(e) => setNewPrincipleDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />

            <button
              type="button"
              onClick={handleAddPrinciple}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Principle to Database</span>
            </button>
          </div>

          {/* Principle Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {principles.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative group hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">{p.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePrinciple(p.id)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                    title="Delete Principle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                {p.axiom && (
                  <p className="text-[11px] text-blue-400 font-mono italic">&ldquo;{p.axiom}&rdquo;</p>
                )}
                <span className="inline-block px-2 py-0.5 bg-slate-900 text-slate-400 text-[10px] font-mono rounded">
                  Category: {p.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-TAB 3: TECH RADAR ITEMS                            */}
      {/* ========================================================= */}
      {activeSubSection === 'radar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Sub-Tab 3: Tech Radar (Exploring & Refining)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Customize the technical radar cards displayed on the desktop Tech Radar sub-tab.
            </p>
          </div>

          {/* Add Radar Item Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add New Tech Radar Item</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newRadarStatus}
                onChange={(e) => setNewRadarStatus(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="[ADOPT / PRODUCTION]">[ADOPT / PRODUCTION]</option>
                <option value="[TRIAL / BUILDING]">[TRIAL / BUILDING]</option>
                <option value="[EVALUATING]">[EVALUATING]</option>
                <option value="[SPECIAL INTEREST]">[SPECIAL INTEREST]</option>
              </select>

              <input
                type="text"
                placeholder="Technology Name (e.g. Next.js 16 App Router)"
                value={newRadarTitle}
                onChange={(e) => setNewRadarTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <textarea
              rows={2}
              placeholder="Short description / purpose..."
              value={newRadarDesc}
              onChange={(e) => setNewRadarDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />

            <button
              type="button"
              onClick={handleAddRadar}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Tech Radar</span>
            </button>
          </div>

          {/* Radar Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techRadar.map((r) => (
              <div
                key={r.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 relative group hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {r.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRadar(r.id)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold text-sm text-white">{r.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SUB-TAB 4: TRIVIA & Q&A QUESTIONS                      */}
      {/* ========================================================= */}
      {activeSubSection === 'trivia' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <span>Sub-Tab 4: Trivia & Q&A Questions</span>
            </h2>
            <p className="text-xs text-slate-400">
              Customize the trivia questions and revealable answers on the desktop Trivia & Q&A sub-tab.
            </p>
          </div>

          {/* Add Trivia Form */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add New Trivia Question & Answer</span>
            </h3>

            <input
              type="text"
              placeholder="Question (e.g. What was Mahi's first programming language?)"
              value={newTriviaQ}
              onChange={(e) => setNewTriviaQ(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />

            <textarea
              rows={2}
              placeholder="Answer..."
              value={newTriviaA}
              onChange={(e) => setNewTriviaA(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />

            <button
              type="button"
              onClick={handleAddTrivia}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trivia Item</span>
            </button>
          </div>

          {/* Trivia Items List */}
          <div className="space-y-3">
            {trivia.map((t, idx) => (
              <div
                key={t.id || idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <h4 className="font-bold text-sm text-white">{t.q}</h4>
                  </div>
                  <p className="text-xs text-slate-300 pl-6 border-l-2 border-slate-800 mt-1">{t.a}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTrivia(t.id)}
                  className="text-slate-500 hover:text-red-400 p-1 cursor-pointer shrink-0"
                  title="Remove Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
