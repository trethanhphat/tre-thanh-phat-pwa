// src/components/Header.tsx
'use client';

import { useState } from 'react';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 bg-green-700 text-white">
      <h1 className="text-2xl font-bold">Tre Thanh Phát</h1>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 focus:outline-none"
        aria-label="Toggle menu"
      >
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white text-black shadow-md z-50">
          <nav className="flex flex-col space-y-4 p-4 text-lg">
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
          </nav>
        </div>
      )}
    </header>
  );
}
