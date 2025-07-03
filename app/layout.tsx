// app/layout.tsx
'use client';

import '@/styles/globals.css';
import '@/fonts/font-ttp.css';
import { appName, appDescription } from '@/lib/env';
import UpdateNotifier from '@/components/UpdateNotifier';
import BottomMenu from '@/components/BottomMenu';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import { useEffect } from 'react';

export const viewport = {
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: appName,
  description: `${appDescription}`,
  icons: {
    icon: '/assets/icon/icon-192.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => {
          console.log('[PWA] ✅ Service Worker is active:', reg.active?.scriptURL);
        })
        .catch(err => {
          console.error('[PWA] ❌ Service Worker not ready:', err);
        });
    } else {
      console.warn('[PWA] ⚠️ Service Worker not supported in this browser.');
    }
  }, []);

  return (
    <html lang="vi">
      <body>
        <Header />
        <main style={{ padding: '1rem' }}>{children}</main>
        <BottomMenu />
        <UpdateNotifier />
      </body>
    </html>
  );
}
