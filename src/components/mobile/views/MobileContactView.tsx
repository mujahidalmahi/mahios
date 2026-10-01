'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

const templates = [
  {
    name: 'Engineering Role',
    subject: 'Software Engineering Role Inquiry',
    msg: 'Hi Mahi,\n\nI explored your MahiOS digital portfolio and was thoroughly impressed by your architecture and systems craft. We have an exciting engineering opportunity at [Company Name] and would love to connect!\n\nBest regards,',
  },
  {
    name: 'Freelance Project',
    subject: 'Project Collaboration Inquiry',
    msg: 'Hi Mahi,\n\nWe are looking to build a high-performance web platform utilizing Next.js, Supabase, and TypeScript. We would love to discuss your availability for an upcoming project.\n\nThanks,',
  },
  {
    name: 'Coffee Chat',
    subject: 'Virtual Coffee Chat & Tech Discussion',
    msg: 'Hey Mahi,\n\nJust wanted to say fantastic work on the OS biography! Would love to connect for a quick virtual coffee and talk about distributed systems, React, and spatial UI.\n\nCheers,',
  },
];

export default function MobileContactView() {
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

  const directEmail = 'almahi.cs@gmail.com';

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
      if (res.ok && json.success) {
        playSound('success');
        setStatus({ type: 'success', text: 'Message delivered directly to Mahi’s inbox.' });
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
    <div className="space-y-4 pb-6 flex flex-col min-h-full">
      {/* Quick Direct Email Banner */}
      <div className="bg-white rounded-2xl p-3.5 flex items-center justify-between border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 leading-tight">Direct Email</div>
            <div className="text-[11px] text-slate-500 font-mono truncate">{directEmail}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold active:scale-95 transition-all"
            title="Copy email"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`mailto:${directEmail}`}
            onClick={() => playSound('open')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
          >
            Compose
          </a>
        </div>
      </div>

      {/* Message Compose Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Send Direct Dispatch
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Inbox monitored regularly by Mujahid Al Mahi</p>
        </div>

        {/* Quick Template Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick-Fill Templates</span>
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
          {/* Honeypot field */}
          <input
            type="text"
            name="security_honeypot_trap"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            autoComplete="off"
          />

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
              placeholder="Project Collaboration / Opportunity"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Message *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending note...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Dispatch</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
