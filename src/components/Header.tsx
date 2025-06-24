// src/components/Header.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaArrowLeft } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="z-50 relative">
      <div className="flex items-center justify-between p-4 bg-green-700 text-white">
        <button
          onClick={() => router.back()}
          className="p-2 focus:outline-none"
          aria-label="Quay lại"
        >
          <FaArrowLeft size={20} />
        </button>

        <h1 className="text-xl font-bold text-center flex-1">Tre Thanh Phát</h1>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 focus:outline-none"
          aria-label="Mở menu"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-white text-black z-50 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Đóng menu">
              <FaTimes size={24} />
            </button>
          </div>

          <nav className="flex flex-col text-lg p-6 space-y-6">
            <a href="/about" className="hover:underline">
              Giới thiệu
            </a>
            <a href="/news" className="hover:underline">
              Tin tức
            </a>
            <a href="/products" className="hover:underline">
              Sản phẩm
            </a>
            <a href="/contact" className="hover:underline">
              Liên hệ
            </a>
            <a href="/policy" className="hover:underline">
              Chính sách
            </a>
            <a href="/faq" className="hover:underline">
              Câu hỏi thường gặp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
