-- =========================================================
-- MahiOS: Supabase Storage Bucket Setup
-- Author: Mujahid Al Mahi <mujahidmahi.official@gmail.com>
-- Run this in the Supabase SQL Editor to create all required storage buckets
-- =========================================================

-- =========================================================
-- 1. CREATE BUCKETS
-- =========================================================

-- Main media bucket (public) — used by the upload API as Cloudinary fallback
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- =========================================================
-- 2. ROW-LEVEL SECURITY POLICIES FOR storage.objects
-- =========================================================

-- Allow anyone to read/view public media files
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Allow authenticated users (admin) to upload
DROP POLICY IF EXISTS "Admin can upload media" ON storage.objects;
CREATE POLICY "Admin can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Allow authenticated users (admin) to update/replace files
DROP POLICY IF EXISTS "Admin can update media" ON storage.objects;
CREATE POLICY "Admin can update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media');

-- Allow authenticated users (admin) to delete files
DROP POLICY IF EXISTS "Admin can delete media" ON storage.objects;
CREATE POLICY "Admin can delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- =========================================================
-- DONE
-- The 'media' bucket is now created and visible under
-- Supabase → Storage in your dashboard.
-- File type and size limits are enforced at the app layer.
-- =========================================================
