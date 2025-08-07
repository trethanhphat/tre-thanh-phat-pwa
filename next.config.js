// ✅ File: next.config.js

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

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: isDev,
  register: false,
  sw: 'sw.js',
  runtimeCaching,
  buildExcludes: [/.*app-build-manifest\.json$/, /.*dynamic-css-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },

  // ✅ Thêm Content-Security-Policy để cho phép nhúng từ Looker Studio
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://lookerstudio.google.com;",
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
