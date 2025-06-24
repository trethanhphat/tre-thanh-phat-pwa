'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaArrowLeft } from 'react-icons/fa';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Thanh tiêu đề cố định */}
      <div className="fixed top-0 left-0 w-full bg-green-700 text-white z-50 flex items-center justify-between px-4 py-3 border-b border-green-800">
        <button onClick={() => router.back()} className="p-2" aria-label="Quay lại">
          <FaArrowLeft size={20} />
        </button>

        {/* Tên app với font-ttp */}
        <h1 className="text-3xl font-bold text-green-700 leading-snug font-ttp">
          <a className="no-underline" href={`//${appUrl}`}>
            {appName}
          </a>
        </h1>
        <p className="mt-2 text-base text-gray-600">{appDescription}</p>
        <p className="mt-4 text-lg">
          Doanh nghiệp tiên phong phát triển hệ sinh thái ngành tre tại Việt Nam.
        </p>

        <button onClick={() => setMenuOpen(true)} className="p-2" aria-label="Mở menu">
          <FaBars size={20} />
        </button>
      </div>

      {/* Khoảng trắng dưới header */}
      <div className="h-[56px]" />

      {/* Menu toàn màn hình */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white text-black overflow-y-auto">
          <div className="sticky top-0 bg-white border-b flex items-center justify-between px-4 py-3 z-50">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Đóng menu">
              <FaTimes size={20} />
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
    </>
  );
}
