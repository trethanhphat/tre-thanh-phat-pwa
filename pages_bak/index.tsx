// pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import { appName, phone, email, copyright } from '@/lib/env';

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

      <main className="min-h-screen bg-green-50 text-gray-800 p-6"></main>
    </>
  );
}
