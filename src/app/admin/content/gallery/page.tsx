'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Plus, Edit2, Trash2, Save, X,
  CheckCircle2, AlertCircle, Layers, Eye,
  ArrowUp, ArrowDown, Sparkles
} from 'lucide-react';
import MediaUploader from '@/components/admin/MediaUploader';
import { fallbackBiographyData } from '@/lib/data/initialData';
import { createClient } from '@/lib/supabase/client';
import { adminMutate } from '@/lib/api/adminMutate';
import { SkeletonListPage } from '@/components/admin/SkeletonLoader';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/admin/EmptyState';
import { GalleryImage, GalleryCategory } from '@/types/database';

export default function GalleryAdminPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>(fallbackBiographyData.galleryCategories);
  const [images, setImages] = useState<GalleryImage[]>(fallbackBiographyData.galleryImages);
  const [loading, setLoading] = useState(true);

  // Tabs: Photos vs Categories
  const [activeTab, setActiveTab] = useState<'photos' | 'categories'>('photos');

  // Photo modal
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isNewImage, setIsNewImage] = useState(false);

  // Category modal
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Preview modal
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: catData } = await supabase.from('gallery_categories').select('*').order('sort_order', { ascending: true });
        const { data: imgData } = await supabase.from('gallery_images').select('*').order('sort_order', { ascending: true });

        if (catData && catData.length > 0) setCategories(catData);
        if (imgData && imgData.length > 0) setImages(imgData);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- PHOTO HANDLERS ---
  const openNewImage = () => {
    setIsNewImage(true);
    setEditingImage({
      id: `img-${Date.now()}`,
      title: '',
      caption: '',
      image_url: '',
      category_id: categories[0]?.id || 'cat-1',
      tags: ['Creative', 'Design'],
      sort_order: images.length + 1,
    });
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'image' | 'category'; title?: string } | null>(null);

  const openEditImage = (img: GalleryImage) => {
    setIsNewImage(false);
    setEditingImage({ ...img });
  };

  const performDeleteImage = async (id: string) => {
    try {
      await adminMutate<GalleryImage>({
        table: 'gallery_images',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setImages((prev) => prev.filter((i) => i.id !== id));
    setFeedback({ type: 'success', text: 'Photo deleted successfully.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;
    setSaving(true);

    if (isNewImage) {
      setImages((prev) => [...prev, editingImage]);
    } else {
      setImages((prev) => prev.map((i) => (i.id === editingImage.id ? editingImage : i)));
    }

    try {
      await adminMutate<GalleryImage>({
        table: 'gallery_images',
        action: 'upsert',
        data: editingImage,
      });
    } catch {
      // Local fallback
    }

    setEditingImage(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Photo "${editingImage.title}" saved successfully!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- CATEGORY HANDLERS ---
  const openNewCategory = () => {
    setIsNewCategory(true);
    setEditingCategory({
      id: `gcat-${Date.now()}`,
      name: '',
      slug: '',
      sort_order: categories.length + 1,
    });
  };

  const openEditCategory = (cat: GalleryCategory) => {
    setIsNewCategory(false);
    setEditingCategory({ ...cat });
  };

  const performDeleteCategory = async (id: string) => {
    try {
      await adminMutate<GalleryCategory>({
        table: 'gallery_categories',
        action: 'delete',
        match: { id },
      });
    } catch {
      // Local fallback
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setFeedback({ type: 'success', text: 'Album category removed.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);

    const autoSlug = editingCategory.slug || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = { ...editingCategory, slug: autoSlug };

    if (isNewCategory) {
      setCategories((prev) => [...prev, payload]);
    } else {
      setCategories((prev) => prev.map((c) => (c.id === payload.id ? payload : c)));
    }

    try {
      await adminMutate<GalleryCategory>({
        table: 'gallery_categories',
        action: 'upsert',
        data: payload,
      });
    } catch {
      // Local fallback
    }

    setEditingCategory(null);
    setSaving(false);
    setFeedback({ type: 'success', text: `Category "${payload.name}" saved!` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const newImgs = [...images];
    const temp = newImgs[index];
    newImgs[index] = newImgs[targetIdx];
    newImgs[targetIdx] = temp;

    const updated = newImgs.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    setImages(updated);

    try {
      updated.forEach(async (item) => {
        await adminMutate<GalleryImage>({
          table: 'gallery_images',
          action: 'update',
          match: { id: item.id },
          data: { sort_order: item.sort_order },
        });
      });
    } catch {
      // Local fallback
    }
  };

  const filteredImages = selectedCatFilter === 'all'
    ? images
    : images.filter((i) => i.category_id === selectedCatFilter);

  if (loading) return <SkeletonListPage rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <span>Photo Archives & Albums Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Upload high-resolution photography, manage photo albums, captions, and interactive lightbox exhibitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'photos' ? (
            <button
              type="button"
              onClick={openNewImage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openNewCategory}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Album</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photographs ({images.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Albums & Categories ({categories.length})</span>
        </button>
      </div>

      {/* ==================== TAB 1: PHOTOS ==================== */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <button
              type="button"
              onClick={() => setSelectedCatFilter('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                selectedCatFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Albums
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCatFilter(c.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedCatFilter === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          {filteredImages.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="No photographs in this album"
              description="Upload your first photograph to populate this album."
              actionLabel="Upload Photo"
              onAction={openNewImage}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img, idx) => {
              const catName = categories.find((c) => c.id === img.category_id)?.name || 'Unassigned';
              return (
                <div
                  key={img.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group"
                >
                  <div>
                    <div
                      onClick={() => setPreviewImage(img)}
                      className="h-44 bg-slate-950 relative overflow-hidden cursor-pointer"
                    >
                      {img.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.image_url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md text-blue-300 text-[10px] font-mono rounded">
                        {catName}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-1">
                      <h3 className="text-xs font-bold text-white truncate">{img.title}</h3>
                      {img.caption && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">#{img.sort_order || idx + 1}</span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditImage(img)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer ml-1"
                        title="Edit Photo"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: img.id, type: 'image', title: img.title })}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: CATEGORIES ==================== */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const count = images.filter((i) => i.category_id === cat.id).length;
            return (
              <div
                key={cat.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {count} {count === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Slug: {cat.slug || cat.id}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-mono">Order: #{cat.sort_order || idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md cursor-pointer"
                      title="Edit Album"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: cat.id, type: 'category', title: cat.name })}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-md cursor-pointer"
                      title="Delete Album"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== PHOTO EDIT/UPLOAD MODAL ==================== */}
      {editingImage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span>{isNewImage ? 'Upload New Photograph' : `Edit: ${editingImage.title}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingImage(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Workspace & Mechanical Rig"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Media Uploader */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
                <label className="font-semibold text-slate-300 uppercase">Image File</label>
                <MediaUploader
                  value={editingImage.image_url}
                  onChange={(url) => setEditingImage({ ...editingImage, image_url: url })}
                  label="Upload Image"
                  folder="mahios/gallery"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Assigned Album / Category</label>
                <select
                  value={editingImage.category_id}
                  onChange={(e) => setEditingImage({ ...editingImage, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Caption / Story</label>
                <textarea
                  rows={3}
                  placeholder="Story or technical setup behind this capture..."
                  value={editingImage.caption || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Photograph'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CATEGORY MODAL ==================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isNewCategory ? 'Create New Album' : `Edit Album: ${editingCategory.name}`}</span>
              </h2>
              <button type="button" onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Album Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workspace Rigs, Hackathons, Tech Conferences"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 uppercase">Sort Order Rank</label>
                <input
                  type="number"
                  required
                  value={editingCategory.sort_order}
                  onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Album'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== LIVE LIGHTBOX PREVIEW ==================== */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white truncate">{previewImage.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-80 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.image_url}
                alt={previewImage.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {previewImage.caption && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {previewImage.caption}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === 'image' ? 'Photograph' : 'Album Category'}?`}
        message={
          deleteTarget?.type === 'image'
            ? `Delete "${deleteTarget.title || 'this photograph'}" permanently? This action cannot be undone.`
            : `Delete "${deleteTarget?.title || 'this album'}" category? Photos in this album will remain in your database.`
        }
        confirmLabel="Delete Permanently"
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'image') {
              performDeleteImage(deleteTarget.id);
            } else {
              performDeleteCategory(deleteTarget.id);
            }
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}



