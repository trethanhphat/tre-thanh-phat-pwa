import '@/css/globals.css';
import '@/fonts/font-ttp.css';
import { appName } from '@/lib/env';
import { ServiceWorkerUpdateNotice } from '@/components/system/ServiceWorkerUpdateNotice';
import Header from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: appName,
  description: `${appName} - Website chính thức`,
  themeColor: '#ffffff',
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
        <ServiceWorkerUpdateNotice />
      </body>
    </html>
  );
}
