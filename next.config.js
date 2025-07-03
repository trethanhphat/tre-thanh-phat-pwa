// next.config.js

const runtimeCaching = [
  {
    // Cache trang chủ
    urlPattern: /^\/$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'home-page',
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 1,
        maxAgeSeconds: 24 * 60 * 60, // 1 ngày
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    // Cache các file tĩnh (_next)
    urlPattern: /^\/_next\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-resources',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 ngày
      },
    },
  },
  {
    // Cache ảnh
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      },
    },
  },
  {
    // Cache các trang HTML khác
    urlPattern: /^https?.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'html-pages',
      networkTimeoutSeconds: 5,
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
];

// ✅ Import plugin PWA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 👈 chỉ bật PWA khi production
  buildExcludes: [
    /.*app-build-manifest\.json$/, // 👈 lỗi hiện tại
    /.*dynamic-css-manifest\.json$/, // 👈 cái bạn đã loại
    /.*middleware-manifest\.json$/, // 👈 đề phòng lỗi khác về sau
  ],
  runtimeCaching,
  fallbacks: {
    document: '/offline.html',
  },
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
