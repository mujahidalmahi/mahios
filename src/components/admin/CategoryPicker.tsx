'use client';

import React, { useState } from 'react';
import { Plus, Tag, Check, Sparkles } from 'lucide-react';

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
  existingCategories?: string[];
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export default function CategoryPicker({
  value,
  onChange,
  existingCategories = [],
  label = 'Category / Type',
  placeholder = 'Type any custom category or choose below...',
  helperText = 'Choose an existing category or type your own custom category name.',
}: CategoryPickerProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Deduplicate and filter out empty strings
  const uniqueCategories = Array.from(
    new Set(
      [
        ...existingCategories,
        value,
      ].filter(Boolean)
    )
  );

  const handleSelect = (cat: string) => {
    onChange(cat);
    setIsCustomMode(false);
  };

  const handleApplyCustom = () => {
    if (!customInput.trim()) return;
    onChange(customInput.trim());
    setCustomInput('');
    setIsCustomMode(false);
  };

  return (
    <div className="space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-400" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
          Current: {value || 'None'}
        </span>
      </div>

      {/* Existing Category Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {uniqueCategories.map((cat) => {
          const isSelected = value.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
              <span>{cat}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsCustomMode(!isCustomMode)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            isCustomMode
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-amber-500/30'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Custom Category</span>
        </button>
      </div>

      {/* Freeform Custom Category Input */}
      {isCustomMode && (
        <div className="pt-2 flex gap-2 animate-fadeIn">
          <input
            type="text"
            placeholder="Type new custom category name (e.g. Distributed Systems, Anime Classics)..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyCustom();
              }
            }}
            autoFocus
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleApplyCustom}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-500">{helperText}</p>
    </div>
  );
}
