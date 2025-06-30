// src/components/BottomMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function BottomMenu() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const menuHeight = 80; // Chiều cao menu px (dùng padding-bottom tương ứng)

  return (
    <>
      {/* Padding để không bị che nội dung */}
      <div style={{ paddingBottom: `${menuHeight}px` }}></div>

      {/* Menu nổi dưới cùng */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${menuHeight}px`,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          background: '#ffffff',
          borderTop: '1px solid #ccc',
          zIndex: 1000,
        }}
      >
        <button onClick={() => setMenuOpen(true)}>🌱 Mở menu</button>
        <Link href="/account">👤 Tài khoản</Link>
        <button onClick={() => router.back()}>⬅️ Quay lại</button>
      </nav>

      {/* Menu toàn màn hình */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#f8f8f8',
            zIndex: 2000,
            padding: '1.5rem',
            overflowY: 'auto',
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', bottom: 16, left: 16 }}
          >
            ❌ Đóng Menu
          </button>

          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{appName}</h1>
          <p style={{ marginBottom: '1.5rem' }}>{appDescription}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/">🏠 Trang chủ</Link>
            <Link href="/about">ℹ️ Giới thiệu</Link>
            <Link href="/news">📰 Tin tức</Link>
            <Link href="/products">🛒 Sản phẩm</Link>
            <Link href="/report">📊 Báo cáo</Link>
            <Link href="/survey">📝 Khảo sát</Link>
            <Link href="/photos">📷 Hình ảnh</Link>
            <Link href="/contact">🪪 Liên hệ</Link>
            <Link href="/faq">📖 Chính sách</Link>
            <Link href="/faq">❓ Câu hỏi thường gặp</Link>
            <Link href={`tel:${phone}`}>Gọi điện: {phone}</Link>
            <Link href={`mailto:${email}`}>Gửi email tới: {email}</Link>
          </div>
        </div>
      )}
    </>
  );
}
