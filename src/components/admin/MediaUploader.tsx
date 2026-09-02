'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Copy, Check, RefreshCw } from 'lucide-react';

interface MediaUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  helperText?: string;
}

export default function MediaUploader({
  value,
  onChange,
  label = 'Upload Image / Media',
  folder = 'mahios',
  helperText = 'Uploads to storage with instant preview and CDN delivery.',
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const processUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border border-dashed rounded-xl p-4 text-center transition-all ${
          isUploading
            ? 'bg-blue-950/40 border-blue-500'
            : 'bg-slate-950/60 hover:bg-slate-950/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />

        {value ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
            {value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || value.startsWith('data:image') || value.includes('images.unsplash.com') || value.includes('res.cloudinary.com') ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Media File Active</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate font-mono bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                {value}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace File</span>
                </button>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-3">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Uploading to media storage...</span>
              </div>
            ) : (
              <>
                <div className="mx-auto w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-400 flex items-center justify-center shadow-md">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-bold text-blue-400 hover:text-blue-300 cursor-pointer underline underline-offset-2"
                  >
                    Click to upload
                  </button>{' '}
                  or drag and drop
                </div>
                <p className="text-[11px] font-mono text-slate-500">PNG, JPG, WebP, SVG, or PDF</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/60">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}
