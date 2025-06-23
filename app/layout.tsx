// app/layout.tsx
import "./globals.css";
import "@/src/fonts/font-ttp.css";
import Head from "next/head";
import Image from "next/image";
import { appName, appDescription, phone, email, copyright } from "@/libs/env";

export const metadata = {
  title: appName,
  description: `${appName} - Website chính thức`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <title>{appName}</title>
        <meta
          name="description"
          content="Giới thiệu doanh nghiệp Tre Thanh Phát - Hệ sinh thái ngành tre"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/assets/icon/icon-192.png" type="image/png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <main style={{ padding: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}
// Change to app
