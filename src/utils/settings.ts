// utils/settings.ts

const SYNC_OVER_MOBILE_KEY = 'syncOverMobile';

// Lưu trạng thái bật/tắt đồng bộ qua mạng di động
export function setSyncOverMobile(enabled: boolean) {
  try {
    localStorage.setItem(SYNC_OVER_MOBILE_KEY, JSON.stringify(enabled));
  } catch {
    // Nếu localStorage không khả dụng thì không làm gì
  }
}

// Lấy trạng thái đồng bộ qua mạng di động, mặc định false
export function getSyncOverMobile(): boolean {
  try {
    const value = localStorage.getItem(SYNC_OVER_MOBILE_KEY);
    return value ? JSON.parse(value) : false;
  } catch {
    return false;
  }
}
