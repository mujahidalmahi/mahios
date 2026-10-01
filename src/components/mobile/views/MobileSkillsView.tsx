'use client';

import React, { useState, useMemo } from 'react';
import {
  Cpu, Search, Star, Layers, SlidersHorizontal,
  Award, Sparkles, CheckCircle2
} from 'lucide-react';
import { SkillCategory, Skill } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileSkillsViewProps {
  categories: SkillCategory[];
  skills: Skill[];
}

export default function MobileSkillsView({ categories = [], skills = [] }: MobileSkillsViewProps) {
  const { playSound } = useSystemStore();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'ranked'>('categories');

  const filteredSkills = useMemo(() => {
    let list = skills;
    if (selectedCatId !== 'all') {
      list = list.filter((s) => s.category_id === selectedCatId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (viewMode === 'ranked') {
      return [...list].sort((a, b) => (b.proficiency ?? 0) - (a.proficiency ?? 0));
    }
    return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [skills, selectedCatId, searchQuery, viewMode]);

  return (
    <div className="space-y-3 pb-8 max-w-full font-sans">
      {/* Search Input */}
      <div className="space-y-2">
        <div className="relative flex items-center bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, frameworks, or tools..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Switcher & Category Pills */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setViewMode('categories');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === 'categories'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Domain
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setViewMode('ranked');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                viewMode === 'ranked'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ranked
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedCatId('all');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                selectedCatId === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All ({skills.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedCatId(cat.id);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  selectedCatId === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="space-y-2 pt-1">
        {filteredSkills.length === 0 ? (
          <div className="py-14 text-center text-slate-400 font-mono text-xs">
            No technical skills found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-slate-900">{skill.name}</span>
                  {skill.is_featured && (
                    <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold">
                      Core
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {skill.years_of_experience ? (
                    <span className="text-[10px] font-mono text-slate-500">
                      {skill.years_of_experience} yrs
                    </span>
                  ) : null}
                  <span className="font-mono text-xs font-black text-blue-700">
                    {skill.proficiency || 85}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${skill.proficiency || 85}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
