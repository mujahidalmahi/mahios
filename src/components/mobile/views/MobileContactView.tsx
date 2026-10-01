'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function MobileContactView() {
  const { playSound } = useSystemStore();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
          honeypot: '',
          rendered_at: Date.now(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        playSound('success');
        setStatus({ type: 'success', text: 'Message delivered directly to Mujahid Al Mahi.' });
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
    <div className="space-y-4 pb-6">
      {/* Quick Direct Email Banner */}
      <div className="bg-slate-100 rounded-2xl p-3 flex items-center justify-between border border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Direct Email</div>
            <div className="text-[11px] text-slate-600 font-mono">almahi.cs@gmail.com</div>
          </div>
        </div>
        <a
          href="mailto:almahi.cs@gmail.com"
          onClick={() => playSound('open')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
        >
          Compose
        </a>
      </div>

      {/* Message Compose Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">Send Direct Dispatch</h3>
            <p className="text-[10px] text-slate-500">Inbox monitored 24/7 by Mujahid</p>
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
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Your Email
            </label>
            <input
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project Collaboration / Inquiry"
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
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
