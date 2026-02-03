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
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
