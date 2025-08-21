// File: src/components/Header.tsx
'use client';

import { useEffect, useRef } from 'react';
import { appName, appDescription, appUrl } from '@/lib/env';

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    const desc = descRef.current;
    if (!el || !desc) return;

    // đo chiều cao thật của description và set vào CSS var
    const measureDesc = () => {
      const h = desc.scrollHeight; // chiều cao nội dung thật
      el.style.setProperty('--descH', `${h}px`);
    };

    // cập nhật style khi cuộn
    const update = () => {
      const y = window.scrollY;
      const T1 = 80,
        T2 = 80; // ngưỡng px
      const opacity = Math.max(0, 1 - y / T1);
      const padding = Math.max(0.25, 1 - ((y - T1) / T2) * 0.75);

      el.style.setProperty('--descOpacity', `${opacity}`);
      el.style.setProperty('--descMax', opacity > 0 ? `${desc.scrollHeight}px` : '0px');
      el.style.setProperty('--padTop', `${padding}rem`);
      el.style.setProperty('--titleSize', `${1.8 - Math.min(1.8 - 1.3, (y / (T1 + T2)) * 0.5)}rem`);
    };

    // chờ React render xong rồi đo
    setTimeout(() => {
      measureDesc();
      update();
    }, 0);

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measureDesc);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measureDesc);
    };
  }, []);

  return (
    <header ref={headerRef} className="header-wrapper">
      <a href={`//${appUrl}`}>
        <h1 className="font-ttp app-title">{appName}</h1>
      </a>
      <p ref={descRef} className="app-description">
        {appDescription}
      </p>
    </header>
  );
}
