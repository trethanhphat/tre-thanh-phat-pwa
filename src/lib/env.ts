// libs/env.ts

export const appName = process.env.NEXT_PUBLIC_APP_NAME || '(APP NAME)';
export const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || '(APP DESCRIPTION)';
export const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '(BRAND NAME)';
export const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '(CONTACT PHONE)';
export const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '(CONTACT EMAIL)';
export const website = process.env.NEXT_PUBLIC_CONTACT_WEBSITE || 'www.trethanhphat.vn';
export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'app.trethanhphat.vn';

const currentYear = new Date().getFullYear();
const startYear = 2024;
const brandOwner = process.env.NEXT_PUBLIC_BRAND_OWNER || 'Thanh Phát Bamboo Corp';

export const copyright = `© ${
  startYear === currentYear ? currentYear : `${startYear}–${currentYear}`
} ${brandOwner}`;

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const sensorMode = process.env.NEXT_PUBLIC_SENSOR_MODE || 'Mode';

export const weatherApi = process.env.NEXT_PUBLIC_WEATHER_API_URL || '';
export const forecastEnabled = process.env.NEXT_PUBLIC_AI_FORECAST_ENABLED === 'true';

export const syncInterval = Number(process.env.NEXT_PUBLIC_SYNC_RETRY_INTERVAL || '60000');
export const maxImageQueue = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_QUEUE || '20');

// API load News

export const NEXT_PUBLIC_API_NEWS_URL =
  process.env.NEXT_PUBLIC_API_NEWS_URL || 'https://rungkhoai.com/wp-json/wc/v2';

// API load Products từ rungkhoai.com
export const NEXT_PUBLIC_API_PRODUCTS_URL =
  process.env.NEXT_PUBLIC_API_PRODUCTS_URL || 'https://rungkhoai.com/wp-json/wc/v3/products';
export const NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY =
  process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY!;
export const NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET =
  process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET!;

if (!NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY || !NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET) {
  throw new Error(
    'Thiếu NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY hoặc NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET trong .env.local'
  );
}
