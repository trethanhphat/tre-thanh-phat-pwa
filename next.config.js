// ✅ File: next.config.js

const withPWA = require('next-pwa');
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
const nextConfig = withPWA({
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  dest: 'public',
  disable: isDev,
  register: false,
  sw: 'sw.js',
  runtimeCaching,
  buildExcludes: [
    /.*app-build-manifest\.json$/,
    /.*dynamic-css-manifest\.json$/,
    /.*middleware-manifest\.json$/,
  ],
});

module.exports = nextConfig;
