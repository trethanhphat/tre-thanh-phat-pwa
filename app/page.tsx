// ✅ File: app/page.tsx

'use client';

import styles from '@/components/Home.module.scss';
import { appName, appDescription, appUrl, phone, email, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="main">
      <div>
        <h1 className="font-ttp">{appName}</h1>
        <p>{appDescription}</p>
      </div>
      {/* Các chức năng chính */}
      <section className="space-y-4">
        <a className="button" href="/survey">
          📥 Nhập dữ liệu mới
        </a>
        <a className="button" href="/report">
          📋 Xem báo cáo cây trồng
        </a>
        <a className="button" href="/photos/upload">
          📷 Gửi ảnh thực địa
        </a>
      </section>
    </main>
  );
}
