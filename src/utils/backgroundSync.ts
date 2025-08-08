// File: utils/backgroundSync.ts
import { saveProductsToDB, saveImageToDB } from './indexedDB';
import { getSyncOverMobile } from './settings';

export async function backgroundSync() {
  const connection = (navigator as any).connection;
  const battery = await (navigator as any).getBattery?.();

  const isWifi = !connection?.type || connection.type === 'wifi';
  const isMobileData = connection?.type === 'cellular';
  const allowMobileSync = getSyncOverMobile();

  const isCharging = battery?.charging || false;
  const batteryLevel = battery?.level ? battery.level * 100 : 100;

  // Điều kiện mạng
  const networkOk = isWifi || (allowMobileSync && isMobileData);

  // Điều kiện pin
  const batteryOk = isCharging || batteryLevel >= 50;

  if (!networkOk || !batteryOk) {
    console.log('⏳ Điều kiện không đủ để sync nền');
    return;
  }

  try {
    const res = await fetch('/api/products-list');
    const { products } = await res.json();

    await saveProductsToDB(products);

    for (const p of products) {
      if (p.image) {
        await saveImageToDB(p.image);
      }
    }

    console.log(`✅ Đồng bộ nền hoàn tất lúc ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error('❌ Lỗi đồng bộ nền:', err);
  }
}
