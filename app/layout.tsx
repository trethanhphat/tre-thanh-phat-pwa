// ✅ File: app/layout.tsx
/**
 * Root Layout của ứng dụng sẽ được áp dụng cho toàn bộ các trang con
 * - Chứa Header, Footer, BottomMenu
 * - Đăng ký và kiểm tra Service Worker
 * - Chạy các component nền như BackgroundSync, BackgroundPrefetch
 * - Cấu hình metadata chung của app
 * BachgroundSync và BackgroundPrefetch là các client component
 * để sử dụng useEffect chạy đồng bộ và tải dữ liệu trong nền
 * khi app được mở hoặc cài đặt.
 * - ResponsiveTableLabels tự động thêm data-label cho bảng để hiển thị tốt trên di động.
 * BackgroundSync hiện chỉ là prototype và cần cải tiến thêm.
 * - Cấu hình viewport và metadata chung cho app.
 * - Sử dụng font và style toàn cục từ globals.scss
 * - Cấu trúc HTML cơ bản với thẻ <html> và <body>
 * - Sử dụng TypeScript và định nghĩa kiểu Metadata từ 'next'
 * - Cấu trúc component React với props children để hiển thị nội dung trang con
 * - Tất cả các thành phần UI như Header, Footer, BottomMenu đều được import và sử dụng trong layout.
 * - Cải thiện trải nghiệm người dùng khi sử dụng PWA với các tính năng offline-first và đồng bộ dữ liệu nền.
 * - Tối ưu hoá cho PWA với manifest và icon.
 * - Tối ưu hoá trải nghiệm người dùng trên di động với viewport và responsive design.
 * - Cải thiện khả năng bảo trì và mở rộng ứng dụng với cấu trúc rõ ràng và tách biệt các thành phần.
 * - Tăng cường trải nghiệm người dùng với thông báo cập nhật và kiểm tra Service Worker.
 * - Cải thiện hiệu suất và trải nghiệm người dùng với đồng bộ dữ liệu nền và tải trước dữ liệu.
 * - Đảm bảo tính nhất quán và đồng bộ dữ liệu với IndexedDB và Service Worker.
 * - Tối ưu hoá trải nghiệm người dùng trên di động với responsive table labels.
 * - Tăng cường trải nghiệm người dùng với các thành phần UI như Header, Footer và BottomMenu.
 * - Cải thiện khả năng sử dụng và trải nghiệm người dùng với cấu trúc rõ ràng và dễ hiểu.
 * - Tối ưu hoá hiệu suất và trải nghiệm người dùng với các kỹ thuật PWA tiên tiến.
 * - Đảm bảo tính nhất quán và đồng bộ dữ liệu với các kỹ thuật lưu trữ cục bộ và đồng bộ nền.
 * - Tăng cường trải nghiệm người dùng với các kỹ thuật tối ưu hoá giao diện và tương tác.
 * - Cải thiện khả năng bảo trì và mở rộng ứng dụng với cấu trúc rõ ràng và tách biệt các thành phần.
 * - Tối ưu hoá trải nghiệm người dùng với các kỹ thuật tối ưu hoá hiệu suất và tương tác.
 * - Đảm bảo tính nhất quán và đồng bộ dữ liệu với các kỹ thuật lưu trữ cục bộ và đồng bộ nền.
 * - Tăng cường trải nghiệm người dùng với các kỹ thuật tối ưu hoá giao diện và tương tác.
 * - Cải thiện khả năng bảo trì và mở rộng ứng dụng với cấu trúc rõ ràng và tách biệt các thành phần.
 * - Tối ưu hoá trải nghiệm người dùng với các kỹ thuật tối ưu hoá hiệu suất và tương tác.
 * - Đảm bảo tính nhất quán và đồng bộ dữ liệu với các kỹ thuật lưu trữ cục bộ và đồng bộ nền.
 * - Tăng cường trải nghiệm người dùng với các kỹ thuật tối ưu hoá giao diện và tương tác.
 * - Cải thiện khả năng bảo trì và mở rộng ứng dụng với cấu trúc rõ ràng và tách biệt các thành phần.
 * - Tối ưu hoá trải nghiệm người dùng với các kỹ thuật tối ưu hoá hiệu suất và tương tác.
 */

import React from 'react';
import '@/styles/globals.scss';
import { appName, appDescription } from '@/lib/env'; // import appName và appDescription từ biến môi trường để hiển thị trong metadata
import UpdateNotifier from '@/components/UpdateNotifier'; // import UpdateNotifier component để thông báo khi có bản cập nhật mới
import BottomMenu from '@/components/BottomMenu'; // import BottomMenu component
import Header from '@/components/Header'; // import Header component
import Footer from '@/components/Footer'; // import Footer component
import type { Metadata } from 'next'; // import kiểu Metadata từ 'next'
import ServiceWorkerCheck from '@/components/ServiceWorkerCheck'; // import client component ServiceWorkerCheck để theo dõi Service Worker
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'; // import client component ServiceWorkerRegister để đăng ký Service Worker
import NetworkStatusBar from '@/components/NetworkStatusBar'; // import client component NetworkStatusBar để hiển thị trạng thái mạng
// import BackgroundSync from '@/components/BackgroundSync'; // Tạm tắt import client component BackgroundSync để đồng bộ dữ liệu trong nền
import BackgroundPrefetch from '@/components/BackgroundPrefetch'; // import client component BackgroundPrefetch để tải dữ liệu lần đầu khi mở hoặc cài app
import ResponsiveTableLabels from '@/components/ResponsiveTableLabels'; // import client component ResponsiveTableLabels để tự động thêm data-label cho bảng

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
        <NetworkStatusBar /> {/* ✅ Hiển thị thanh trạng thái mạng */}
        <BottomMenu />
        <UpdateNotifier />
        <ServiceWorkerRegister /> {/* ✅ Đăng ký Service Worker */}
        <ServiceWorkerCheck /> {/* ✅ Theo dõi Service Worker */}
        {/* <BackgroundSync />{' '} */}{' '}
        {/* Tạm tắt client component chạy useEffect để đồng bộ dữ liệu trong nền */}
        {/* client component chạy useEffect để đồng bộ dữ liệu trong nền -- Cần cải tiến*/}
        <BackgroundPrefetch />{' '}
        {/* client component chạy useEffect để tải dữ liệu lần đầu khi mở hoặc cài app*/}
        <ResponsiveTableLabels /> {/* ✅ Tự động thêm data-label cho bảng */}
      </body>
    </html>
  );
}
