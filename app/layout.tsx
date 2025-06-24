// app/layout.tsx
import '@/css/globals.css';
import '@/fonts/font-ttp.css';
import Head from 'next/head';
import Image from 'next/image';
import { appName, appDescription, phone, email, copyright } from '@/lib/env';
import { ServiceWorkerUpdateNotice } from '@/components/system/ServiceWorkerUpdateNotice';

export const metadata = {
  title: appName,
  description: `${appName} - Website chính thức`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <title>{appName}</title>
        <meta
          name="description"
          content="Giới thiệu doanh nghiệp Tre Thanh Phát - Hệ sinh thái ngành tre"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/icon/icon-192.png" type="image/png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <main style={{ padding: '1rem' }}>{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <ServiceWorkerUpdateNotice />
      </body>
    </html>
  );
}
// Change to app
