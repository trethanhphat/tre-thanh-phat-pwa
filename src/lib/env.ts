// File: libs/env.ts

// Thông tin hiển thị
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

// Đồng bộ dữ liệu & cấu hình ngoại tuyến

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const weatherApi = process.env.NEXT_PUBLIC_WEATHER_API_URL || '';
export const forecastEnabled = process.env.NEXT_PUBLIC_AI_FORECAST_ENABLED === 'true';

export const syncInterval = Number(process.env.NEXT_PUBLIC_SYNC_RETRY_INTERVAL || '60000');
export const maxImageQueue = Number(process.env.NEXT_PUBLIC_MAX_IMAGE_QUEUE || '20');

// API tải News
export const NEXT_PUBLIC_API_NEWS_URL =
  process.env.NEXT_PUBLIC_API_NEWS_URL || 'https://rungkhoai.com/wp-json/wc/v2';

// API tải dữ liệu batches
export const API_BATCH_URL = process.env.API_BATCH_URL || '';

// API load Products từ WooCommerce
export const NEXT_PUBLIC_API_PRODUCTS_URL = process.env.NEXT_PUBLIC_API_PRODUCTS_URL || '';
export const NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY =
  process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY ?? '';
export const NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET =
  process.env.NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET ?? '';

if (!NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY || !NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET) {
  throw new Error(
    'Thiếu NEXT_PUBLIC_API_PRODUCTS_CONSUMER_KEY hoặc NEXT_PUBLIC_API_PRODUCTS_CONSUMER_SECRET'
  );
}

// Loại cảm biến (Sensor Mode)
// Giá trị mặc định 'Mode' tương ứng với cảm biến độ ẩm đất (Soil Moisture Sensor)
// Các giá trị khác có thể là 'pH', 'Light', 'Temperature', 'Humidity', v.v.
export const sensorMode = process.env.NEXT_PUBLIC_SENSOR_MODE || 'Mode';
