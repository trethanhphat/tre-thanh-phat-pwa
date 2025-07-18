// ✅ File: app/page.tsx

'use client';

import styles from '@/components/Home.module.scss';
import { appName, appDescription, appUrl, phone, email, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      <header className="text-center mb-6"></header>

      <section className="space-y-4">
        <button className={styles.buttonPrimary}>📥 Nhập dữ liệu mới</button>
        <a
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-xl no-underline mr-4"
          href="https://lookerstudio.google.com/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew"
        >
          <button className={styles.buttonSecondary}>📋 Xem báo cáo cây trồng</button>
        </a>
        <button className={styles.buttonWarning}>📷 Gửi ảnh thực địa</button>
      </section>

      <footer className={styles.footer}>
        <p>
          Điện thoại: <a href={`tel:${phone}`}>{phone}</a>
        </p>
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p className="mt-1">{copyright}</p>
      </footer>
    </main>
  );
}
