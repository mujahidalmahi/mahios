'use client';

import React, { useState } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const { playSound } = useSystemStore();

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

  const handleOperator = (nextOp: string) => {
    playSound('click');
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const current = prevValue || 0;
      let newValue = current;
      if (operator === '+') newValue = current + inputValue;
      if (operator === '-') newValue = current - inputValue;
      if (operator === '*') newValue = current * inputValue;
      if (operator === '/') newValue = inputValue !== 0 ? current / inputValue : 0;

      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOp);
  };

  const handleEquals = () => {
    playSound('click');
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      let newValue = prevValue;
      if (operator === '+') newValue = prevValue + inputValue;
      if (operator === '-') newValue = prevValue - inputValue;
      if (operator === '*') newValue = prevValue * inputValue;
      if (operator === '/') newValue = inputValue !== 0 ? prevValue / inputValue : 0;

      setDisplay(String(newValue));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    playSound('click');
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    playSound('click');
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleSqrt = () => {
    playSound('click');
    const val = parseFloat(display);
    if (val >= 0) {
      setDisplay(String(Math.sqrt(val)));
      setWaitingForOperand(true);
    }
  };

  const handlePercent = () => {
    playSound('click');
    const val = parseFloat(display);
    setDisplay(String(val / 100));
    setWaitingForOperand(true);
  };

  return (
    <div className="max-w-[280px] mx-auto p-2 bg-[#c0c0c0] space-y-2 select-none font-sans text-xs">
      {/* 90s LED Display */}
      <div className="bg-white border-2 border-[#808080] retro-box-inset p-2 text-right">
        <div className="font-mono text-xl text-black font-bold tracking-wider truncate">
          {display}
        </div>
      </div>

      {/* Memory & Function Bar */}
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setMemory(null);
          }}
          className="p-1 retro-btn font-bold text-red-700"
        >
          MC
        </button>
        <button
          type="button"
          onClick={() => {
            playSound('click');
            if (memory !== null) setDisplay(String(memory));
          }}
          className="p-1 retro-btn font-bold text-blue-900"
        >
          MR
        </button>
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setMemory(parseFloat(display));
          }}
          className="p-1 retro-btn font-bold text-blue-900"
        >
          MS
        </button>
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setMemory((memory || 0) + parseFloat(display));
          }}
          className="p-1 retro-btn font-bold text-blue-900"
        >
          M+
        </button>
      </div>

      {/* Main Keypad */}
      <div className="grid grid-cols-4 gap-1">
        <button type="button" onClick={handleBackspace} className="p-2 retro-btn font-bold text-red-800">
          ←
        </button>
        <button type="button" onClick={() => setDisplay('0')} className="p-2 retro-btn font-bold text-red-800">
          CE
        </button>
        <button type="button" onClick={handleClear} className="p-2 retro-btn font-bold text-red-800">
          C
        </button>
        <button type="button" onClick={handleSqrt} className="p-2 retro-btn font-bold text-blue-900">
          √
        </button>

        {['7', '8', '9'].map((d) => (
          <button key={d} type="button" onClick={() => handleDigit(d)} className="p-2.5 retro-btn font-bold text-black text-sm">
            {d}
          </button>
        ))}
        <button type="button" onClick={() => handleOperator('/')} className="p-2.5 retro-btn font-bold text-blue-900 text-sm">
          /
        </button>

        {['4', '5', '6'].map((d) => (
          <button key={d} type="button" onClick={() => handleDigit(d)} className="p-2.5 retro-btn font-bold text-black text-sm">
            {d}
          </button>
        ))}
        <button type="button" onClick={() => handleOperator('*')} className="p-2.5 retro-btn font-bold text-blue-900 text-sm">
          *
        </button>

        {['1', '2', '3'].map((d) => (
          <button key={d} type="button" onClick={() => handleDigit(d)} className="p-2.5 retro-btn font-bold text-black text-sm">
            {d}
          </button>
        ))}
        <button type="button" onClick={() => handleOperator('-')} className="p-2.5 retro-btn font-bold text-blue-900 text-sm">
          -
        </button>

        <button type="button" onClick={() => handleDigit('0')} className="p-2.5 retro-btn font-bold text-black text-sm">
          0
        </button>
        <button type="button" onClick={handleDecimal} className="p-2.5 retro-btn font-bold text-black text-sm">
          .
        </button>
        <button type="button" onClick={handleEquals} className="p-2.5 retro-btn font-bold bg-[#000080] text-blue-900 text-sm">
          =
        </button>
        <button type="button" onClick={() => handleOperator('+')} className="p-2.5 retro-btn font-bold text-blue-900 text-sm">
          +
        </button>
      </div>
    </div>
  );
}
