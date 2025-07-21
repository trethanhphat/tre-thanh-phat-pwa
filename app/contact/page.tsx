// File app/contact/page.tsx

'use client';

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="main">
      {/* Tiêu đề */}

      {/* Các chức năng chính */}
      <section className="s1">
        <a className="button" href="https://maps.app.goo.gl/GVsUNUvFjvWFL6jG6">
          Chỉ đường bằng Google
        </a>
      </section>
    </main>
  );
}
