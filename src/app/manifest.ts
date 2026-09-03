import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MahiOS 05 — Mujahid Al Mahi Biography & Operating System',
    short_name: 'MahiOS',
    description: 'An interactive vintage operating system showcasing the full-stack engineering portfolio, projects, skills, and biography of Mujahid Al Mahi.',
    start_url: '/',
    display: 'standalone',
    background_color: '#008080',
    theme_color: '#000080',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
