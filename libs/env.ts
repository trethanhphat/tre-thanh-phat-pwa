// libs/env.ts

export const appName = process.env.NEXT_PUBLIC_APP_NAME || "Tên app";
export const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Mô tả app";
export const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Nhãn hiệu";
export const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "Số điện thoại";
export const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "email";
export const email = process.env.NEXT_PUBLIC_CONTACT_WEBSITE || "www.trethanhphat.vn";

const currentYear = new Date().getFullYear();
const startYear = 2021;
const brandOwner = process.env.NEXT_PUBLIC_BRAND_OWNER || "Tre Thanh Phát Corp";

export const copyright = `© ${
  startYear === currentYear ? currentYear : `${startYear}–${currentYear}`
} ${brandOwner}`;

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const sensorMode = process.env.NEXT_PUBLIC_SENSOR_MODE || "Mode";
export const weatherApi = process.env.NEXT_PUBLIC_WEATHER_API_URL || "";
export const forecastEnabled =
  process.env.NEXT_PUBLIC_AI_FORECAST_ENABLED === "true";

export const syncInterval = Number(
  process.env.NEXT_PUBLIC_SYNC_RETRY_INTERVAL || "60000"
);
export const maxImageQueue = Number(
  process.env.NEXT_PUBLIC_MAX_IMAGE_QUEUE || "20"
);
