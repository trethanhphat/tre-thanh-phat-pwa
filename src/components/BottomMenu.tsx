// src/components/BottomMenu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ManualSyncButton from './ManualSyncButton';
import { appName, appUrl, phone, email } from '@/lib/env';

const buttonStyle = {
  flexDirection: 'column' as const,
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
      <nav style={{ height: `${menuHeight}px` }} className="nav-bar">
        <button onClick={() => setMenuOpen(true)} className="nav-btn">
          <span className="nav-icon">🌱</span>
          <span className="nav-label">Mở menu</span>
        </button>
        <button
          onClick={() => {
            setMenuOpen(false);
            router.push('/account');
          }}
          className="nav-btn"
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Tài khoản</span>
        </button>
        <button
          onClick={() => {
            setMenuOpen(false);
            router.back();
          }}
          className="nav-btn"
        >
          <span className="nav-icon">⬅️</span>
          <span className="nav-label">Quay lại</span>
        </button>
      </nav>

      {/* Menu toàn màn hình */}
      {isMenuOpen && (
        <div
          className="menu"
          style={{
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header cố định */}
          <div
            className="header"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-header)',
              borderBottom: '1px solid var(--color-alert)',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            <a href={`//${appUrl}`}>
              <h1 className="font-ttp app-title">{appName}</h1>
            </a>
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
              { href: '//trethanhphat.vn/', label: 'ℹ️ Giới thiệu' },
              { href: '/news', label: '📰 Tin tức' },
              { href: '//rungkhoai.com', label: '🛒 Sản phẩm' },
              { href: '/report', label: '📊 Báo cáo' },
              { href: '/survey', label: '📝 Khảo sát' },
              { href: 'https://photos.app.goo.gl/wkDfQRz7YwiV8cCd6', label: '📷 Hình ảnh' },
              { href: '/contact', label: '🪪 Liên hệ' },
              { href: '/policy', label: '📖 Chính sách' },
              { href: '/faq', label: '❓ Câu hỏi thường gặp' },
            ].map(({ href, label }) => (
              <Link href={href} style={{ textDecoration: 'none' }} onClick={handleLinkClick}>
                <button style={buttonStyle}>{label}</button>
              </Link>
            ))}

            <a href={`tel:${phone}`} style={{ textDecoration: 'none' }}>
              <button style={buttonStyle} onClick={handleLinkClick}>
                📞 Gọi điện: {phone}
              </button>
            </a>
            <a href={`mailto:${email}`} style={{ textDecoration: 'none' }}>
              <button style={buttonStyle} onClick={handleLinkClick}>
                📧 Gửi email: {email}
              </button>
            </a>
            <ManualSyncButton />
            <p>Doanh nghiệp tiên phong phát triển hệ sinh thái ngành tre tại Việt Nam.</p>
          </div>

          {/* Nút đóng cố định dưới cùng */}
          <div
            className="bottom"
            style={{
              position: 'sticky',
              bottom: 0,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button onClick={() => setMenuOpen(false)} style={{ ...buttonStyle }}>
              ❌ Đóng Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
