
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Java Studio Pro',
    short_name: 'Java Studio',
    description: 'A powerful offline Java IDE for Android, built with Next.js.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f7',
    theme_color: '#221448',
    icons: [
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
