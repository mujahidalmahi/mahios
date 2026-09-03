'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Palette, Download, RotateCcw, Eraser, PenTool } from 'lucide-react';
import { useSystemStore } from '@/stores/systemStore';

const colors = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'
];

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const { playSound } = useSystemStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : currentColor;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleClear = () => {
    playSound('click');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    playSound('click');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `MahiOS_Painting_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-2 text-black text-xs font-sans select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-[#d4d0c8] border-b border-gray-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setTool('brush');
            }}
            className={`px-2 py-1 retro-btn flex items-center gap-1 cursor-pointer font-bold ${
              tool === 'brush' ? 'bg-white font-bold' : ''
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Brush</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setTool('eraser');
            }}
            className={`px-2 py-1 retro-btn flex items-center gap-1 cursor-pointer font-bold ${
              tool === 'eraser' ? 'bg-white font-bold' : ''
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          {/* Line Width */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[11px] text-gray-600 font-bold">Size:</span>
            {[2, 4, 8, 14].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setBrushSize(sz)}
                className={`px-1.5 py-0.5 retro-btn cursor-pointer ${brushSize === sz ? 'bg-white font-bold' : ''}`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-2.5 py-1 retro-btn flex items-center gap-1 font-bold cursor-pointer text-blue-900"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Picture</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 retro-btn flex items-center gap-1 font-bold cursor-pointer text-red-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>

      {/* 90s Paint Color Palette */}
      <div className="flex items-center gap-1.5 p-1 bg-[#d4d0c8] border border-gray-400">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold">Color:</span>
          <div
            className="w-5 h-5 border-2 border-black rounded-2xs"
            style={{ backgroundColor: currentColor }}
          />
        </div>
        <div className="flex flex-wrap gap-1 flex-1">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                playSound('click');
                setCurrentColor(c);
                if (tool === 'eraser') setTool('brush');
              }}
              style={{ backgroundColor: c }}
              className={`w-4 h-4 border border-black cursor-pointer ${
                currentColor === c ? 'ring-2 ring-blue-700' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="bg-gray-200 p-2 flex items-center justify-center border-2 border-[#808080] retro-box-inset overflow-auto">
        <canvas
          ref={canvasRef}
          width={680}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={stopDrawing}
          className="bg-white shadow-md cursor-crosshair border border-gray-400 touch-none max-w-full"
        />
      </div>
    </div>
  );
}
