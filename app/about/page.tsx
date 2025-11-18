'use client';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}

      {/* Các chức năng chính */}
      <section className="space-y-4">
        <button className="btn-primary w-full py-4 text-lg bg-green-600 text-white rounded-2xl focus:outline-none">
          📥 Nhập dữ liệu mới
        </button>
        <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
          📋 Xem báo cáo cây trồng
        </button>
        <button className="btn-primary w-full py-4 text-lg bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-300">
          📷 Gửi ảnh thực địa
        </button>
      </section>

      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}
