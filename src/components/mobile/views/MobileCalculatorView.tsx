'use client';

import React, { useState } from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function MobileCalculatorView() {
  const { playSound } = useSystemStore();
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleDigit = (digit: string) => {
    playSound('click');
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    playSound('click');
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOp = (op: string) => {
    playSound('click');
    const val = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(val);
    } else if (operation) {
      const current = prevValue;
      let result = val;
      if (operation === '+') result = current + val;
      if (operation === '-') result = current - val;
      if (operation === '×') result = current * val;
      if (operation === '÷') result = val !== 0 ? current / val : 0;
      setPrevValue(result);
      setDisplay(String(result));
    }
    setWaitingForOperand(true);
    setOperation(op);
  };

  const handleEquals = () => {
    playSound('success');
    const val = parseFloat(display);
    if (prevValue !== null && operation) {
      let result = val;
      if (operation === '+') result = prevValue + val;
      if (operation === '-') result = prevValue - val;
      if (operation === '×') result = prevValue * val;
      if (operation === '÷') result = val !== 0 ? prevValue / val : 0;
      setDisplay(String(result));
      setPrevValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    playSound('click');
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="max-w-xs mx-auto space-y-4 pb-6 pt-2">
      {/* LCD Display */}
      <div className="bg-[#14261d] rounded-2xl p-4 border-2 border-[#1e4630] shadow-inner text-right space-y-1">
        <div className="h-4 text-[11px] font-mono text-emerald-400/60 font-bold">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-3xl font-mono font-black text-emerald-400 tracking-wider truncate">
          {display}
        </div>
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="col-span-2 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs shadow-xs active:scale-95 cursor-pointer"
        >
          AC Clear
        </button>
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
          }}
          className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleOp('÷')}
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-xs active:scale-95 cursor-pointer"
        >
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="py-3 bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold rounded-xl text-base border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleOp('×')}
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-xs active:scale-95 cursor-pointer"
        >
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="py-3 bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold rounded-xl text-base border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleOp('-')}
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-xs active:scale-95 cursor-pointer"
        >
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="py-3 bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold rounded-xl text-base border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleOp('+')}
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base shadow-xs active:scale-95 cursor-pointer"
        >
          +
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="col-span-2 py-3 bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold rounded-xl text-base border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleDecimal}
          className="py-3 bg-white hover:bg-slate-50 text-slate-900 font-mono font-bold rounded-xl text-base border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
        >
          .
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-base shadow-xs active:scale-95 cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
}
