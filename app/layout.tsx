/*
 ****************************************************************************************************
 * File: app/layout.tsx
 * Module: Root Layout của Ứng dụng với PWA và Thành phần UI Chung
 * Description:
 *  Root Layout của ứng dụng với các thành phần UI chung và cấu hình PWA
 *
 * Features:
 * - Header, Footer, BottomMenu
 * - Service Worker registration and monitoring
 * - BackgroundSync and BackgroundPrefetch for offline and background data handling
 * - ResponsiveTableLabels for better mobile table display
 *
 * Metadata:
 * - Title, description, icons, manifest
 * - Viewport configuration
 *
 * Dependencies:
 * - Various client components for PWA features and UI elements
 *
 * Usage:
 * - This layout is applied to all pages in the app directory
 *
 ****************************************************************************************************
 * Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * Author: Nguyễn Như Đường (TPB Corp)
 * Contact:
 * Email:
 * Created: 2025-11-13
 * Last Updated: 2025-11-13
 * Maintainer: DevOps Team @ TPB Corp
 *
 ****************************************************************************************************
 * Version: 1.0.0
 * Change Log:
 * - 1.0.0 (2025-11-13): Tạo file ban đầu.
 *
 ****************************************************************************************************
 * License: © 2025 TPB Corp. All rights reserved.
 * Confidentiality: Internal Use Only.
 * compliant with TPB Corp's proprietary software policies.
 * Standard Disclaimer:
 * This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages,
 * or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software
 *
 ****************************************************************************************************
 * References:
 * - Next.js Documentation: https://nextjs.org/docs
 * - PWA Guide: https://web.dev/progressive-web-apps/
 * - TPB Corp Internal Wiki: https://tpbc.top/wiki/pwa-implementation
 *
 ****************************************************************************************************
 * Special Notes:
 * - This layout is intended for internal use within TPB Corp applications only.
 * - Unauthorized distribution or modification is prohibited.
 * Standard Disclaimer:
 * This software is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages,
 * or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
 ****************************************************************************************************
 */
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#054219' },
    { media: '(prefers-color-scheme: dark)', color: '#0a8030' },
  ],
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
