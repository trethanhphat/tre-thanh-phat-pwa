// ✅ File: next.config.js

const withPWA = require('next-pwa').default;
const isDev = process.env.NODE_ENV === 'development';

const runtimeCaching = [
  {
    urlPattern: /^https:\/\/app\.trethanhphat\.vn\/.*$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'ttp-app-shell',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      },
    },
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
};

module.exports = withPWA({
  ...nextConfig,
  dest: 'public',
  disable: isDev,
  register: false, // ❌ Tắt autoRegister vì dùng App Router
  sw: 'sw.js',
  runtimeCaching, // 👉 Giữ tên biến như trước
});
