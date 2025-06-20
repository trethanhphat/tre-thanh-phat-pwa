// pages/index.tsx
import Head from "next/head";
import Image from "next/image";
import { appName, phone, email, copyright } from "@/libs/env";

export default function Home() {
  return (
    <>
      <Head>
        <title>{appName}</title>
        <meta
          name="description"
          content="Giới thiệu doanh nghiệp Tre Thanh Phát - Hệ sinh thái ngành tre"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#116530" />
      </Head>

      <main className="min-h-screen bg-green-50 text-gray-800 p-6">
        <h1 className="text-4xl font-bold text-green-800">{appName}</h1>
        <p className="mt-4 text-lg">
          Doanh nghiệp tiên phong phát triển hệ sinh thái ngành tre tại Việt
          Nam.
        </p>
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
            <h3 className="text-xl font-medium text-green-700 mt-2">
              Măng gai Rừng Khoái
            </h3>
            <p className="text-sm">
              Đặc sản vùng núi, vị ngọt đậm đà, đóng gói 350g.
            </p>
          </div>
          <p>cập nhật lúc: 2506201641</p>
          <footer className="text-xl font-medium text-green-700 mt-2">
            {copyright}
          </footer>
        </section>
      </main>
    </>
  );
}
