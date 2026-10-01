'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Image as ImageIcon, ChevronLeft, ChevronRight, X,
  Maximize2, Play, Pause, Download, ExternalLink
} from 'lucide-react';
import { GalleryCategory, GalleryImage } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';

interface MobileGalleryViewProps {
  categories: GalleryCategory[];
  images: GalleryImage[];
}

const ITEMS_PER_PAGE = 6;

export default function MobileGalleryView({ categories = [], images = [] }: MobileGalleryViewProps) {
  const { playSound } = useSystemStore();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isSlideshow, setIsSlideshow] = useState(false);

  const filteredImages = useMemo(() => {
    let list = images;
    if (selectedCatId !== 'all') {
      list = list.filter((img) => img.category_id === selectedCatId);
    }
    return list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [images, selectedCatId]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / ITEMS_PER_PAGE));
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

  const activeImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  // Slideshow timer
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

  const handleOpenLightbox = (image: GalleryImage) => {
    playSound('open');
    const idx = filteredImages.findIndex((img) => img.id === image.id);
    setSelectedImageIndex(idx !== -1 ? idx : 0);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playSound('click');
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playSound('click');
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const handlePageChange = (page: number) => {
    playSound('click');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-6 flex flex-col min-h-full flex-1">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setSelectedCatId('all');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
            selectedCatId === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({images.length})
        </button>
        {categories.map((cat) => {
          const count = images.filter((img) => img.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedCatId(cat.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border ${
                selectedCatId === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Photo Stream */}
      <div className="grid grid-cols-2 gap-2.5">
        {paginatedImages.map((image) => (
          <div
            key={image.id}
            onClick={() => handleOpenLightbox(image)}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-full h-32 bg-slate-100 overflow-hidden relative">
              <img
                src={image.image_url}
                alt={image.title || 'Photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2.5">
              <h4 className="text-xs font-bold text-slate-900 truncate">{image.title || 'Untitled'}</h4>
              {image.caption && (
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{image.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal with Next/Prev and Slideshow */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 animate-in fade-in duration-150 select-none"
          onClick={() => {
            setSelectedImageIndex(null);
            setIsSlideshow(false);
          }}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white py-1 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 pr-3">
              <span className="text-xs font-bold block truncate">{activeImage.title || 'Photo'}</span>
              <span className="text-[10px] font-mono text-slate-400">
                {selectedImageIndex! + 1} of {filteredImages.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsSlideshow(!isSlideshow)}
                className={`p-2 rounded-xl text-xs flex items-center gap-1 border transition-colors ${
                  isSlideshow
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
                title="Play / Pause Slideshow"
              >
                {isSlideshow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <a
                href={activeImage.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
                title="Open original"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  playSound('close');
                  setSelectedImageIndex(null);
                  setIsSlideshow(false);
                }}
                className="p-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image & Prev/Next Nav */}
          <div
            className="relative flex-1 flex items-center justify-center p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.image_url}
              alt={activeImage.title || 'Photo'}
              className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white border border-white/20 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white border border-white/20 active:scale-95 transition-all cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
          {activeImage.caption && (
            <div
              className="text-center text-xs text-slate-300 font-medium pb-2 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {activeImage.caption}
            </div>
          )}
        </div>
      )}

      {/* Mobile Pagination */}
      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 bg-slate-100 disabled:opacity-40 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 flex items-center gap-1 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
