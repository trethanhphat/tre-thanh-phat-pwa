const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Cấu hình cache động
  runtimeCaching: [
    {
      // Cache trang chủ (/) với chiến lược NetworkFirst
      urlPattern: /^\/$/, // chỉ cache route "/"
      handler: 'NetworkFirst',
      options: {
        cacheName: 'home-page',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 24 * 60 * 60, // 1 ngày
        },
        cacheableResponse: {
          statuses: [200],
        },
        networkTimeoutSeconds: 5,
      },
    },
    {
      // Cache tất cả các file tĩnh (ảnh, js, css...)
      urlPattern: /^https:\/\/app\.trethanhphat\.vn\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 ngày
        },
      },
    },
    {
      // Cache cho các request còn lại (HTML khác)
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'general-pages',
        networkTimeoutSeconds: 5,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
  // fallback vẫn giữ lại nếu muốn
  fallbacks: {
    document: '/offline.html',
  },
});

module.exports = withPWA({
  reactStrictMode: true,
});
