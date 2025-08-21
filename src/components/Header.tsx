// File: src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { appName, appDescription, appUrl } from '@/lib/env';

export default function Header() {
  const [shrink, setShrink] = useState(typeof window !== 'undefined' ? window.scrollY > 40 : false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShrink(prev => {
        if (!prev && y > 40) return true; // co lại khi vượt 40px
        if (prev && y < 20) return false; // giãn ra khi <20px
        return prev; // không đổi → không re-render
      });
    };

    handleScroll(); // đồng bộ ngay lần đầu
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header-wrapper ${shrink ? 'shrink' : ''}`}>
      <a href={`//${appUrl}`}>
        <h1 className="font-ttp app-title">{appName}</h1>
      </a>
      {/* Luôn render description, CSS lo việc ẩn/hiện */}
      <p className="app-description">{appDescription}</p>
    </header>
  );
}
