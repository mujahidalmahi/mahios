'use client';

import React, { useState } from 'react';
import {
  Cpu, Layers, Star, Search, Filter,
  SlidersHorizontal, Award, Sparkles, CheckCircle2,
  HelpCircle, Zap
} from 'lucide-react';
import { Skill, SkillCategory } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface SkillsAppProps {
  categories: SkillCategory[];
  skills: Skill[];
}

export default function SkillsApp({ categories, skills }: SkillsAppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [minProficiency, setMinProficiency] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'categories' | 'ranked'>('categories');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { playSound } = useSystemStore();

  const filteredSkills = skills.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProficiency = s.proficiency >= minProficiency;
    return matchSearch && matchProficiency;
  });

  const rankedSkills = [...filteredSkills]
    .filter(
      (s, idx, arr) =>
        idx === arr.findIndex((t) => t.name.toLowerCase().trim() === s.name.toLowerCase().trim())
    )
    .sort((a, b) => b.proficiency - a.proficiency);

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Tech_Stack.dll — System Modules & Proficiencies
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              {filteredSkills.length} of {skills.length} Modules Loaded
            </span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center retro-box-inset p-0.5 bg-white">
            <button
              type="button"
              onClick={() => { playSound('click'); setViewMode('categories'); }}
              className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                viewMode === 'categories' ? 'bg-[#000080] text-white' : 'text-gray-700'
              }`}
            >
              Domain View
            </button>
            <button
              type="button"
              onClick={() => { playSound('click'); setViewMode('ranked'); }}
              className={`px-2 py-0.5 text-[11px] font-bold cursor-pointer ${
                viewMode === 'ranked' ? 'bg-[#000080] text-white' : 'text-gray-700'
              }`}
            >
              Ranked (High-Low)
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-[#f3f4f6] retro-box-inset space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Filter technical skills (e.g., React, PostgreSQL, Docker, TypeScript)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 bg-white retro-box-inset text-xs focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="retro-btn px-2 py-0.5 text-[10px]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Proficiency Threshold Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] pt-1">
          <span className="font-bold text-gray-600 mr-1 shrink-0">Threshold:</span>
          {[
            { label: 'All Modules (0%+)', val: 0 },
            { label: 'Proficient (80%+)', val: 80 },
            { label: 'Master / Expert (90%+)', val: 90 },
            { label: 'Top Tier (95%+)', val: 95 },
          ].map((btn) => (
            <button
              key={btn.val}
              type="button"
              onClick={() => {
                playSound('click');
                setMinProficiency(btn.val);
              }}
              className={`px-2 py-0.5 rounded-2xs font-medium cursor-pointer shrink-0 ${
                minProficiency === btn.val
                  ? 'bg-[#000080] text-white font-bold'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY VIEW */}
      {viewMode === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const catSkills = filteredSkills
              .filter((s) => s.category_id === cat.id)
              .filter(
                (s, idx, arr) =>
                  idx === arr.findIndex((t) => t.name.toLowerCase().trim() === s.name.toLowerCase().trim())
              );
            if (catSkills.length === 0) return null;

            return (
              <div key={cat.id} className="p-4 bg-[#f9fafb] retro-box-inset rounded-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <h3 className="font-bold text-xs text-[#000080] uppercase tracking-wide">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{catSkills.length} items</span>
                </div>

                <div className="space-y-3">
                  {catSkills.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        playSound('click');
                        setSelectedSkill(s);
                      }}
                      className="space-y-1 p-1.5 hover:bg-white/80 rounded-2xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900">{s.name}</span>
                          {s.is_featured && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 border border-amber-200 rounded-2xs">
                              CORE
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-blue-800 font-bold text-[11px]">
                          {s.proficiency}%
                        </span>
                      </div>

                      {/* Retro 90s Segmented Progress Bar */}
                      <div className="w-full h-3 bg-white retro-box-inset p-0.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#000080] to-[#1084d0]"
                          style={{ width: `${s.proficiency}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-gray-500 font-mono flex justify-between">
                        <span>Tenure: {s.years_of_experience} yrs</span>
                        <span className="text-emerald-700 font-semibold">STATUS: OPTIMIZED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RANKED LIST VIEW */}
      {viewMode === 'ranked' && (
        <div className="space-y-2 bg-white retro-box-inset p-4">
          {rankedSkills.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                playSound('click');
                setSelectedSkill(s);
              }}
              className="p-2 border-b border-gray-200 hover:bg-blue-50/60 rounded-xs cursor-pointer flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-6 font-mono text-gray-400 font-bold text-[11px]">#{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <span>{s.name}</span>
                    {s.is_featured && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 border border-amber-200 rounded-2xs">
                        CORE
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-gray-200 retro-box-inset p-0.2 overflow-hidden mt-1 max-w-md">
                    <div
                      className="h-full bg-gradient-to-r from-[#000080] to-[#1084d0]"
                      style={{ width: `${s.proficiency}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-sm font-bold text-[#000080]">{s.proficiency}%</span>
                <div className="text-[10px] text-gray-500 font-mono">{s.years_of_experience} yrs exp</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="retro-box-outset bg-[#c0c0c0] max-w-sm w-full p-1 shadow-2xl flex flex-col">
            <div className="retro-titlebar px-2 py-1 flex items-center justify-between font-bold text-xs">
              <span className="truncate">Module Info: {selectedSkill.name}</span>
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="retro-window-btn cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="retro-box-inset bg-white p-4 m-1 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#000080]">{selectedSkill.name}</h3>
                <span className="font-mono text-sm font-bold text-blue-800">{selectedSkill.proficiency}%</span>
              </div>

              <div className="space-y-1 text-gray-700">
                <div className="flex justify-between border-b border-gray-100 py-1">
                  <span className="text-gray-500">Hands-on Experience:</span>
                  <span className="font-bold">{selectedSkill.years_of_experience} Years</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-1">
                  <span className="text-gray-500">Tier Classification:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedSkill.proficiency >= 90 ? 'Expert Mastery' : 'High Proficiency'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Runtime Compatibility:</span>
                  <span className="font-mono font-semibold text-blue-700">Node.js 22 / React 19</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="w-full retro-btn py-1 font-bold text-xs text-[#000080] cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
