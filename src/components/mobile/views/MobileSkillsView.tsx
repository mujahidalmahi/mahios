'use client';

import React, { useState, useMemo } from 'react';
import { Cpu, Search, CheckCircle2, Star, Sparkles } from 'lucide-react';
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

  const filteredSkills = useMemo(() => {
    let list = skills;
    if (selectedCatId !== 'all') {
      list = list.filter((s) => s.category_id === selectedCatId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => (b.proficiency ?? 0) - (a.proficiency ?? 0));
  }, [skills, selectedCatId, searchQuery]);

  return (
    <div className="space-y-3 pb-6">
      {/* Search Input */}
      <div className="relative flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-300">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills & technologies..."
          className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setSelectedCatId('all');
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
            selectedCatId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
              selectedCatId === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="space-y-2 pt-1">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900">{skill.name}</span>
                {skill.is_featured && (
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                )}
              </div>
              <span className="font-mono text-[11px] font-black text-blue-700">
                {skill.proficiency || 85}%
              </span>
            </div>

            {/* Proficiency Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${skill.proficiency || 85}%` }}
              />
            </div>

            {skill.years_of_experience > 0 && (
              <div className="text-[10px] text-slate-500 font-medium">
                {skill.years_of_experience} {skill.years_of_experience === 1 ? 'year' : 'years'} practical experience
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
