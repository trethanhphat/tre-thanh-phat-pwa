'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'; // Module Update
import type { AppProps } from 'next/app'; // Module Update

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold mb-4">Danh sách Báo cáo phát triển Tre Thanh Phát</h1>

      {/* Các chức năng chính */}
      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Báo cáo Tổng hợp</h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/56850af2-7c18-4c89-b6e3-7290d72f9c89/page/QnqRF"
            >
              <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
                📋 Xem báo cáo cây trồng
              </button>
            </a>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Báo cáo Tổng hợp</h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/de31c339-19fa-4080-8def-8d124c043394/page/hDqRF"
            >
              <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
                📋 Xem báo cáo cây trồng
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Báo cáo Số cây trồng các tháng</h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/de31c339-19fa-4080-8def-8d124c043394/page/hDqRF"
            >
              <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
                📋 Xem báo cáo cây trồng
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Báo cáo theo vùng</h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew"
            >
              <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
                📋 Xem báo cáo cây trồng
              </button>
            </a>
          </div>
        </div>
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
