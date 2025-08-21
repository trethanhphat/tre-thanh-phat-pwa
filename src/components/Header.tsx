// ✅ File: src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { appName, appDescription, appUrl } from '@/lib/env';

export default function Header() {
  // Khởi tạo shrink đúng ngay từ đầu theo vị trí scroll
  const [shrink, setShrink] = useState(typeof window !== 'undefined' ? window.scrollY > 30 : false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShrink(prev => {
        if (!prev && y > 40) return true; // chuyển sang shrink
        if (prev && y < 20) return false; // bỏ shrink
        return prev; // giữ nguyên
      });
    };

    // Gọi 1 lần để đồng bộ trạng thái khi vừa mount
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header-wrapper ${shrink ? 'shrink' : ''}`}>
      <a href={`//${appUrl}`}>
        <h1 className="font-ttp app-title">{appName}</h1>
      </a>
      {!shrink && <p className="app-description">{appDescription}</p>}
    </header>
  );
}
