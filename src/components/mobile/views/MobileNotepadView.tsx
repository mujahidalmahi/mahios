'use client';

import React, { useState, useEffect } from 'react';
import { FileEdit, Save, Trash2, Copy, Check } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function MobileNotepadView() {
  const { playSound } = useSystemStore();
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedTime, setSavedTime] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mahios_mobile_note') || '';
      setContent(saved);
      if (saved) setSavedTime('Restored');
    }
  }, []);

  const handleChange = (val: string) => {
    setContent(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahios_mobile_note', val);
      setSavedTime('Auto-saved');
    }
  };

  const handleClear = () => {
    playSound('click');
    if (confirm('Clear current scratchpad note?')) {
      setContent('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mahios_mobile_note');
        setSavedTime('');
      }
    }
  };

  const handleCopy = () => {
    playSound('click');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col h-full min-h-[70vh]">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono text-slate-500 font-bold">
          {savedTime || 'Instant local storage'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
            title="Clear note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type quick notes, ideas, code snippets, or thoughts here..."
        className="flex-1 w-full p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs font-mono text-xs leading-relaxed text-slate-900 focus:outline-none focus:border-blue-400 resize-none min-h-[300px]"
      />
    </div>
  );
}
