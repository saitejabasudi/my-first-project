import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Source_Code_Pro } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

export const metadata: Metadata = {
  title: 'JavaDroid IDE',
  description: 'A powerful offline Java IDE for Android, built with Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable}`}>
      <body className="font-body antialiased bg-background">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
