'use client';

import React, { useState, useMemo } from 'react';
import { Award, Calendar, ExternalLink, ChevronLeft, ChevronRight, CheckCircle2, Search, Trophy, Sparkles, Star, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Achievement } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import MobilePagination from '../MobilePagination';

interface MobileAchievementsViewProps {
  achievements: Achievement[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileAchievementsView({ achievements = [] }: MobileAchievementsViewProps) {
  const { playSound } = useSystemStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const handleCelebrate = (type: 'standard' | 'stars' = 'standard') => {
    playSound('success');
    if (type === 'stars') {
      confetti({
        particleCount: 50,
        spread: 90,
        shapes: ['star'],
        colors: ['#FFE838', '#FFAE00', '#FF5E00'],
        origin: { y: 0.6 },
      });
    } else {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
      });
    }
  };

  const filteredAchievements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sorted = [...achievements].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (!q) return sorted;
    return sorted.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.issuer.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q))
    );
  }, [achievements, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAchievements.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAchievements.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAchievements, currentPage]);

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      {/* Header with celebration buttons */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div>
          <div className="text-xs font-bold text-slate-800 tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Honors & Certs ({filteredAchievements.length})</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Verified distinctions & awards</div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleCelebrate('standard')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>🎉</span>
          </button>
          <button
            type="button"
            onClick={() => handleCelebrate('stars')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>⭐</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search awards, issuers, hackathons..."
          className="w-full pl-8.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* List of achievements */}
      {filteredAchievements.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-2">
          <Award className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-600 font-medium">No honors found matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                playSound('click');
                setSelectedAchievement(item);
              }}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 active:scale-[0.99] transition-transform cursor-pointer hover:border-amber-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h3>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{item.issuer}</div>
                  </div>
                </div>

                {item.certificate_url && (
                  <a
                    href={item.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('open');
                    }}
                    className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg shrink-0 border border-blue-200"
                    title="Verify Credential"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{item.issue_date}</span>
                </div>
                {item.credential_id && (
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ID: {item.credential_id}
                  </span>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <MobilePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredAchievements.length}
        itemsPerPage={ITEMS_PER_PAGE}
        itemName="Honors"
      />

      {/* Detail Modal / Sheet */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] animate-in fade-in duration-150"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{selectedAchievement.title}</h3>
                  <p className="text-xs font-medium text-slate-600">{selectedAchievement.issuer}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Issued: {selectedAchievement.issue_date}</span>
              </div>
              {selectedAchievement.credential_id && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ID: {selectedAchievement.credential_id}</span>
                </div>
              )}
            </div>

            {selectedAchievement.description && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Details</div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {selectedAchievement.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {selectedAchievement.certificate_url ? (
                <a
                  href={selectedAchievement.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify Credential</span>
                </a>
              ) : (
                <div className="flex-1 text-center py-2 text-xs text-slate-400 font-mono">
                  Credential verified on record
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedAchievement(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
