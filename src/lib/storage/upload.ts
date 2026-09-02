import { v2 as cloudinary } from 'cloudinary';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// Configure Cloudinary
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  provider: 'cloudinary' | 'supabase' | 'base64';
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
}

export async function uploadMedia(fileBuffer: Buffer, fileName: string, mimeType: string, folder = 'mahios'): Promise<UploadResult> {
  const hasCloudinary = 
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.includes('placeholder');

  // 1. Try Cloudinary first
  if (hasCloudinary) {
    try {
      const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'auto',
        overwrite: true,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      return {
        url: result.secure_url,
        provider: 'cloudinary',
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch (cloudinaryErr) {
      console.warn('Cloudinary upload error, attempting Supabase Storage fallback:', cloudinaryErr);
    }
  }

  // 2. Fallback to Supabase Storage
  try {
    const supabase = createAdminSupabaseClient();
    const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (!uploadError) {
      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      return {
        url: data.publicUrl,
        provider: 'supabase',
      };
    }
  } catch (supabaseErr) {
    console.warn('Supabase storage fallback error:', supabaseErr);
  }

  // 3. Fallback to inline Base64 data URL for small assets / local testing
  const base64 = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  return {
    url: base64,
    provider: 'base64',
  };
}
