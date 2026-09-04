'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Layers, Star,
  Search, SlidersHorizontal, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import CategoryPicker from '@/components/admin/CategoryPicker';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { Skill, SkillCategory } from '@/types/database';

export default function SkillsAdminPage() {
  const [categories, setCategories] = useState<SkillCategory[]>(fallbackBiographyData.categories);
  const [skills, setSkills] = useState<Skill[]>(fallbackBiographyData.skills);
  const [loading, setLoading] = useState(true);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'skills' | 'categories'>('skills');

  // Skill Editor Modal State
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isNewSkill, setIsNewSkill] = useState(false);

  // Category Editor Modal State
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: catData } = await supabase.from('skill_categories').select('*').order('sort_order', { ascending: true });
        const { data: skillData } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });

        if (catData && catData.length > 0) setCategories(catData);
        if (skillData && skillData.length > 0) setSkills(skillData);
      } catch {
        // Use fallback data
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- SKILL HANDLERS ---
  const openNewSkill = () => {
    setIsNewSkill(true);
    const defaultCatId =
      selectedCatFilter !== 'all' && categories.some((c) => c.id === selectedCatFilter)
        ? selectedCatFilter
        : categories[0]?.id || '';
    setEditingSkill({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `skill-${Date.now()}`,
      name: '',
      category_id: defaultCatId,
      proficiency: 90,
      years_of_experience: 3,
      is_featured: true,
      sort_order: skills.length + 1,
    });
  };

  const openEditSkill = (s: Skill) => {
    setIsNewSkill(false);
    setEditingSkill({ ...s });
  };

  const handleSkillCategoryChange = async (catName: string) => {
    if (!editingSkill) return;
    const existing = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (existing) {
      setEditingSkill({ ...editingSkill, category_id: existing.id });
    } else {
      const newCatId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`;
      const newCat: SkillCategory = {
        id: newCatId,
        name: catName,
        sort_order: categories.length + 1,
      };
      setCategories((prev) => [...prev, newCat]);
      setEditingSkill({ ...editingSkill, category_id: newCat.id });
      try {
        const res = await adminMutate<SkillCategory>({
          table: 'skill_categories',
          action: 'upsert',
          data: newCat,
        });
        if (res?.data) {
          const savedCat = Array.isArray(res.data) ? res.data[0] : res.data;
          if (savedCat?.id && savedCat.id !== newCatId) {
            setCategories((prev) => prev.map((c) => (c.id === newCatId ? savedCat : c)));
            setEditingSkill((prev) => (prev ? { ...prev, category_id: savedCat.id } : null));
          }
        }
      } catch {
        // Local fallback
      }
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await adminMutate<Skill>({
        table: 'skills',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setFeedback({ type: 'success', text: 'Skill removed successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setSaving(true);

    const skillToSave = { ...editingSkill };
    if (isNewSkill) {
      setSkills((prev) => [...prev, skillToSave]);
    } else {
      setSkills((prev) => prev.map((s) => (s.id === skillToSave.id ? skillToSave : s)));
    }

    try {
      const res = await adminMutate<Skill>({
        table: 'skills',
        action: 'upsert',
        data: skillToSave,
      });
      if (res?.data) {
        const saved = Array.isArray(res.data) ? res.data[0] : res.data;
        if (saved?.id) {
          setSkills((prev) =>
            prev.map((s) => (s.id === skillToSave.id || s.id === saved.id ? saved : s))
          );
        }
      }
    } catch {
      // Local fallback
    }

    setEditingSkill(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Skill "${editingSkill.name}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- CATEGORY HANDLERS ---
  const openNewCategory = () => {
    setIsNewCategory(true);
    setEditingCategory({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
      name: '',
      sort_order: categories.length + 1,
    });
  };

  const openEditCategory = (cat: SkillCategory) => {
    setIsNewCategory(false);
    setEditingCategory({ ...cat });
  };

  const handleDeleteCategory = async (id: string) => {
    const associatedCount = skills.filter((s) => s.category_id === id).length;
    if (associatedCount > 0) {
      if (!confirm(`This category contains ${associatedCount} skills. Deleting it will reassign them to the first available category. Continue?`)) {
        return;
      }
      const fallbackCatId = categories.find((c) => c.id !== id)?.id || 'general';
      setSkills((prev) => prev.map((s) => (s.category_id === id ? { ...s, category_id: fallbackCatId } : s)));
    } else {
      if (!confirm('Are you sure you want to delete this skill category?')) return;
    }

    try {
      await adminMutate<SkillCategory>({
        table: 'skill_categories',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setFeedback({ type: 'success', text: 'Skill category deleted.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);

    const catToSave = { ...editingCategory };
    if (isNewCategory) {
      setCategories((prev) => [...prev, catToSave]);
    } else {
      setCategories((prev) => prev.map((c) => (c.id === catToSave.id ? catToSave : c)));
    }

    try {
      const res = await adminMutate<SkillCategory>({
        table: 'skill_categories',
        action: 'upsert',
        data: catToSave,
      });
      if (res?.data) {
        const savedCat = Array.isArray(res.data) ? res.data[0] : res.data;
        if (savedCat?.id) {
          setCategories((prev) =>
            prev.map((c) => (c.id === catToSave.id || c.id === savedCat.id ? savedCat : c))
          );
        }
      }
    } catch {
      // Local fallback
    }

    setEditingCategory(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Category "${editingCategory.name}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredSkills = skills.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCatFilter === 'all' || s.category_id === selectedCatFilter;
    return matchSearch && matchCat;
  });

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>Skills & Tech Stack Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create skill categories, manage proficiency ratings, and curate your engineering stack with 100% freedom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'skills' ? (
            <button
              type="button"
              onClick={openNewSkill}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Skill</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openNewCategory}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          )}
        </div>
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

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'skills'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Technical Skills ({skills.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Skill Categories ({categories.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: SKILLS LIST ==================== */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="flex items-center gap-2 w-full sm:w-80 bg-slate-950 px-3 py-2 border border-slate-800 rounded-lg">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white focus:outline-none w-full"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              <button
                type="button"
                onClick={() => setSelectedCatFilter('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCatFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCatFilter(c.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                    selectedCatFilter === c.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((s) => {
              const catName = categories.find((c) => c.id === s.category_id)?.name || 'Unassigned';
              return (
                <div
                  key={s.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
                        {catName}
                      </span>
                      {s.is_featured && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" /> CORE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{s.name}</h3>
                      <span className="text-xs font-mono font-bold text-emerald-400">{s.proficiency}%</span>
                    </div>

                    {/* Progress Bar Preview */}
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full"
                        style={{ width: `${s.proficiency}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono">
                      Experience: {s.years_of_experience} Years
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => openEditSkill(s)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md cursor-pointer"
                      title="Edit Skill"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-md cursor-pointer"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: CATEGORIES LIST ==================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => {
              const skillCount = skills.filter((s) => s.category_id === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {skillCount} {skillCount === 1 ? 'skill' : 'skills'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Category ID: {cat.id}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-[11px] text-slate-500 font-mono">Order: #{cat.sort_order || idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-md cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== SKILL MODAL ==================== */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>{isNewSkill ? 'Add New Technical Skill' : `Edit Skill: ${editingSkill.name}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingSkill(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js 16, PostgreSQL, Docker"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <CategoryPicker
                value={categories.find((c) => c.id === editingSkill.category_id)?.name || 'Frontend'}
                onChange={(catName) => handleSkillCategoryChange(catName)}
                existingCategories={categories.map((c) => c.name)}
                label="Assigned Category"
                placeholder="Select category or type new..."
                helperText="Select an existing category or type a new one to create it instantly."
              />

              <div className="space-y-2 bg-slate-950 p-3.5 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 uppercase">Proficiency Rating</label>
                  <span className="text-sm font-mono font-bold text-emerald-400">{editingSkill.proficiency}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={editingSkill.proficiency}
                  onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: parseInt(e.target.value) || 50 })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Years of Hands-on Tenure</label>
                <input
                  type="number"
                  min="0.5"
                  max="30"
                  step="0.5"
                  required
                  value={editingSkill.years_of_experience}
                  onChange={(e) => setEditingSkill({ ...editingSkill, years_of_experience: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingSkill.is_featured}
                  onChange={(e) => setEditingSkill({ ...editingSkill, is_featured: e.target.checked })}
                  className="rounded border-slate-700 accent-blue-600"
                />
                <span>Feature as CORE Technology (Pinnacle badge)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CATEGORY MODAL ==================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isNewCategory ? 'Create New Skill Category' : `Edit Category: ${editingCategory.name}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Architecture, Cloud & DevOps"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Sort Order Rank</label>
                <input
                  type="number"
                  required
                  value={editingCategory.sort_order}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



