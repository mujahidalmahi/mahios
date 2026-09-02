'use client';

import React, { useState } from 'react';
import {
  Award, Trophy, Star, Sparkles, CheckCircle2,
  ExternalLink, Search, ShieldCheck, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Achievement } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface AchievementsAppProps {
  achievements: Achievement[];
}

export default function AchievementsApp({ achievements }: AchievementsAppProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { playSound } = useSystemStore();

  const handleCelebrate = (type: 'standard' | 'stars' | 'gold' = 'standard') => {
    playSound('success');

    if (type === 'stars') {
      confetti({
        particleCount: 50,
        spread: 100,
        shapes: ['star'],
        colors: ['#FFE838', '#FFAE00', '#FF5E00'],
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
      });
    }
  };

  const filtered = achievements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Trophies.dat — Honors & Certifications
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              {filtered.length} Recognized Honors ({achievements.length} Total)
            </span>
          </div>
        </div>

        {/* Celebration Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleCelebrate('standard')}
            className="retro-btn px-2 py-1 text-[11px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Confetti! 🎉</span>
          </button>
          <button
            type="button"
            onClick={() => handleCelebrate('stars')}
            className="retro-btn px-2 py-1 text-[11px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Gold Stars ⭐</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 bg-[#f3f4f6] retro-box-inset text-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-500 shrink-0" />
        <input
          type="text"
          placeholder="Search awards, hackathon victories, or certifications..."
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

      {/* Achievements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((ach) => (
          <div
            key={ach.id}
            onClick={() => {
              playSound('click');
              setSelectedAchievement(ach);
            }}
            className="p-3.5 bg-[#f9fafb] retro-box-inset rounded-xs hover:bg-[#fffdf7] cursor-pointer space-y-2 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xs retro-box-outset bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h3 className="font-bold text-xs text-[#000080] truncate">{ach.title}</h3>
                  <p className="text-[11px] text-gray-600 font-semibold">{ach.issuer}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{ach.issue_date}</p>
                </div>
              </div>

              {ach.description && (
                <p className="text-xs text-gray-700 leading-relaxed border-t border-gray-200 pt-1.5 line-clamp-2">
                  {ach.description}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-amber-800 font-semibold">
              <span>Inspect Credential &gt;</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Credential Inspector Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="retro-box-outset bg-[#c0c0c0] max-w-md w-full p-1 shadow-2xl flex flex-col">
            <div className="retro-titlebar px-2 py-1 flex items-center justify-between font-bold text-xs">
              <span className="truncate">Credential: {selectedAchievement.title}</span>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="retro-window-btn cursor-pointer"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            </div>

            <div className="retro-box-inset bg-white p-5 m-1 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 retro-box-outset bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#000080]">{selectedAchievement.title}</h3>
                  <p className="text-xs font-semibold text-gray-700">{selectedAchievement.issuer}</p>
                  <p className="text-[10px] font-mono text-gray-500 mt-0.5">Awarded: {selectedAchievement.issue_date}</p>
                </div>
              </div>

              {selectedAchievement.description && (
                <div className="p-3 bg-[#fafafa] border border-gray-200 rounded-2xs text-gray-800 leading-relaxed">
                  {selectedAchievement.description}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleCelebrate('stars')}
                  className="retro-btn px-3 py-1 font-bold text-xs text-amber-900 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cheer!</span>
                </button>

                {selectedAchievement.credential_id ? (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded-2xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ID: {selectedAchievement.credential_id}</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">✓ VERIFIED BY ISSUER</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
