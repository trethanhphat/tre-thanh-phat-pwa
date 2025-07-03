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

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  fallbacks: {
    document: '/offline.html',
  },
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
