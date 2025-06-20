const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // 👈 chỉ bật PWA khi production
  buildExcludes: [/.*dynamic-css-manifest\.json$/], // loại bỏ file _next/dynamic-css-manifest.json khỏi precache bằng cấu hình trong next.config.js.
});

module.exports = withPWA({
  reactStrictMode: true,
});
