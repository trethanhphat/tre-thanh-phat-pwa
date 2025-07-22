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
          <span className="nav-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 6 14.5 6 9.5C6 6.462 8.462 4 11.5 4C14.538 4 17 6.462 17 9.5C17 14.5 12 21 12 21Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="11.5" cy="9.5" r="1.5" stroke="currentColor" stroke-width="2" />
            </svg>
          </span>
          Chỉ đường bằng Google
        </a>
      </section>
    </main>
  );
}
