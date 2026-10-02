'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User, MapPin, Coffee, Code2, Award, Sparkles, Quote,
  Copy, Check, Clock, Compass, BookOpen, HelpCircle,
  Mail, Globe, ChevronDown, ChevronUp, Layers, CheckCircle2,
  Contact, Download, X
} from 'lucide-react';
import { AboutContent, PhilosophyItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { parseAboutExtras } from '@/lib/data/aboutExtras';
import { downloadVCard } from '@/lib/utils/vcardGenerator';

interface MobileAboutViewProps {
  about: AboutContent;
  philosophies?: PhilosophyItem[];
  phone?: string;
}

export default function MobileAboutView({ about, philosophies = [], phone }: MobileAboutViewProps) {
  const displayPhone = phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '';
  const [activeTab, setActiveTab] = useState<'story' | 'interests' | 'principles' | 'radar' | 'trivia'>('story');
  const [dhakaTime, setDhakaTime] = useState('');
  const [isAwake, setIsAwake] = useState(true);
  const [openTrivia, setOpenTrivia] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showVCardModal, setShowVCardModal] = useState(false);
  const { playSound } = useSystemStore();

  const officialEmail = 'mujahidmahi.official@gmail.com';

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
      navigator.clipboard.writeText(officialEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleDownloadVCard = () => {
    playSound('click');
    downloadVCard({
      fullName: about.full_name || 'Mujahid Al Mahi',
      title: 'Software Systems Engineer',
      email: officialEmail,
      phone: displayPhone,
      location: about.location || 'Narayanganj, Bangladesh',
      website: 'https://mujahidmahi.me',
      note: about.status_text || 'Software Systems Engineer & Creative Technologist. Portfolio: https://mujahidmahi.me',
    });
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
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1 font-medium">
              {about.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{about.location}</span>
                </span>
              )}
              {about.location && about.status_text && <span>•</span>}
              {about.status_text && (
                <span className="text-emerald-700 font-bold">
                  {about.status_text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Taglines Chips (Complete Data Fidelity with Desktop) */}
        {about.taglines && about.taglines.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {about.taglines.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

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

        {/* Quick Actions (Email, Copy, vCard) */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          <a
            href={`mailto:${officialEmail}`}
            onClick={() => playSound('open')}
            className="py-2 px-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-200 active:scale-95 transition-transform cursor-pointer"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="truncate">{copiedEmail ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setShowVCardModal(true);
            }}
            className="py-2 px-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-blue-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-200 active:scale-95 transition-transform cursor-pointer"
          >
            <Contact className="w-3.5 h-3.5" />
            <span>vCard</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar (Exact Desktop Parity) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs text-center">
          <div className="text-lg font-black text-blue-700 font-mono">
            {about.experience_years}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Years Experience
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs text-center">
          <div className="text-lg font-black text-indigo-700 font-mono">
            {about.projects_completed}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Shipped Projects
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs text-center">
          <div className="text-lg font-black text-amber-700 font-mono">
            {about.coffee_cups}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Cups of Coffee
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs (Exact Desktop Parity: Narrative Bio, Interests, Principles, Tech Radar, Trivia & Q&A) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'story', label: 'Narrative Bio', icon: BookOpen },
          { id: 'interests', label: `Interests (${interestsList.length})`, icon: Sparkles },
          { id: 'principles', label: `Principles (${philosophies.length})`, icon: Compass },
          { id: 'radar', label: `Tech Radar (${techRadar.length})`, icon: Sparkles },
          { id: 'trivia', label: `Trivia & Q&A (${trivia.length})`, icon: HelpCircle },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playSound('click');
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}
      {/* Tab 1: Narrative Bio */}
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
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl p-4 border border-amber-200/80 shadow-2xs space-y-1.5">
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

      {/* Tab 2: Interests (Exact Desktop Parity) */}
      {activeTab === 'interests' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Documented Engineering Interests</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Key technology domains, architectural disciplines, and engineering hobbies actively explored, researched, and practiced.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {interestsList.map((interest, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                    {i + 1}
                  </div>
                  <span className="break-words">{interest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Principles (Exact Desktop Parity from philosophies table) */}
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
                  {phil.category && (
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                      {phil.category}
                    </span>
                  )}
                </div>

                {phil.description && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {phil.description}
                  </p>
                )}

                {phil.axiom && (
                  <div className="p-2.5 bg-amber-50/70 border-l-2 border-amber-500 rounded-lg text-xs font-semibold text-slate-900 italic font-mono">
                    &ldquo;{phil.axiom}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tech Radar (Exact Desktop Parity) */}
      {activeTab === 'radar' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Currently Exploring & Refining</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Tech Radar</span>
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

      {/* Tab 5: Trivia & Q&A (Exact Desktop Parity) */}
      {activeTab === 'trivia' && (
        <div className="space-y-2.5 animate-fadeIn">
          {trivia.map((item, idx) => {
            const isOpen = openTrivia === idx;
            return (
              <div
                key={item.id || idx}
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
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 leading-snug">{item.q}</span>
                    {item.category && (
                      <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">
                        {item.category}
                      </span>
                    )}
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

      {/* Electronic Business Card (vCard) Modal */}
      {showVCardModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setShowVCardModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                  <img
                    src={avatarSrc}
                    alt={about.full_name || 'Mujahid Al Mahi'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {about.full_name || 'Mujahid Al Mahi'}
                  </h3>
                  <p className="text-xs font-bold text-blue-700">Software Systems Engineer</p>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Verified Contact Card</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowVCardModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email:</span>
                </span>
                <a
                  href={`mailto:${officialEmail}`}
                  className="font-mono text-blue-700 font-bold hover:underline truncate max-w-[200px]"
                >
                  {officialEmail}
                </a>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Location:</span>
                </span>
                <span className="text-slate-800 font-medium">
                  {about.location || 'Narayanganj, Bangladesh'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Website:</span>
                </span>
                <a
                  href="https://mujahidmahi.me"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-700 font-bold hover:underline"
                >
                  mujahidmahi.me
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Contacts (.vcf)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowVCardModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
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
