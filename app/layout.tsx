// app/layout.tsx

import '@/styles/globals.css';
import '@/fonts/font-ttp.css';
import { appName, appDescription } from '@/lib/env';
import UpdateNotifier from '@/components/UpdateNotifier'; // Check Update
import Header from '@/components/Header';
import type { Metadata } from 'next';

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
  return (
    <html lang="vi">
      <body>
        <Header /> {/* 🟢 Thêm dòng này */}
        <main style={{ padding: '1rem' }}>{children}</main>
        <UpdateNotifier />
      </body>
    </html>
  );
}
