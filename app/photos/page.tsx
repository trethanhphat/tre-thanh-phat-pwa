// File: app/photos/page.tsx
'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'; // Module Update
import type { AppProps } from 'next/app'; // Module Update

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Các chức năng chính */}
      <section className="space-y-4">
        <h2>Hình ảnh lá tre mai</h2>
        <a className="button" href="https://photos.app.goo.gl/cTqmqTsygoo9oCjj8">
          📷 Hình ảnh lá tre mai
        </a>
      </section>

      {/* Thông tin footer */}

      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}
