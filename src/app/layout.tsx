import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Source_Code_Pro } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

export const viewport: Viewport = {
  themeColor: '#221448',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Java Studio Pro',
  description: 'A powerful offline Java IDE for Android, built with Next.js.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Java Studio Pro',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable}`} suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Java Studio Pro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Java Studio Pro" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#221448" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.jpg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/icons/icon-96x96.jpg" />
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/icons/icon-72x72.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/icon-512x512.jpg" color="#221448" />
        <link rel="shortcut icon" href="/favicon.jpg" />
      </head>
      <body className="font-body antialiased bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
