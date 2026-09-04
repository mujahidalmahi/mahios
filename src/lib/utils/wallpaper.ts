import React from 'react';

/**
 * Returns CSS properties for the desktop canvas background.
 * Supports both solid color hex strings (e.g. #008080) and image URLs (e.g. https://... or /...).
 */
export function getWallpaperStyle(bgValue?: string): React.CSSProperties {
  if (!bgValue || !bgValue.trim()) {
    return { backgroundColor: '#008080' };
  }

  const clean = bgValue.trim();

  const isImage =
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('/') ||
    clean.startsWith('data:image') ||
    clean.startsWith('blob:') ||
    clean.includes('url(');

  if (isImage) {
    const formattedUrl = clean.includes('url(') ? clean : `url("${clean}")`;
    return {
      backgroundImage: formattedUrl,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#008080',
    };
  }

  return {
    backgroundColor: clean,
  };
}

export function isImageWallpaper(bgValue?: string): boolean {
  if (!bgValue) return false;
  const clean = bgValue.trim();
  return (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('/') ||
    clean.startsWith('data:image') ||
    clean.startsWith('blob:') ||
    clean.includes('url(')
  );
}
