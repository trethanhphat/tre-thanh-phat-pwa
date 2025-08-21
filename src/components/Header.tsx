// File: src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { appName, appDescription, appUrl } from '@/lib/env';

export default function Header() {
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShrink(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header-wrapper ${shrink ? 'shrink' : ''}`}>
      <a href={`//${appUrl}`}>
        <h1 className="app-title">{appName}</h1>
      </a>
      <p className="app-description">{appDescription}</p>
    </header>
  );
}
