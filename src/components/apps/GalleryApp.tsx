'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, X, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Play, Pause,
  Download, Eye, Sparkles
} from 'lucide-react';
import { GalleryImage, GalleryCategory } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface GalleryAppProps {
  categories: GalleryCategory[];
  images: GalleryImage[];
}

export default function GalleryApp({ categories, images }: GalleryAppProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { playSound } = useSystemStore();

  const filteredImages = selectedCat === 'all'
    ? images
    : images.filter((img) => img.category_id === selectedCat);

  const activeImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  // Slideshow interval
  useEffect(() => {
    if (!isSlideshow || selectedImageIndex === null || filteredImages.length === 0) return;

    const timer = setInterval(() => {
      setSelectedImageIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % filteredImages.length;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isSlideshow, selectedImageIndex, filteredImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') {
        playSound('click');
        setSelectedImageIndex((prev) => ((prev ?? 0) + 1) % filteredImages.length);
      } else if (e.key === 'ArrowLeft') {
        playSound('click');
        setSelectedImageIndex((prev) => ((prev ?? 0) - 1 + filteredImages.length) % filteredImages.length);
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
        setIsSlideshow(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, filteredImages.length, playSound]);

  const handleOpenLightbox = (idx: number) => {
    playSound('open');
    setSelectedImageIndex(idx);
    setZoomLevel(1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredImages.length);
      setZoomLevel(1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredImages.length) % filteredImages.length);
      setZoomLevel(1);
    }
  };

  return (
    <div className="space-y-4 text-[#111827]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-300 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#000080]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Memories.bmp — Photographic Archives
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              {filteredImages.length} Photographs Indexed
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          <button
            type="button"
            onClick={() => { playSound('click'); setSelectedCat('all'); }}
            className={`px-2.5 py-0.5 rounded-2xs font-medium cursor-pointer shrink-0 ${
              selectedCat === 'all'
                ? 'bg-[#000080] text-white font-bold'
                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            All Photos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { playSound('click'); setSelectedCat(c.id); }}
              className={`px-2.5 py-0.5 rounded-2xs font-medium cursor-pointer shrink-0 ${
                selectedCat === c.id
                  ? 'bg-[#000080] text-white font-bold'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredImages.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => handleOpenLightbox(idx)}
            className="p-2 bg-[#f9fafb] retro-box-outset hover:bg-[#edf2f7] cursor-pointer group space-y-2 transition-all flex flex-col justify-between"
          >
            <div className="h-40 bg-gray-200 retro-box-inset overflow-hidden relative">
              {img.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.image_url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-bold text-xs text-[#000080] truncate">{img.title}</h3>
              {img.caption && <p className="text-[11px] text-gray-600 line-clamp-1">{img.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImage && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="retro-box-outset bg-[#c0c0c0] max-w-3xl w-full p-1 shadow-2xl flex flex-col max-h-[92vh]">
            {/* Titlebar */}
            <div className="retro-titlebar px-2 py-1 flex items-center justify-between font-bold text-xs">
              <span className="truncate">
                {activeImage.title} ({selectedImageIndex + 1} of {filteredImages.length})
              </span>
              <div className="flex items-center gap-1">
                {/* Slideshow Button */}
                <button
                  type="button"
                  onClick={() => setIsSlideshow(!isSlideshow)}
                  className={`retro-btn px-1.5 py-0.2 text-[10px] flex items-center gap-0.5 ${
                    isSlideshow ? 'retro-btn-pressed text-blue-800 font-bold' : 'text-gray-800'
                  }`}
                  title={isSlideshow ? 'Pause Slideshow' : 'Play Auto Slideshow'}
                >
                  {isSlideshow ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isSlideshow ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(null);
                    setIsSlideshow(false);
                  }}
                  className="retro-window-btn cursor-pointer"
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Photo Viewing Area */}
            <div className="retro-box-inset bg-black p-2 m-1 flex items-center justify-center relative min-h-[360px] max-h-[65vh] overflow-hidden">
              {/* Prev / Next Buttons */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 retro-btn p-1.5 z-10 opacity-75 hover:opacity-100 cursor-pointer"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900" />
              </button>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.image_url}
                alt={activeImage.title}
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                className="max-h-[60vh] max-w-full object-contain select-none"
              />

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 retro-btn p-1.5 z-10 opacity-75 hover:opacity-100 cursor-pointer"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5 text-gray-900" />
              </button>
            </div>

            {/* Bottom Caption & Zoom Bar */}
            <div className="px-3 py-2 text-xs text-black font-sans bg-[#dfdfdf] flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[#000080] truncate">{activeImage.title}</div>
                {activeImage.caption && <p className="text-[11px] text-gray-700 truncate">{activeImage.caption}</p>}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.25))}
                  className="retro-btn px-1.5 py-0.5 text-[10px]"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="retro-btn px-1.5 py-0.5 text-[10px]"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {activeImage.image_url && (
                  <a
                    href={activeImage.image_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="retro-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-bold text-[#000080] ml-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
