// src/components/BottomMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { appName, appDescription, phone, email } from '@/lib/env';

const buttonStyle = {
  width: '100%',
  padding: '1rem',
  fontSize: '1.2rem',
  textAlign: 'left' as const,
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: '12px',
  cursor: 'pointer',
};

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
        <button onClick={() => setMenuOpen(true)} style={buttonStyle}>
          🌱 Mở menu
        </button>
        <Link href="/account" style={buttonStyle}>
          👤 Tài khoản
        </Link>
        <button onClick={() => router.back()} style={buttonStyle}>
          ⬅️ Quay lại
        </button>
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header cố định */}
          <div
            style={{
              padding: '1.5rem',
              background: '#fff',
              borderBottom: '1px solid #ccc',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            <h1 className="font-ttp" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              {appName}
            </h1>
            <p style={{ marginBottom: '0' }}>{appDescription}</p>
          </div>

          {/* Nội dung menu cuộn được */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              paddingBottom: '100px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {[
              { href: '/', label: '🏠 Trang chủ' },
              { href: '/about', label: 'ℹ️ Giới thiệu' },
              { href: '/news', label: '📰 Tin tức' },
              { href: '/products', label: '🛒 Sản phẩm' },
              { href: '/report', label: '📊 Báo cáo' },
              { href: '/survey', label: '📝 Khảo sát' },
              { href: '/photos', label: '📷 Hình ảnh' },
              { href: '/contact', label: '🪪 Liên hệ' },
              { href: '/faq', label: '❓ Câu hỏi thường gặp' },
              { href: '/faq', label: '📖 Chính sách' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} passHref>
                <button style={buttonStyle}>{label}</button>
              </Link>
            ))}

            <a href={`tel:${phone}`}>
              <button style={buttonStyle}>📞 Gọi điện: {phone}</button>
            </a>
            <a href={`mailto:${email}`}>
              <button style={buttonStyle}>📧 Gửi email: {email}</button>
            </a>
          </div>

          {/* Nút đóng cố định dưới cùng */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: '#f8f8f8',
              padding: '1rem',
              borderTop: '1px solid #ccc',
            }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              style={{ ...buttonStyle, background: '#eee' }}
            >
              ❌ Đóng Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
