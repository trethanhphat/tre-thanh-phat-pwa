"use client";

import Image from "next/image";
import { appName, phone, email, copyright } from "@/libs/env";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24 ttp-font">
      {/* Tiêu đề */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-700 leading-snug">
          {appName}
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Hệ sinh thái ngành tre – hỗ trợ nông dân phát triển bền vững
        </p>
      </header>

      {/* Các chức năng chính */}
      <section className="space-y-4">
        <button className="w-full py-4 text-lg bg-green-600 text-white rounded-2xl focus:outline-none">
          📥 Nhập dữ liệu mới
        </button>
        <button className="w-full py-4 text-lg bg-green-100 text-green-800 rounded-2xl border border-green-300">
          📋 Xem báo cáo cây trồng
        </button>
        <button className="w-full py-4 text-lg bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-300">
          📷 Gửi ảnh thực địa
        </button>
      </section>

      {/* Thông tin footer */}
      <footer className="text-center text-sm text-gray-500 mt-10">
        <p>
          Liên hệ: <a href=`tel:${phone}`>{phone}</a> | <a href=`mailto:${email}`>{email}</a>
        </p>
        <p className="mt-1">{copyright}</p>
      </footer>

      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}


















// Để gõ trên điện thoại cho dễ nhìn 
