"use client";

import Image from "next/image";
import { appName, phone, email, copyright } from "@/libs/env";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-4 pt-6 pb-24">
      {/* Tiêu đề */}
      <header className="text-center mb-6">
        <h1 className="page-title">
          {appName}
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Hệ sinh thái ngành tre – hỗ trợ nông dân phát triển bền vững
        </p>
      </header>

      {/* Các chức năng chính */}
      <section className="space-y-4">
        <button className="btn-primary">
          📥 Nhập dữ liệu mới
        </button>
        <button className="btn-primary">
          📋 Xem báo cáo cây trồng
        </button>
        <button className="btn-primary">
          📷 Gửi ảnh thực địa
        </button>
      </section>

      {/* Thông tin footer */}
      <footer className="text-center text-sm text-gray-500 mt-10">
        <p>
          Liên hệ: <a href="tel:"{phone}"">{phone}</a> | {email}
        </p>
        <p className="mt-1">{copyright}</p>
      </footer>

      {/* Navigation dưới nếu cần thêm sau */}
    </main>
  );
}
