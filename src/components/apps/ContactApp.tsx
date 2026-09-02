'use client';

import React, { useState } from 'react';
import {
  Mail, Send, CheckCircle2, AlertCircle, Loader2,
  Clock, MapPin, Sparkles, MessageSquare, ExternalLink
} from 'lucide-react';
import { GithubIcon } from '@/components/shared/Icons';
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

export default function ContactApp() {
  const { playSound } = useSystemStore();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [renderedAt] = useState<number>(() => Date.now());
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyTemplate = (tmpl: typeof templates[0]) => {
    playSound('click');
    setSubject(tmpl.subject);
    setMessage(tmpl.msg);
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch message');

      playSound('success');
      setStatus({ type: 'success', text: 'Message delivered successfully to Mahi’s mail spooler!' });
      setSenderName('');
      setSenderEmail('');
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      playSound('error');
      const msg = err instanceof Error ? err.message : 'Transmission failed';
      setStatus({ type: 'error', text: msg });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-[#111827]">
      {/* Anti-Bot Honeypot Field */}
      <input
        type="text"
        name="security_honeypot_trap"
        tabIndex={-1}
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        autoComplete="off"
      />

      {/* Mail Client Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Mail_Client.exe — Compose New Dispatch
            </h2>
            <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
              <span>SMTP: ONLINE</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Response SLA: &lt; 24 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {status && (
        <div
          className={`p-3 retro-box-inset text-xs flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-red-50 text-red-800 border-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      {/* Quick Inquiry Templates */}
      <div className="p-2.5 bg-[#f3f4f6] retro-box-inset flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-bold text-gray-600 text-[11px] mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Quick Templates:</span>
        </span>
        {templates.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => handleApplyTemplate(t)}
            className="retro-btn px-2 py-0.5 text-[10px] font-medium text-gray-800 cursor-pointer"
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Header Fields */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-20 text-right text-xs font-bold text-gray-600 shrink-0">To:</span>
          <div className="flex-1 px-2.5 py-1 bg-[#e5e7eb] retro-box-inset font-mono text-xs text-gray-700">
            Mujahid Al Mahi &lt;mujahidmahi.official@gmail.com&gt;
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-20 text-right text-xs font-bold text-gray-700 shrink-0">From Name:</label>
          <input
            type="text"
            required
            placeholder="Your Full Name"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="flex-1 px-2.5 py-1 bg-white retro-box-inset text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-20 text-right text-xs font-bold text-gray-700 shrink-0">Your Email:</label>
          <input
            type="email"
            required
            placeholder="your.email@example.com"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="flex-1 px-2.5 py-1 bg-white retro-box-inset text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-20 text-right text-xs font-bold text-gray-700 shrink-0">Subject:</label>
          <input
            type="text"
            required
            placeholder="Engineering Opportunity / Collaboration / Inquiry"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 px-2.5 py-1 bg-white retro-box-inset text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Body Area */}
      <div className="space-y-1">
        <textarea
          rows={6}
          required
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 bg-white retro-box-inset text-xs font-sans leading-relaxed focus:outline-none resize-none"
        />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>Characters: {message.length}</span>
          <span>SSL 256-BIT ENCRYPTION</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-300">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <a
            href="https://github.com/mujahidmahi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-700 flex items-center gap-1"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/mujahidmahi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-700 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="retro-btn px-4 py-2 font-bold text-xs text-[#000080] flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>{isSending ? 'Transmitting...' : 'Send Message'}</span>
        </button>
      </div>
    </form>
  );
}
