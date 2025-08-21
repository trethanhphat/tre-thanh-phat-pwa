// File: src/components/Header.tsx
'use client';

import { useEffect, useRef } from 'react';
import { appName, appDescription, appUrl } from '@/lib/env';

// clamp về [min, max]
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
// nội suy tuyến tính
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function Header() {
  const hdrRef = useRef<HTMLElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = hdrRef.current;
    const desc = descRef.current;
    if (!el) return;

    // ==== NGƯỠNG PX CHO 3 GIAI ĐOẠN ====
    const T1 = 80; // 0 -> T1: ẩn dần mô tả (opacity & max-height)
    const T2 = 80; // T1 -> T1+T2: co padding (nền)
    const T3 = 80; // T1+T2 -> T1+T2+T3: thu nhỏ cỡ chữ tiêu đề

    // ==== THÔNG SỐ ĐÍCH ====
    const PAD_START = 16; // px (padding-block lúc top)
    const PAD_END = 6; // px (padding-block khi đã co nền)
    const TITLE_START = 28.8; // px ~ 1.8rem (cỡ chữ tiêu đề lúc top)
    const TITLE_END = 20.8; // px ~ 1.3rem (khi đã nhỏ)

    // đo chiều cao thực của mô tả để co gọn mượt (kể cả nhiều dòng)
    const measureDesc = () => {
      const h = desc?.offsetHeight ?? 0;
      el.style.setProperty('--descH', `${h}px`); // chiều cao tối đa khi hiện
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;

      // Giai đoạn 1: mô tả (opacity + max-height)
      const p1 = clamp(1 - y / T1); // 1 -> 0
      el.style.setProperty('--descOpacity', String(p1));
      el.style.setProperty('--descMax', `calc(var(--descH) * ${p1.toFixed(3)})`);

      // Giai đoạn 2: co nền (padding-block)
      const p2 = clamp((y - T1) / T2); // 0 -> 1
      const pad = Math.round(lerp(PAD_START, PAD_END, p2));
      el.style.setProperty('--padY', `${pad}px`);

      // Giai đoạn 3: thu nhỏ tiêu đề (font-size)
      const p3 = clamp((y - T1 - T2) / T3); // 0 -> 1
      const titleSize = lerp(TITLE_START, TITLE_END, p3);
      el.style.setProperty('--titleSize', `${titleSize}px`);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // đo khi mount & khi resize (để mô tả nhiều dòng vẫn mượt)
    measureDesc();
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureDesc);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measureDesc);
    };
  }, []);

  return (
    <header ref={hdrRef} className="header-wrapper header-auto">
      <a href={`//${appUrl}`}>
        {/* Giữ đúng font TTP của bạn */}
        <h1 className="app-title font-ttp">{appName}</h1>
      </a>
      <p ref={descRef} className="app-description">
        {appDescription}
      </p>
    </header>
  );
}
