// File src/lib/debugImages.ts
// Công cụ debug ảnh trong IndexedDB

const DEBUG = true; // đổi sang false nếu không muốn log

export function logImageEvent(action: string, detail?: any) {
  if (!DEBUG) return;

  const time = new Date().toISOString();
  if (detail !== undefined) {
    console.log(`[ImageDebug][${time}] ${action}`, detail);
  } else {
    console.log(`[ImageDebug][${time}] ${action}`);
  }
}

export function logImageError(action: string, error: any) {
  if (!DEBUG) return;

  const time = new Date().toISOString();
  console.error(`[ImageDebug][${time}] ❌ ${action}`, error);
}
