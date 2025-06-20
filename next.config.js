const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // 👈 chỉ bật PWA khi production
});

module.exports = withPWA({
  reactStrictMode: true,
});
