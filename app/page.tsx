'use client';

import Image from 'next/image';
import { appName, appDescription, appUrl, phone, email, website, copyright } from '@/lib/env';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}
      <header className="text-center mb-6"></header>

      {/* Các chức năng chính */}
      <section className="space-y-4">
        <button className="btn-primary w-full py-4 text-lg bg-green-600 text-white rounded-2xl focus:outline-none">
          📥 Nhập dữ liệu mới
        </button>
        <button className="btn-secondary w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
          📋 Xem báo cáo cây trồng
        </button>
        <button className="btn-primary w-full py-4 text-lg bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-300">
          📷 Gửi ảnh thực địa
        </button>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Sản phẩm nổi bật</h2>
        <div className="mt-4 bg-white p-4 rounded-xl shadow-md max-w-sm">
          <Image
            src="/images/products/mang-gai-rung-khoai.png"
            alt="Măng gai Rừng Khoái"
            width={500}
            height={500}
            className="rounded-xl shadow-lg"
          />
          <h3 className="text-xl font-medium text-green-700 mt-2">Măng gai Rừng Khoái</h3>
          <p className="text-sm">Đặc sản vùng núi, vị ngọt đậm đà, đóng gói 350g.</p>
        </div>
      </section>

      {/* Thông tin footer */}
      <footer className="text-center text-sm text-gray-500 mt-10">
        <p>
          Điện thoại: <a href={`tel:${phone}`}>{phone}</a>
        </p>
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p className="mt-1">{copyright}</p>
        <p>Cập nhật lúc: 2506230816</p>
      </footer>

      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}

// Để gõ trên điện thoại cho dễ nhìn
