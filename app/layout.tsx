// ✅ File: app/layout.tsx
import '@/styles/globals.scss';
import { appName, appDescription } from '@/lib/env';
import UpdateNotifier from '@/components/UpdateNotifier';
import BottomMenu from '@/components/BottomMenu';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import ServiceWorkerCheck from '@/components/ServiceWorkerCheck';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { useEffect } from 'react';
import { backgroundSync } from '@/utils/backgroundSync';
import { getSyncOverMobile } from '@/utils/settings';

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
    const checkAndSync = async () => {
      const lastSync = localStorage.getItem('lastSync');
      const now = Date.now();

      // Chỉ chạy 1 lần/ngày
      if (!lastSync || now - parseInt(lastSync) > 24 * 60 * 60 * 1000) {
        await backgroundSync();
        localStorage.setItem('lastSync', now.toString());
      }
    };

    // Kiểm tra điều kiện mạng
    const allowMobile = getSyncOverMobile();
    if (navigator.onLine) {
      const connection = (navigator as any).connection;
      if (allowMobile || connection?.type === 'wifi') {
        checkAndSync();
      }
    }
  }, []);

  return (
    <html lang="vi">
      <body>
        <Header />
        <main style={{ padding: '1rem' }}>{children}</main>
        <Footer />
        <BottomMenu />
        <UpdateNotifier />
        <ServiceWorkerRegister /> {/* ✅ Đăng ký Service Worker */}
        <ServiceWorkerCheck /> {/* ✅ Theo dõi Service Worker */}
      </body>
    </html>
  );
}
