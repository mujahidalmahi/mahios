'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileEdit, Save, Trash2, Copy, Check, Download } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function MobileNotepadView() {
  const { playSound } = useSystemStore();
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedTime, setSavedTime] = useState<string>('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mahios_mobile_note') || '';
      setContent(saved);
      if (saved) setSavedTime('Restored from memory');
    }
  }, []);

  const handleChange = (val: string) => {
    setContent(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahios_mobile_note', val);
      setSavedTime('Auto-saved just now');
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

  const handleDownload = () => {
    playSound('click');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MahiOS_Note_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content ? content.split('\n').length : 0;
    return { chars, words, lines };
  }, [content]);

  const fontSizeClass = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
  }[fontSize];

  return (
    <div className="space-y-2.5 pb-6 flex flex-col flex-1 h-full min-h-0">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-1 gap-2 flex-wrap xs:flex-nowrap">
        <span className="text-[10px] font-mono text-slate-500 font-bold truncate">
          {savedTime || 'Instant local storage'}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Font size switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
            {(['sm', 'base', 'lg'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFontSize(s)}
                className={`px-2 py-0.5 rounded uppercase ${
                  fontSize === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {s === 'sm' ? 'A' : s === 'base' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            title="Copy text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!content.trim()}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 disabled:opacity-40 cursor-pointer"
            title="Download .txt"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!content.trim()}
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-40 cursor-pointer"
            title="Clear note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type quick notes, ideas, code snippets, or thoughts here..."
        className={`flex-1 w-full p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs font-mono leading-relaxed text-slate-900 focus:outline-none focus:border-blue-500 resize-none min-h-[220px] ${fontSizeClass}`}
      />

      {/* Word & Char counter bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-2 pt-1 border-t border-slate-200">
        <span>{stats.words} words • {stats.chars} characters</span>
        <span>{stats.lines} lines</span>
      </div>
    </div>
  );
}
