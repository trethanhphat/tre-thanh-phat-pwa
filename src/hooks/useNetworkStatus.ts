/****************************************************************************************************
 * 📄 File: src/hooks/useNetworkStatus.ts
 * 📘 Module: Tải trước dữ liệu cho ứng dụng
 * 🧠 Description: 
 * Thực hiện hook React để theo dõi trạng thái mạng của trình duyệt, bao gồm:
 * - Trạng thái online/offline
 * - Loại kết nối mạng (wifi, cellular)   
 * - Tốc độ kết nối và các chỉ số mạng khác (downlink, rtt, saveData) nếu trình duyệt hỗ trợ Network Information API.
 * Hook này tự động cập nhật trạng thái mạng khi có sự thay đổi và phát sự kiện tùy chỉnh 'network:status' trên đối tượng window.
 * Điều này cho phép các thành phần khác trong ứng dụng lắng nghe và phản hồi khi trạng thái mạng thay đổi.
 * 🛠️ Features
 * - Tự động cập nhật trạng thái mạng khi có sự thay đổi
 * - Phát sự kiện tùy chỉnh 'network:status' trên đối tượng window khi trạng thái mạng thay đổi
 * - Hỗ trợ đọc các chỉ số mạng từ Network Information API nếu trình duyệt hỗ trợ
 * 🧩 Dependencies
 *  - Không có phụ thuộc bên ngoài
 * 📝 Usage
 *  import useNetworkStatus, { NetworkMetrics } from '@/hooks/useNetworkStatus';
 * 
 *  const { network } = useNetworkStatus();
 *  - network: đối tượng chứa trạng thái mạng hiện tại với các thuộc tính:
 *    - online: boolean - trạng thái online/offline
 *    - effectiveType?: string - loại kết nối mạng (4g/3g/2g/slow-2g)
 *    - downlink?: number - tốc độ kết nối ước lượng (Mbps)
 *    - rtt?: number - round-trip time ước lượng (ms)
 *    - saveData?: boolean - chế độ tiết kiệm dữ liệu
 *   - type?: string - loại kết nối (wifi, cellular, ...)
 *   - timestamp: number - thời điểm cập nhật cuối (timestamp)
 *  Hook này có thể được sử dụng trong các thành phần React để theo dõi và phản hồi khi trạng thái mạng thay đổi.
 *  Ví dụ lắng nghe sự kiện thay đổi trạng thái mạng:
 * window.addEventListener('network:status', (event) => {
 *  const network = event.detail as NetworkMetrics;
 *  console.log('Trạng thái mạng mới:', network);
 * });
 * 
 * 
 *  Ví dụ:
 *  const { network } = useNetworkStatus();
 *  console.log(`Mạng hiện tại: ${network.online ? 'Online' : 'Offline'}`); 
 *  console.log(`Loại kết nối: ${network.type}`);
 *  console.log(`Tốc độ downlink: ${network.downlink} Mbps`);
 *  console.log(`RTT: ${network.rtt} ms`);
 *  console.log(`Chế độ tiết kiệm dữ liệu: ${network.saveData ? 'Bật' : 'Tắt'}`);
 *  ****************************************************************************************************
 *  Copyright (c) 2025 TPB Corp. All rights reserved.
 *  ***************************************************************************************************
 * License: Proprietary and Confidential
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *  
/***************************************************************************************************
 * 🏢 Organization: Thanh Phát Bamboo Corp (TPB Corp)
 * 👤 Author: Nguyễn Như Đường (TPB Corp)
 * 📱 Contact: +84-904-969-268
 * 📧 Email: duong273@gmail.com
 * 📅 Created: 2025-11-13
 * 🔄 Last Updated: 2025-11-13
 * 🧩 Maintainer: DevOps Team @ TPB Corp
 * 
 /***************************************************************************************************
 * 🧾 Version: 1.0.2
 *  Change Log:
 *   - 1.0.2 (2025-11-07): Tối ưu TTL cache ảnh & xử lý offline.
 *   - 1.0.1 (2025-10-30): Bổ sung đồng bộ khi khởi động app.
 *   - 1.0.0 (2025-10-30): Tạo file ban đầu.
 *
 /***************************************************************************************************
 * ⚖️ License: © 2025 TPB Corp. All rights reserved.
 * 📜 Confidentiality: Internal Use Only.
 * 🔐 Compliance: ISO/IEC 27001, ISO/IEC 12207, ISO 9001
 *
 /***************************************************************************************************
 * 🧭 Standards:
 *   - ISO/IEC 12207: Software Life Cycle Processes
 *   - ISO/IEC 25010: Software Quality Requirements
 *   - TTP Internal Coding Standard v2.1
 *
 /***************************************************************************************************
 * 🧩 Dependencies:
 *  
 *
 /***************************************************************************************************
  * 📝 Documentation:
  * - Internal Wiki: https://tpbc.top/wiki/useNetworkStatus
  * - API Docs: https://tpbc.top/api-docs/hooks/useNetworkStatus
  * - Changelog: https://tpbc.top/changelogs/useNetworkStatus
  **************************************************************************************************/
