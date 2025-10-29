// ✅ File: next.config.js

const isDev = process.env.NODE_ENV === 'development';

const runtimeCaching = [
  {
    // 🔹 Cache App Shell (HTML, JS, CSS) 7 ngày
    //urlPattern: /^https:\/\/app\.trethanhphat\.vn\/.*$/,
    urlPattern:
      /^https:\/\/app\.trethanhphat\.vn\/.*\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|ico|html)$/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'ttp-app-shell',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 ngày
      },
    },
  },
  {
    // 🔹 Cache pages: news, batches, products, report, photos, policy
    urlPattern: ({ url }) =>
      url.origin === 'https://app.trethanhphat.vn' &&
      /^\/(news|batches|products|report|photos|policy)/.test(url.pathname),
    handler: 'NetworkFirst', // Ưu tiên mạng, fallback cache
    options: {
      cacheName: 'ttp-api',
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 4 * 60 * 60, // 4h
      },
    },
  },

  {
    // 🔹 Cache API batches
    urlPattern: /^https:\/\/app\.trethanhphat\.vn\/api\/sheet\/batches/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'batches-api',
      expiration: {
        maxAgeSeconds: 4 * 60 * 60, // 4h
        maxEntries: 30,
      },
      plugins: [
        {
          handlerDidError: async () => {
            return new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' },
            });
          },
        },
      ],
    },
  },
  {
    // 🔹 Cache API products
    urlPattern: /^https:\/\/app\.trethanhphat\.vn\/api\/products/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'products-api',
      expiration: {
        maxAgeSeconds: 4 * 60 * 60, // 4h
        maxEntries: 30,
      },
      plugins: [
        {
          handlerDidError: async () => {
            return new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' },
            });
          },
        },
      ],
    },
  },
  {
    // 🔹 Cache API product
    urlPattern: /^https:\/\/app\.trethanhphat\.vn\/api\/product/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'product-api',
      expiration: {
        maxAgeSeconds: 4 * 60 * 60, // 4h
        maxEntries: 30,
      },
      plugins: [
        {
          handlerDidError: async () => {
            return new Response(JSON.stringify([]), {
              headers: { 'Content-Type': 'application/json' },
            });
          },
        },
      ],
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
    serverActions: {},
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
