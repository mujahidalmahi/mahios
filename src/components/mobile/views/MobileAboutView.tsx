'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User, MapPin, Coffee, Code2, Award, Sparkles, Quote,
  Copy, Check, Clock, Compass, BookOpen, HelpCircle,
  Mail, Globe, ChevronDown, ChevronUp, Layers, CheckCircle2
} from 'lucide-react';
import { AboutContent, PhilosophyItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { parseAboutExtras } from '@/lib/data/aboutExtras';

interface MobileAboutViewProps {
  about: AboutContent;
  philosophies?: PhilosophyItem[];
  phone?: string;
}

export default function MobileAboutView({ about, philosophies = [], phone }: MobileAboutViewProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'radar' | 'interests' | 'principles' | 'trivia'>('story');
  const [dhakaTime, setDhakaTime] = useState('');
  const [isAwake, setIsAwake] = useState(true);
  const [openTrivia, setOpenTrivia] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const { playSound } = useSystemStore();

  // Normalize interests from database
  const interestsList = useMemo(() => {
    if (!about.interests) return [];
    if (Array.isArray(about.interests)) return about.interests;
    if (typeof about.interests === 'string') {
      try {
        const parsed = JSON.parse(about.interests);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return (about.interests as string).split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  }, [about.interests]);

  // Extract dynamic extras (Tech Radar and Trivia) from bio_html metadata
  const { cleanBioHtml, techRadar, trivia } = useMemo(() => {
    return parseAboutExtras(about.bio_html);
  }, [about.bio_html]);

  // Live Dhaka Time & Sleep Status
  useEffect(() => {
    const updateDhakaTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setDhakaTime(timeStr);

      const hourInDhaka = parseInt(
        now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', hour12: false })
      );
      setIsAwake(hourInDhaka >= 8 || hourInDhaka <= 2);
    };

    updateDhakaTime();
    const interval = setInterval(updateDhakaTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('almahi.cs@gmail.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const avatarSrc = about.avatar_url && !about.avatar_url.includes('unsplash')
    ? about.avatar_url
    : '/images/formal.png';

  return (
    <div className="space-y-4 pb-8 max-w-full text-slate-900 font-sans">
      {/* 1. Mobile Identity Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
              <img
                src={avatarSrc}
                alt={about.full_name || 'Mujahid Al Mahi'}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                isAwake ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={isAwake ? 'Online & Available' : 'Asleep in Dhaka'}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight truncate">
              {about.full_name || 'Mujahid Al Mahi'}
            </h1>
            <p className="text-xs font-bold text-blue-700 mt-0.5 leading-snug">
              Software Systems Engineer & Creative Technologist
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{about.location || 'Dhaka, Bangladesh'}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">
                {about.status_text || 'Available for Contracts'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Dhaka Time Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] font-mono text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Dhaka Time (UTC+6):</span>
            <strong className="text-slate-900">{dhakaTime || '12:00 PM'}</strong>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isAwake ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isAwake ? 'Awake & Active' : 'Resting'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <a
            href="mailto:almahi.cs@gmail.com"
            onClick={() => playSound('open')}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-200 active:scale-95 transition-transform cursor-pointer"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedEmail ? 'Email Copied' : 'Copy Email'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs text-center">
          <div className="text-lg font-black text-blue-700 font-mono">
            {about.experience_years || 5}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Years Exp
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs text-center">
          <div className="text-lg font-black text-indigo-700 font-mono">
            {about.projects_completed || 24}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Shipped
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs text-center">
          <div className="text-lg font-black text-amber-700 font-mono">
            {about.coffee_cups || 1400}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Coffees
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'story', label: 'Story & Bio' },
          { id: 'radar', label: 'Tech Radar' },
          { id: 'interests', label: 'Interests' },
          { id: 'principles', label: 'Mental Models' },
          { id: 'trivia', label: 'Trivia & FAQs' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSound('click');
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'story' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Bio Story Body */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Engineering Biography</span>
            </h3>
            <div
              className="text-xs text-slate-700 leading-relaxed space-y-2.5 prose prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-a:text-blue-600 prose-code:text-indigo-700"
              dangerouslySetInnerHTML={{ __html: cleanBioHtml || about.bio_html || '' }}
            />
          </div>

          {/* Quote Card */}
          {about.quote && (
            <div className="bg-linear-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 border border-amber-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                <Quote className="w-4 h-4 text-amber-600 fill-amber-500" />
                <span>Operating Philosophy</span>
              </div>
              <blockquote className="text-xs italic text-amber-950 leading-relaxed font-serif">
                &ldquo;{about.quote}&rdquo;
              </blockquote>
              {about.quote_author && (
                <div className="text-[10px] font-mono font-bold text-amber-700 text-right mt-1">
                  — {about.quote_author}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'radar' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Technical Adoption Radar</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Industry Standards</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {techRadar.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">{item.status}</span>
                  <div className="font-bold text-xs text-slate-900 leading-snug">{item.title}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interests' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Personal Passions & Pursuits</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{interest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'principles' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="space-y-2.5">
            {philosophies.map((phil) => (
              <div
                key={phil.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{phil.title}</span>
                  </h4>
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                    {phil.category}
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50/70 border-l-2 border-amber-500 rounded-lg text-xs font-semibold text-slate-900 italic">
                  &ldquo;{phil.axiom}&rdquo;
                </div>

                {phil.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                    {phil.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trivia' && (
        <div className="space-y-2.5 animate-fadeIn">
          {trivia.map((item, idx) => {
            const isOpen = openTrivia === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setOpenTrivia(isOpen ? null : idx);
                  }}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 leading-snug">{item.q}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