// src/hooks/useNetworkStatus.ts
'use client';

import { useEffect, useRef, useState } from 'react';

export type NetworkMetrics = {
  online: boolean;
  effectiveType?: string; // chất lượng mạng (4g/3g/2g/slow-2g)
  downlink?: number; // Mbps (ước lượng)
  rtt?: number; // ms (ước lượng)
  saveData?: boolean;
  type?: string; // 'wifi' | 'cellular' | ... (thường undefined)
  timestamp: number; // thời điểm cập nhật cuối
};

/** Đọc connection từ Network Information API (nếu có). */
function readConnectionSafe(): Partial<NetworkMetrics> {
  // Một số trình duyệt không có navigator.connection (Safari/iOS)
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const conn: any =
    nav && ((nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection);

  if (!conn) return {};
  const { effectiveType, downlink, rtt, saveData, type } = conn;
  return { effectiveType, downlink, rtt, saveData, type };
}

/** So sánh shallow để tránh setState thừa. */
function shallowEqual(a: Partial<NetworkMetrics>, b: Partial<NetworkMetrics>) {
  return (
    a.online === b.online &&
    a.effectiveType === b.effectiveType &&
    a.downlink === b.downlink &&
    a.rtt === b.rtt &&
    a.saveData === b.saveData &&
    a.type === b.type
  );
}

export default function useNetworkStatus() {
  /** Trạng thái an toàn cho SSR: KHÔNG có giá trị client-only ở initial render. */
  const [state, setState] = useState<NetworkMetrics>(() => ({
    online: true, // placeholder; sẽ cập nhật sau khi mount
    timestamp: 0, // 0 = chưa có dữ liệu client
  }));

  /** Giữ reference đến listener để cleanup. */
  const connRef = useRef<any>(null);

  useEffect(() => {
    // Sau khi mount ở client mới đọc network
    const nav = navigator;
    const base: Partial<NetworkMetrics> = {
      online: nav.onLine,
      ...readConnectionSafe(),
    };

    setState(prev => {
      const merged = { ...prev, ...base, timestamp: Date.now() };
      // Phát sự kiện lần đầu nếu có thay đổi thực sự
      if (!shallowEqual(prev, merged) && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('network:status', { detail: merged }));
      }
      return merged;
    });

    // Đăng ký online/offline
    const handleOnline = () => {
      const metrics = { online: true, ...readConnectionSafe() };
      setState(prev => {
        const next = { ...prev, ...metrics, timestamp: Date.now() };
        if (!shallowEqual(prev, next)) {
          window.dispatchEvent(new CustomEvent('network:status', { detail: next }));
        }
        return next;
      });
    };

    const handleOffline = () => {
      // Khi offline: xoá các chỉ số client-only để UI không hiển thị số cũ
      const metrics: Partial<NetworkMetrics> = {
        online: false,
        effectiveType: undefined,
        downlink: undefined,
        rtt: undefined,
        saveData: undefined,
        type: undefined,
      };
      setState(prev => {
        const next = { ...prev, ...metrics, timestamp: Date.now() };
        if (!shallowEqual(prev, next)) {
          window.dispatchEvent(new CustomEvent('network:status', { detail: next }));
        }
        return next;
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Đăng ký change event của Network Information API (nếu có)
    const conn: any =
      (nav as any).connection || (nav as any).mozConnection || (nav as any).webkitConnection;
    connRef.current = conn;

    const handleChange = () => {
      const metrics = { online: nav.onLine, ...readConnectionSafe() };
      setState(prev => {
        const next = { ...prev, ...metrics, timestamp: Date.now() };
        if (!shallowEqual(prev, next)) {
          window.dispatchEvent(new CustomEvent('network:status', { detail: next }));
        }
        return next;
      });
    };

    conn?.addEventListener?.('change', handleChange);

    // KHÔNG gọi handleChange() thêm lần nữa ở đây
    // vì ta đã cập nhật state/phát sự kiện ở block khởi tạo sau mount ở trên.

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      connRef.current?.removeEventListener?.('change', handleChange);
    };
  }, []);

  return { network: state };
}
