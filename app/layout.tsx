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
import BackgroundSync from '@/components/BackgroundSync'; // import client component
import BackgroundPrefetch from '@/components/BackgroundPrefetch';
import ResponsiveTableLabels from '@/components/ResponsiveTableLabels';

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
        <Header />
        <main style={{ padding: '1rem' }}>{children}</main>
        <Footer />
        <BottomMenu />
        <UpdateNotifier />
        <ServiceWorkerRegister /> {/* ✅ Đăng ký Service Worker */}
        <ServiceWorkerCheck /> {/* ✅ Theo dõi Service Worker */}
        <BackgroundSync />{' '}
        {/* client component chạy useEffect để đồng bộ dữ liệu trong nền -- Cần cải tiến*/}
        <BackgroundPrefetch />{' '}
        {/* client component chạy useEffect để tải dữ liệu lần đầu khi mở hoặc cài app*/}
        <ResponsiveTableLabels /> {/* ✅ Tự động thêm data-label cho bảng */}
      </body>
    </html>
  );
}
