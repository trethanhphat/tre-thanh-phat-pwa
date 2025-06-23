// ✅ Import plugin PWA
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // 👈 chỉ bật PWA khi production
  buildExcludes: [
    /.*app-build-manifest\.json$/, // 👈 lỗi hiện tại
    /.*dynamic-css-manifest\.json$/, // 👈 cái bạn đã loại
    /.*middleware-manifest\.json$/, // 👈 đề phòng lỗi khác về sau
  ],
});

// ✅ Cấu hình mới: bật App Router + giữ strict mode + PWA
const nextConfig = {
  // your other config here
  experimental: {
    appDir: true,
  },
};

module.exports = withPWA(nextConfig);
