'use client';

import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
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
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

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
          className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
            selectedCatId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All ({images.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              playSound('click');
              setSelectedCatId(cat.id);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
              selectedCatId === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Photo Stream */}
      <div className="grid grid-cols-2 gap-2.5">
        {paginatedImages.map((image) => (
          <div
            key={image.id}
            onClick={() => {
              playSound('open');
              setLightboxImage(image);
            }}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-full h-32 bg-slate-100 overflow-hidden relative">
              <img
                src={image.image_url}
                alt={image.title || 'Photo'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2">
              <h4 className="text-xs font-bold text-slate-900 truncate">{image.title || 'Untitled'}</h4>
              {image.caption && (
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{image.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 animate-fadeIn">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-bold truncate pr-4">{lightboxImage.title}</span>
            <button
              type="button"
              onClick={() => {
                playSound('close');
                setLightboxImage(null);
              }}
              className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <img
              src={lightboxImage.image_url}
              alt={lightboxImage.title || 'Photo'}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {lightboxImage.caption && (
            <div className="text-center text-xs text-slate-300 font-medium pb-2">
              {lightboxImage.caption}
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
