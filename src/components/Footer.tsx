// ✅ File: src/components/Footer.tsx
'use client';

import { appName, appUrl, phone, email, copyright } from '@/lib/env';

export default function Footer() {
  return (
    <footer className="footer">
      <a href={`//${appUrl}`}>
        <h3 className="font-ttp">{appName}</h3>
      </a>
      <p>
        Điện thoại: <a href={`tel:${phone}`}>{phone}</a>
      </p>
      <p>
        Email: <a href={`mailto:${email}`}>{email}</a>
      </p>
      <p className="mt-1">{copyright}</p>
    </footer>
  );
}
