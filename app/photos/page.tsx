// File: app/photos/page.tsx
'use client';

import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate'; // Module Update
import type { AppProps } from 'next/app'; // Module Update
import Link from 'next/link';
import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

const photos = [
  {
    icon: '📷',
    name: 'Hình ảnh lá tre mai thái',
    href: 'https://photos.app.goo.gl/cTqmqTsygoo9oCjj8',
    description: 'Những hình ảnh để biết độ to của lá tre mai',
  },
]
export default function PhotosPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Các chức năng chính */}
      <section className="space-y-4">
        <h2>Hình ảnh lá tre mai</h2>
        {photos.map((photo) => (
          <div key={photo.href} className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                            <span className="text-2xl">{photo.icon}</span>
                        </div>
          <Link
            key={photo.href}
            href={photo.href}
            className="button"
            //alt={photo.description}
            >
              {photo.name}
            </Link>
          </div>
        ))}
      </section>

      {/* Thông tin footer */}

      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}
