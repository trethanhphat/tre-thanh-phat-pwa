'use client';

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="main">
      {/* Tiêu đề */}

      {/* Các chức năng chính */}
      <section className="s1">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4582.7873094861025!2d105.79272477596952!3d21.015715288225103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab32aad3a29d%3A0x79b00472bf5cf78!2zQ8O0bmcgdHkgQ1AgVHJlIFRoYW5oIFBow6F0IC0gVsSDbiBwaMOybmcgSMOgIE7hu5lp!5e1!3m2!1svi!2s!4v1753085116738!5m2!1svi!2s"
          width="600"
          height="450"
          style="border:0;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </main>
  );
}
