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
  textAlign: 'center' as const,
  background: '#fff',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
};

export default function BottomMenu() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const menuHeight = 80; // Chiều cao menu px (dùng padding-bottom tương ứng)

  const handleLinkClick = () => setMenuOpen(false);

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
          <span>🌱</span>
          <span>Mở menu</span>
        </button>
        <button
          onClick={() => {
            setMenuOpen(false);
            router.push('/account');
          }}
          style={buttonStyle}
        >
          <span>👤</span>
          <span>Tài khoản</span>
        </button>
        <button
          onClick={() => {
            setMenuOpen(false);
            router.back();
          }}
          style={buttonStyle}
        >
          <span>⬅️</span>
          <span>Quay lại</span>
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
                <button style={buttonStyle} onClick={handleLinkClick}>
                  {label}
                </button>
              </Link>
            ))}

            <a href={`tel:${phone}`}>
              <button style={buttonStyle} onClick={handleLinkClick}>
                📞 Gọi điện: {phone}
              </button>
            </a>
            <a href={`mailto:${email}`}>
              <button style={buttonStyle} onClick={handleLinkClick}>
                📧 Gửi email: {email}
              </button>
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
