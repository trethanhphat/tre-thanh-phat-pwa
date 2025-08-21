// File: src/components/Header.tsx
'use client';

import { useEffect, useRef } from 'react';
import { appName, appDescription, appUrl } from '@/lib/env';

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function Header() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Ngưỡng cho từng giai đoạn
    const T1 = 80; // 0→T1: mô tả fade-out dần
    const T2 = 80; // T1→T1+T2: co padding (nền xanh co lại)
    const T3 = 80; // T1+T2→T1+T2+T3: thu nhỏ toàn bộ header

    // Tham số hiển thị
    const PAD_START = 16; // px (padding-block khi full)
    const PAD_END = 6; // px (padding-block khi co nền)
    const TITLE_START = 28.8; // px ≈ 1.8rem
    const TITLE_END = 20.8; // px ≈ 1.3rem
    const SCALE_START = 1.0;
    const SCALE_END = 0.92; // scale cuối (thu nhỏ cả header nhẹ nhàng)

    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;

      // Giai đoạn 1: fade mô tả (0 → 1)
      const p1 = clamp(1 - y / T1); // 1 ở top, 0 ở T1
      el.style.setProperty('--desc-opacity', String(p1));

      // Giai đoạn 2: co nền (padding) (0 → 1)
      const p2 = clamp((y - T1) / T2);
      const pad = Math.round(lerp(PAD_START, PAD_END, p2));
      el.style.setProperty('--pad-y', pad + 'px');

      // Giai đoạn 3: thu nhỏ header & chữ (0 → 1)
      const p3 = clamp((y - T1 - T2) / T3);
      const titleSize = lerp(TITLE_START, TITLE_END, p3);
      el.style.setProperty('--title-size', titleSize + 'px');

      const scale = lerp(SCALE_START, SCALE_END, p3);
      el.style.setProperty('--header-scale', scale.toFixed(3));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // Khởi tạo lần đầu
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header ref={ref} className="header-wrapper header-staged">
      <a href={`//${appUrl}`}>
        <h1 className="app-title font-ttp">{appName}</h1>
      </a>
      <p className="app-description">{appDescription}</p>
    </header>
  );
}
