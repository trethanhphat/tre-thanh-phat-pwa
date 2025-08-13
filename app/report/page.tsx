'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'; // Module Update
import type { AppProps } from 'next/app'; // Module Update

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold mb-4">
        Danh sách Báo cáo phát triển của <span className="font-ttp">{appName}</span>
      </h1>

      {/* Các chức năng chính */}

      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">
            Tăng trưởng diện tích hàng năm của <span className="font-ttp">{appName}</span>
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <a className="button" href="https://lookerstudio.google.com/s/pz8LKuZU1UQ">
              📋 Xem báo cáo
            </a>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">
            Tăng trưởng diện tích các tháng của <span className="font-ttp">{appName}</span>
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/ac7814ab-3528-4ff3-ab8e-284258c8a16e"
            >
              📋 Xem báo cáo
            </a>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">
            Tăng trưởng số cây trồng các năm của <span className="font-ttp">{appName}</span>
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/d46ab431-bd0a-4b7e-9dd3-d057377b26e2"
            >
              📋 Xem báo cáo
            </a>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">
            Tăng trưởng số cây trồng các tháng của <span className="font-ttp">{appName}</span>
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/4cd04786-8971-4c13-9b67-32d1849cbb27"
            >
              📋 Xem báo cáo
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">
            Số lượng cây đã trồng của từng vùng trồng của{' '}
            <span className="font-ttp">{appName}</span>
          </h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew"
            >
              📋 Xem báo cáo
            </a>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Tổng số cây và diện tích đã trồng</h2>
          <div className="aspect-w-16 aspect-h-9">
            <a
              className="button"
              href="https://lookerstudio.google.com/reporting/56850af2-7c18-4c89-b6e3-7290d72f9c89/page/QnqRF"
            >
              📋 Xem báo cáo
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
