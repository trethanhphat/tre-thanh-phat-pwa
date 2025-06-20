// ✅ Import plugin PWA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 👈 chỉ bật PWA khi production
  buildExcludes: [/.*dynamic-css-manifest\.json$/], // 👈 loại bỏ file này khỏi precache
});

// ✅ Cấu hình mới: bật App Router + giữ strict mode + PWA
const nextConfig = {
  // your other config here
  experimental: {
    appDir: true,
  },
};

module.exports = withPWA(nextConfig);
