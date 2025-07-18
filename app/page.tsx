// ✅ File: app/page.tsx

'use client';

import styles from '@/components/Home.module.scss';
import { appName, appDescription, appUrl, phone, email, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="main">
      <section className="space-y-4">
        <button className={styles.buttonPrimary}>📥 Nhập dữ liệu mới</button>
        <a
          className="button"
          href="https://lookerstudio.google.com/reporting/470c0a0d-60ed-4191-bacb-46f02752fd88/page/kz9JF?s=kRSik9CXYew"
        >
          📋 Xem báo cáo cây trồng
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
