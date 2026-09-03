'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User, MapPin, Coffee, Code2, Award, Sparkles, Quote,
  Copy, Check, Clock, Download, Lightbulb, Compass,
  BookOpen, HelpCircle, HeartHandshake, ShieldCheck
} from 'lucide-react';
import { AboutContent, PhilosophyItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import { parseAboutExtras } from '@/lib/data/aboutExtras';

interface AboutAppProps {
  about: AboutContent;
  philosophies?: PhilosophyItem[];
}

export default function AboutApp({ about, philosophies = [] }: AboutAppProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'principles' | 'radar' | 'trivia'>('story');
  const [copied, setCopied] = useState(false);
  const [dhakaTime, setDhakaTime] = useState('');
  const [isAwake, setIsAwake] = useState(true);
  const [openTrivia, setOpenTrivia] = useState<number | null>(null);
  const { playSound } = useSystemStore();

  // Extract dynamic extras (Tech Radar and Trivia) from bio_html metadata
  const { cleanBioHtml, techRadar, trivia } = useMemo(() => {
    return parseAboutExtras(about.bio_html);
  }, [about.bio_html]);

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
    navigator.clipboard.writeText('mujahidmahi.official@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadVCard = () => {
    playSound('click');
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${about.full_name}
TITLE:Full-Stack Software Engineer & Creative Technologist
EMAIL:mujahidmahi.official@gmail.com
URL:https://mujahidmahi.me
ADR:;;${about.location};;;;
NOTE:${about.status_text}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${about.full_name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-[#111827] max-w-full overflow-hidden break-words">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-[#f3f4f6] retro-box-inset rounded-xs">
        {/* Profile Avatar */}
        <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-xs retro-box-outset p-1 bg-white shrink-0 overflow-hidden relative group">
          {about.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.avatar_url} alt={about.full_name} className="w-full h-full object-cover rounded-2xs" />
          ) : (
            <div className="w-full h-full bg-[#000080] flex items-center justify-center text-white font-bold text-2xl">
              M
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Online & Available" />
        </div>

        {/* Identity & Actions */}
        <div className="space-y-2 text-center sm:text-left flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <h1 className="text-lg sm:text-2xl font-bold font-sans tracking-tight text-[#000080] break-words">
              {about.full_name}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="retro-btn px-2 py-0.5 text-[10px] sm:text-[11px] flex items-center gap-1 font-semibold text-gray-800 cursor-pointer"
                title="Copy Email Address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-600" />}
                <span>{copied ? 'Copied!' : 'Copy Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadVCard}
                className="retro-btn px-2 py-0.5 text-[10px] sm:text-[11px] flex items-center gap-1 font-semibold text-[#000080] cursor-pointer"
                title="Download Electronic Contact Card (.vcf)"
              >
                <Download className="w-3 h-3" />
                <span>Save vCard</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1">
            {about.taglines?.map((tag, idx) => (
              <span key={idx} className="text-[10px] sm:text-[11px] font-semibold text-[#1f2937] bg-white px-2 py-0.5 border border-gray-300 rounded-2xs">
                {tag}
              </span>
            ))}
          </div>

          {/* Location, Local Time & Activity Status */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-gray-600 pt-0.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{about.location}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-gray-700">
              <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span>Local: {dhakaTime || '6:00 PM'} (GMT+6)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isAwake ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className={isAwake ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                {isAwake ? about.status_text || 'Active & Coding' : 'Recharging (AFK)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="p-2.5 bg-[#e5e7eb] retro-box-outset text-center">
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#000080]">
            {about.experience_years}+
          </div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-gray-700 leading-tight">Years Experience</div>
        </div>
        <div className="p-2.5 bg-[#e5e7eb] retro-box-outset text-center">
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#000080]">
            {about.projects_completed}
          </div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-gray-700 leading-tight">Shipped Projects</div>
        </div>
        <div className="p-2.5 bg-[#e5e7eb] retro-box-outset text-center">
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#000080]">
            {about.coffee_cups}
          </div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-gray-700 leading-tight">Cups of Coffee</div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 pb-1">
        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('story'); }}
          className={`px-2.5 py-1 font-bold text-[11px] sm:text-xs cursor-pointer ${
            activeTab === 'story' ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]' : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Narrative Bio</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('principles'); }}
          className={`px-2.5 py-1 font-bold text-[11px] sm:text-xs cursor-pointer ${
            activeTab === 'principles' ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]' : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Principles ({philosophies.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('radar'); }}
          className={`px-2.5 py-1 font-bold text-[11px] sm:text-xs cursor-pointer ${
            activeTab === 'radar' ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]' : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tech Radar ({techRadar.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => { playSound('click'); setActiveTab('trivia'); }}
          className={`px-2.5 py-1 font-bold text-[11px] sm:text-xs cursor-pointer ${
            activeTab === 'trivia' ? 'retro-btn-pressed bg-[#e5e7eb] text-[#000080]' : 'retro-btn text-gray-700'
          }`}
        >
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Trivia & Q&A ({trivia.length})</span>
          </span>
        </button>
      </div>

      {/* Tab 1: Narrative Bio */}
      {activeTab === 'story' && (
        <div className="space-y-3">
          <div className="p-3 sm:p-4 bg-white retro-box-inset">
            <div
              dangerouslySetInnerHTML={{ __html: cleanBioHtml }}
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-xs break-words"
            />
          </div>

          {/* Favorite Quote */}
          {about.quote && (
            <div className="p-3 bg-[#fffbeb] border-l-4 border-[#f59e0b] retro-box-inset rounded-xs text-xs text-amber-900 italic flex items-start gap-2">
              <Quote className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="min-w-0 flex-1 break-words">
                <p>&ldquo;{about.quote}&rdquo;</p>
                {about.quote_author && (
                  <p className="font-semibold font-sans not-italic text-amber-800 mt-1">— {about.quote_author}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Engineering Principles (Dynamic from philosophies table) */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {philosophies.map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-white retro-box-inset space-y-1">
              <div className="flex items-center gap-1.5 text-[#000080] font-bold text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="break-words">{item.title}</span>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed break-words">{item.description}</p>
              {item.axiom && (
                <p className="text-[11px] font-mono text-gray-500 italic pt-1 border-t border-gray-100">&ldquo;{item.axiom}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Tech Radar (Dynamic) */}
      {activeTab === 'radar' && (
        <div className="p-3 sm:p-4 bg-white retro-box-inset space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>Currently Exploring & Refining</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {techRadar.map((item, idx) => (
              <div key={item.id || idx} className="p-2.5 bg-[#f9fafb] border border-gray-300 rounded-2xs space-y-0.5">
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">{item.status}</span>
                <div className="font-bold text-xs text-gray-900 break-words">{item.title}</div>
                <p className="text-[11px] text-gray-600 break-words">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Trivia & Q&A (Dynamic) */}
      {activeTab === 'trivia' && (
        <div className="space-y-2">
          {trivia.map((item, idx) => {
            const isOpen = openTrivia === idx;
            return (
              <div key={item.id || idx} className="p-2.5 sm:p-3 bg-white retro-box-inset space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setOpenTrivia(isOpen ? null : idx);
                  }}
                  className="w-full flex items-center justify-between text-left font-bold text-xs text-[#000080] cursor-pointer gap-2"
                >
                  <span className="flex items-center gap-1.5 min-w-0 flex-1">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span className="break-words">{item.q}</span>
                  </span>
                  <span className="text-gray-500 font-mono text-[10px] shrink-0">{isOpen ? '[-] Hide' : '[+] Reveal'}</span>
                </button>
                {isOpen && (
                  <p className="text-xs text-gray-700 pt-1 pl-5 border-t border-gray-100 leading-relaxed break-words">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
