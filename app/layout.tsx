// app/layout.tsx
import "@/src/fonts/ttp-font.css";
import Head from "next/head";
import Image from "next/image";
import { appName, phone, email, copyright } from "@/libs/env";
 
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
        <meta name="theme-color" content="#116530" />
    </head>
      <body
        style={{
          fontFamily: "sans-serif",
          background: "#fff",
          color: "#000",
          fontSize: "18px",
        }}
      >
        <main style={{ padding: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}
// Change to app
