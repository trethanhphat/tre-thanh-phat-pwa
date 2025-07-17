// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shrink, setShrink] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setShrink(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Header cố định */}
      <header className={`header-wrapper ${shrink ? 'shrink' : ''}`}>
        <a href={`//${appUrl}`}>
          <h1 className="font-ttp app-title">{appName}</h1>
        </a>
        {!shrink && <p className="app-description">{appDescription}</p>}
      </header>
    </>
  );
}
