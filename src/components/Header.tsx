// src/components/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shrink, setShrink] = useState(false);
  const router = useRouter();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setShrink(true); // cuộn xuống thì thu nhỏ
      } else if (currentScrollY < lastScrollY.current - 50) {
        setShrink(false); // cuộn lên rõ rệt mới mở rộng lại
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Header cố định */}
      <header className={`header-wrapper ${shrink ? 'shrink' : ''}`}>
        <h1 className="font-ttp app-title">{appName}</h1>
        {!shrink && <p className="app-description">{appDescription}</p>}
      </header>
    </>
  );
}
