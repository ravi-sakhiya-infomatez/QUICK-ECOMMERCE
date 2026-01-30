import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import StoreProvider from '@/components/StoreProvider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quick Ecommerce | Modern Shop',
  description: 'Experience lightning-fast shopping with Quick Ecommerce. Built with Next.js, Redux, and cutting-edge web technologies.',
  keywords: ['ecommerce', 'shopping', 'nextjs', 'fast'],
  authors: [{ name: 'Antigravity' }],
  openGraph: {
    title: 'Quick Ecommerce - Shop Fast, Shop Better',
    description: 'The ultimate modern ecommerce experience.',
    type: 'website',
    url: 'https://quick-ecommerce.vercel.app',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=630&q=80',
        width: 1200,
        height: 630,
        alt: 'Quick Ecommerce Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Ecommerce',
    description: 'Modern shopping experience',
    images: ['https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=630&q=80'],
  },
};

import Toaster from '@/components/ui/Toaster';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
