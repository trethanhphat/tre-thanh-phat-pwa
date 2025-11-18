'use client';

import type { AppProps } from 'next/app';
import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}
      <header className="text-center mb-6"></header>

      {/* Các chức năng chính */}
      <section className="space-y-4">
        <a href="/survey" className="button">
          📥 Nhập dữ liệu mới
        </a>
        <a href="/report" className="button">
          📋 Xem báo cáo cây trồng
        </a>
        <a className="button" href="/photos">
          📷 Xem Album ảnh của Tre Thanh Phát
        </a>
      </section>
    </main>
  );
}
