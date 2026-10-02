'use client';

import React, { useState } from 'react';
import {
  Mail, Send, CheckCircle2, AlertCircle, Loader2,
  Sparkles, Copy, Check, Phone, MapPin, ExternalLink,
  ShieldCheck, Clock, MessageSquare
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/shared/Icons';
import { SocialLinkItem } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

const templates = [
  {
    name: 'Engineering Role',
    subject: 'Senior Full-Stack Engineering Role Inquiry',
    msg: 'Hi Mahi,\n\nI came across your MahiOS digital portfolio and was thoroughly impressed by your architecture and creative engineering craft. We have an exciting engineering opportunity at [Company Name] and would love to connect!\n\nBest regards,',
  },
  {
    name: 'Freelance / Contract',
    subject: 'Project Collaboration & Development Inquiry',
    msg: 'Hi Mahi,\n\nWe are looking to build a high-performance web platform utilizing Next.js, Supabase, and TypeScript. We would love to discuss availability and rates for an upcoming project.\n\nThanks,',
  },
  {
    name: 'Coffee Chat',
    subject: 'Virtual Coffee Chat & Tech Discussion',
    msg: 'Hey Mahi,\n\nJust wanted to say fantastic work on the retro OS biography! Would love to grab a virtual coffee and talk about distributed systems, React 19, and spatial UI.\n\nCheers,',
  },
];

interface MobileContactViewProps {
  contactEmail?: string;
  phone?: string;
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  socialLinks?: SocialLinkItem[];
}

export default function MobileContactView({
  contactEmail,
  phone,
  location,
  githubUrl,
  linkedinUrl,
  socialLinks = [],
}: MobileContactViewProps) {
  const { playSound } = useSystemStore();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [renderedAt] = useState<number>(() => Date.now());
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Strictly dynamic email sourced from database settings / about profile
  const directEmail = contactEmail || 'mujahidmahi.official@gmail.com';
  const displayPhone = phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '';
  const displayLocation = location || 'Narayanganj, Bangladesh';
  const effectiveGithub = githubUrl || 'https://github.com/mujahidmahi';
  const effectiveLinkedin = linkedinUrl || 'https://linkedin.com/in/mujahidmahi';

  const handleApplyTemplate = (tmpl: typeof templates[0]) => {
    playSound('click');
    setSubject(tmpl.subject);
    setMessage(tmpl.msg);
  };

  const handleCopyEmail = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(directEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyPhone = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard && displayPhone) {
      navigator.clipboard.writeText(displayPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: senderName,
          sender_email: senderEmail,
          subject,
          message,
          honeypot,
          renderedAt,
        }),
      });

      const json = await res.json();
      if (res.ok && (json.success || !json.error)) {
        playSound('success');
        setStatus({ type: 'success', text: 'Message delivered directly to Mahi’s mail spooler!' });
        setSenderName('');
        setSenderEmail('');
        setSubject('');
        setMessage('');
      } else {
        playSound('error');
        setStatus({ type: 'error', text: json.error || 'Failed to dispatch message.' });
      }
    } catch {
      playSound('error');
      setStatus({ type: 'error', text: 'Network connection error. Please try direct email.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-3 pb-8 flex flex-col min-h-full font-sans">
      {/* Top Telemetry & SLA Banner */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800">SMTP Gateway Online</span>
        </div>
        <div className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          Response SLA: &lt; 24h
        </div>
      </div>

      {/* Quick Direct Email Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Direct Inbox</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">Verified</span>
              </div>
              <div className="text-xs text-slate-600 font-mono truncate mt-0.5 font-medium">{directEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="p-1.5 xs:p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Copy email"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={`mailto:${directEmail}`}
              onClick={() => playSound('open')}
              className="px-2.5 xs:px-3 py-1.5 xs:py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] xs:text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs min-h-[36px] flex items-center justify-center"
            >
              Compose
            </a>
          </div>
        </div>

        {/* Supplementary Direct Contacts (Phone, Location, Social Profiles) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 text-xs">
          {displayPhone && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-slate-700 truncate text-[11px]">{displayPhone}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="Copy Phone"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`tel:${displayPhone}`}
                  className="text-[11px] font-bold text-blue-600 hover:underline px-1"
                >
                  Call
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Profiles:</span>
            <div className="flex items-center gap-3">
              <a
                href={effectiveGithub}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href={effectiveLinkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Message Compose Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Send Direct Dispatch</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Inbox monitored regularly by Mujahid Al Mahi</p>
        </div>

        {/* Quick Template Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick-Fill Inquiry Templates</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                + {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{status.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot anti-bot trap */}
          <input
            type="text"
            name="security_honeypot_trap"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            autoComplete="off"
          />

          {/* Destination Header */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-500 w-12 text-right shrink-0">To:</span>
            <span className="font-mono text-slate-700 font-semibold truncate">
              Mujahid Al Mahi &lt;{directEmail}&gt;
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Your Email *
            </label>
            <input
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Senior Full-Stack Engineering Role Inquiry"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Message *
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message or select a quick template above..."
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600 transition-colors resize-none leading-relaxed"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
              <span>Characters: {message.length}</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>SSL 256-Bit Encryption</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transmitting message...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Dispatch to Mahi</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
