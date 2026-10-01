'use client';

import React from 'react';
import {
  User, MapPin, Briefcase, Award, Coffee, Code2,
  Mail, Sparkles, Heart, Quote, ArrowUpRight
} from 'lucide-react';
import { AboutContent, PhilosophyItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileAboutViewProps {
  about: AboutContent;
  philosophies?: PhilosophyItem[];
  phone?: string;
}

export default function MobileAboutView({ about, philosophies = [] }: MobileAboutViewProps) {
  const { playSound } = useSystemStore();

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Mobile Identity Profile Card */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/40 rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
            <img
              src="/images/mahios-logo.png"
              alt={about.full_name || 'Mujahid Al Mahi'}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Online" />
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {about.full_name || 'Mujahid Al Mahi'}
          </h2>
          <p className="text-xs font-semibold text-blue-700 mt-0.5">
            Full-Stack Software Engineer & Creative Technologist
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{about.location || 'Dhaka, Bangladesh'}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">{about.status_text || 'Available for Contracts'}</span>
          </div>
        </div>

        {/* Quick Contact & Portfolio Pills */}
        <div className="grid grid-cols-2 gap-2 w-full pt-1">
          <a
            href="mailto:almahi.cs@gmail.com"
            onClick={() => playSound('open')}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </a>
          <a
            href="#socials"
            onClick={() => playSound('open')}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Social Links</span>
          </a>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center">
          <div className="text-base font-black text-blue-700 font-mono">
            {about.experience_years || 5}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Years Exp
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center">
          <div className="text-base font-black text-indigo-700 font-mono">
            {about.projects_completed || 24}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Shipped
          </div>
        </div>

        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs text-center">
          <div className="text-base font-black text-amber-700 font-mono">
            {about.coffee_cups || 1400}+
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            Coffees
          </div>
        </div>
      </div>

      {/* 3. Biography Story */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Biography & Mission</span>
        </h3>
        {about.bio_html ? (
          <div
            className="text-xs text-slate-700 leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: about.bio_html }}
          />
        ) : (
          <p className="text-xs text-slate-700 leading-relaxed">
            Full-stack systems craftsman and creative technologist specializing in Next.js 16, TypeScript, Supabase, and retro-futuristic spatial interfaces. Passionate about human-computer interaction, offline-first architectures, and ultra-performant web computing.
          </p>
        )}
      </div>

      {/* 4. Core Interests & Tech Focus */}
      {about.interests?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Core Interests & Focus</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {about.interests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200/70"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Personal Quote / Philosophy */}
      {about.quote && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
            <Quote className="w-4 h-4" />
            <span>Guiding Tenet</span>
          </div>
          <p className="text-xs italic leading-relaxed text-slate-200">
            &ldquo;{about.quote}&rdquo;
          </p>
          <div className="text-[10px] text-right font-mono text-sky-300 font-bold">
            — {about.quote_author || 'Mujahid Al Mahi'}
          </div>
        </div>
      )}
    </div>
  );
}
