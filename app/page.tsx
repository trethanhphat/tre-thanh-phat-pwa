'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'; // Module Update
import type { AppProps } from 'next/app'; // Module Update

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}
      <header className="text-center mb-6"></header>
      {/* Các chức năng chính */}
      <section className="space-y-4">
        <section className="space-y-4">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
              Báo cáo phát triển vùng trồng Tre Thanh Phát
            </h1>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://lookerstudio.google.com/embed/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
        <button className="btn-primary w-full py-4 text-lg bg-green-600 text-white rounded-2xl focus:outline-none">
          📥 Nhập dữ liệu mới
        </button>
        <a href="https://lookerstudio.google.com/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew">
          <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
            📋 Xem báo cáo cây trồng
          </button>
        </a>
        <button className="btn-primary w-full py-4 text-lg bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-300">
          📷 Gửi ảnh thực địa
        </button>
      </section>

      {/* Thông tin footer */}
      <footer className="text-center text-sm text-gray-500 mt-10">
        <p>
          Điện thoại: <a href={`tel:${phone}`}>{phone}</a>
        </p>
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p className="mt-1">{copyright}</p>
        <p>Cập nhật lúc: 2506230816</p>
      </footer>
      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}
