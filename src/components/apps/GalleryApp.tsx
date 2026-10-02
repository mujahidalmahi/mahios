'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, X, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Play, Pause,
  Download, Eye, Sparkles
} from 'lucide-react';
import { GalleryImage, GalleryCategory } from '@/types/database';
import { useSystemStore } from '@/stores/systemStore';
import RetroPagination from '@/components/shared/RetroPagination';

interface GalleryAppProps {
  categories: GalleryCategory[];
  images: GalleryImage[];
}

const ITEMS_PER_PAGE = 6;

export default function GalleryApp({ categories, images }: GalleryAppProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { playSound } = useSystemStore();

  const filteredImages = selectedCat === 'all'
    ? images
    : images.filter((img) => img.category_id === selectedCat);

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE) || 1;
  const paginatedImages = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredImages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredImages, currentPage]);

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
    <div className="flex flex-col min-h-full flex-1 space-y-4 text-[#111827]">
      <div className="space-y-4 flex-1">
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
            onClick={() => {
              playSound('click');
              setSelectedCat('all');
              setCurrentPage(1);
            }}
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
              onClick={() => {
                playSound('click');
                setSelectedCat(c.id);
                setCurrentPage(1);
              }}
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

      {/* Images Grid (6 Photos Per Page) - Left Side 1:1 Square Photo, Right Side Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paginatedImages.map((img, idx) => {
          const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx;
          const categoryName = categories.find((c) => c.id === img.category_id)?.name;
          return (
            <div
              key={img.id}
              onClick={() => handleOpenLightbox(globalIdx)}
              className="p-2 sm:p-2.5 bg-[#f9fafb] retro-box-outset hover:bg-[#edf2f7] cursor-pointer group flex flex-col justify-between transition-all min-w-0"
            >
              <div className="flex gap-2.5 sm:gap-3 items-start min-w-0">
                {/* Left Side: 1:1 Square Photo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square shrink-0 bg-gray-200 retro-box-inset overflow-hidden relative rounded-2xs">
                  {img.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.image_url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>

                {/* Right Side: Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-blue-700 font-bold uppercase truncate">
                      {categoryName || 'Archive'}
                    </span>
                    {img.taken_at && (
                      <span className="text-[9px] text-gray-500 font-mono shrink-0">
                        {new Date(img.taken_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-[#000080] line-clamp-1 group-hover:underline">
                    {img.title}
                  </h3>
                  {img.caption && (
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight">
                      {img.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Tags / Meta Bar */}
              {img.tags && img.tags.length > 0 && (
                <div className="pt-1.5 mt-2 border-t border-gray-300 flex flex-wrap items-center gap-1 text-[9px] font-mono text-gray-500">
                  {img.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.2 bg-black/5 border border-gray-300 rounded-2xs">
                      #{tag}
                    </span>
                  ))}
                  {img.tags.length > 3 && (
                    <span className="text-gray-400">+{img.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>

      {/* Retro Win95 Pagination Bar (docked below the app) */}
      <div className="mt-auto pt-4 shrink-0">
        <RetroPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredImages.length}
          itemsPerPage={ITEMS_PER_PAGE}
          itemName="Photos"
        />
      </div>

      {/* Lightbox Modal: 1:1 Square Photo with Details on Right */}
      {activeImage && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4">
          <div className="retro-box-outset bg-[#c0c0c0] max-w-2xl w-full p-1 shadow-2xl flex flex-col max-h-[88vh]">
            {/* Titlebar */}
            <div className="retro-titlebar px-2 py-1 flex items-center justify-between font-bold text-xs shrink-0">
              <span className="truncate mr-2">
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
                  className="retro-window-btn cursor-pointer shrink-0"
                  title="Close"
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Modal Body: Left Side 1:1 Square Photo, Right Side Details */}
            <div className="retro-box-inset bg-white p-3 sm:p-4 m-1 flex-1 overflow-y-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                {/* Left Side: 1:1 Square Photo with Prev / Next */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 aspect-square shrink-0 bg-black retro-box-inset overflow-hidden flex items-center justify-center mx-auto sm:mx-0 rounded-2xs">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 retro-btn p-1 z-10 opacity-75 hover:opacity-100 cursor-pointer"
                    title="Previous Photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-900" />
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage.image_url}
                    alt={activeImage.title}
                    style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                    className="w-full h-full object-cover select-none"
                  />

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 retro-btn p-1 z-10 opacity-75 hover:opacity-100 cursor-pointer"
                    title="Next Photo (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-900" />
                  </button>
                </div>

                {/* Right Side: Details & Controls */}
                <div className="flex-1 min-w-0 space-y-2 w-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono uppercase text-blue-700 font-bold">
                        {categories.find((c) => c.id === activeImage.category_id)?.name || 'Archive Image'}
                      </span>
                      {activeImage.taken_at && (
                        <span className="text-[10px] font-mono text-gray-500">
                          {new Date(activeImage.taken_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-[#000080] break-words mt-1">
                      {activeImage.title}
                    </h2>

                    {activeImage.caption && (
                      <p className="text-gray-700 text-xs break-words leading-relaxed mt-1.5">
                        {activeImage.caption}
                      </p>
                    )}

                    {activeImage.tags && activeImage.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {activeImage.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded-2xs text-[10px] font-mono text-gray-700">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Zoom Controls & Download Toolbar */}
                  <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
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
                    </div>

                    {activeImage.image_url && (
                      <a
                        href={activeImage.image_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="retro-btn px-2 py-0.5 text-[10px] flex items-center gap-1 font-bold text-[#000080]"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
